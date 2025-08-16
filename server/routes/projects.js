const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const User = require('../models/User');

const router = express.Router();

//////////////////////////
// 📁 FILE UPLOAD SETUP
//////////////////////////
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${req.user.id}-${file.originalname}`)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

//////////////////////////
// 🔐 AUTH MIDDLEWARE
//////////////////////////
const auth = (req, res, next) => {
  let token = req.header('x-auth-token') || '';
  const authHeader = req.header('Authorization');
  if (!token && authHeader?.startsWith('Bearer ')) token = authHeader.substring(7);
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

//////////////////////////
// 🔗 URL VALIDATION UTIL
//////////////////////////
const isValidURL = url => {
  try { new URL(url); return true; } catch { return false; }
};

//////////////////////////
// 📌 CREATE PROJECT
//////////////////////////
router.post('/', auth, upload.single('thesisPdf'), async (req, res) => {
  try {
    const { title, description, link, tags, status, collaborators, thesisDraft } = req.body;

    if (!title || !description)
      return res.status(400).json({ msg: 'Title and description are required' });

    let parsedThesisDraft = {};
    if (thesisDraft) {
      try { parsedThesisDraft = typeof thesisDraft === 'string' ? JSON.parse(thesisDraft) : thesisDraft; }
      catch (error) { console.error('Failed to parse thesisDraft:', error); }
    }

    const hasLink = link?.trim();
    const hasThesisDraft = req.file || parsedThesisDraft?.externalLink?.trim();
    if (!hasLink && !hasThesisDraft)
      return res.status(400).json({ msg: 'Either project link or thesis draft is required' });

    if (hasLink && !isValidURL(link))
      return res.status(400).json({ msg: 'Invalid project link URL' });
    if (parsedThesisDraft?.externalLink && !isValidURL(parsedThesisDraft.externalLink))
      return res.status(400).json({ msg: 'Invalid thesis draft external link URL' });

    let thesisDraftData = {};
    if (req.file) thesisDraftData = {
      pdfUrl: `/uploads/${req.file.filename}`,
      pdfFileName: req.file.originalname,
      pdfSize: req.file.size,
      description: parsedThesisDraft.description || '',
      uploadedAt: new Date(),
    };
    else if (parsedThesisDraft?.externalLink) thesisDraftData = {
      externalLink: parsedThesisDraft.externalLink,
      description: parsedThesisDraft.description || '',
      uploadedAt: new Date(),
    };

    // Ensure collaborators are valid registered users
    let validCollaborators = [];
    if (collaborators && Array.isArray(collaborators)) {
      validCollaborators = await User.find({ _id: { $in: collaborators } }).select('_id');
      validCollaborators = validCollaborators.map(u => u._id);
    }

    const project = new Project({
      title,
      description,
      link: link || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      status: status || 'Planned',
      collaborators: validCollaborators,
      creator: req.user.id,
      thesisDraft: Object.keys(thesisDraftData).length ? thesisDraftData : undefined,
    });

    await project.save();
    await project.populate('creator', 'name email university');

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Create project error:', error);
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (unlinkError) { console.error('Failed to cleanup uploaded file:', unlinkError); }
    }
    if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ msg: 'File size too large. Max 10MB.' });
    res.status(500).json({ msg: 'Server error while creating project', error: error.message });
  }
});

//////////////////////////
// 🔍 SEARCH COLLABORATORS
//////////////////////////
router.get('/search-collaborators', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ success: true, data: [] });

    const regex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }]
    }).limit(10).select('_id name email');

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Search collaborators error:', error);
    res.status(500).json({ msg: 'Server error while searching collaborators', error: error.message });
  }
});

//////////////////////////
// 📌 GET ALL PROJECTS
//////////////////////////
router.get('/', async (_req, res) => {
  try {
    const [projects, total] = await Promise.all([
      Project.find().populate('creator', 'name email university').sort({ createdAt: -1 }),
      Project.countDocuments()
    ]);

    res.json({ success: true, total, count: projects.length, data: projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ msg: 'Server error while fetching projects', error: error.message });
  }
});

//////////////////////////
// 📌 GET MY PROJECTS
//////////////////////////
router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ creator: req.user.id })
      .populate('creator', 'name email university')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({ msg: 'Server error while fetching your projects', error: error.message });
  }
});

//////////////////////////
// 📌 UPDATE PROJECT
//////////////////////////
router.put('/:id', auth, async (req, res) => {
  const projectId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ msg: 'Invalid project ID format' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.creator.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ msg: 'Unauthorized to update this project' });

    const { title, description, link, tags, status, collaborators } = req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (link !== undefined) {
      if (!isValidURL(link)) return res.status(400).json({ msg: 'Invalid project link URL' });
      project.link = link;
    }
    if (tags !== undefined) project.tags = Array.isArray(tags) ? tags : [];
    if (status !== undefined) project.status = status;

    // Ensure collaborators are valid registered users
    if (collaborators !== undefined && Array.isArray(collaborators)) {
      const validCollaborators = await User.find({ _id: { $in: collaborators } }).select('_id');
      project.collaborators = validCollaborators.map(u => u._id);
    }

    await project.save();
    await project.populate('creator', 'name email university');
    res.json({ success: true, msg: 'Project updated', data: project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ msg: 'Server error while updating project', error: error.message });
  }
});

//////////////////////////
// 📌 GET USER PROJECTS
//////////////////////////
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ msg: 'Invalid user ID format' });

    const projects = await Project.find({ creator: userId })
      .populate('creator', 'name email university')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ msg: 'Server error while fetching user projects', error: error.message });
  }
});

//////////////////////////
// 📌 DELETE PROJECT
//////////////////////////
router.delete('/:id', auth, async (req, res) => {
  const projectId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ msg: 'Invalid project ID format' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.creator.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ msg: 'Unauthorized to delete this project' });

    const deleteResult = await Project.deleteOne({ _id: projectId });
    if (deleteResult.deletedCount === 0) return res.status(500).json({ msg: 'Failed to delete project' });

    res.json({ success: true, msg: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ msg: 'Server error while deleting project', error: error.message });
  }
});

module.exports = router;
