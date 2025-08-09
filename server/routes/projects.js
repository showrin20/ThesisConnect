const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');

const router = express.Router();

//////////////////////////
// 📁 FILE UPLOAD SETUP
//////////////////////////
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-userId-originalname
    const uniqueName = `${Date.now()}-${req.user.id}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

//////////////////////////
// 🔐 AUTH MIDDLEWARE
//////////////////////////
const auth = (req, res, next) => {
  let token = req.header('x-auth-token') || '';

  const authHeader = req.header('Authorization');
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

//////////////////////////
// 🔗 URL VALIDATION UTIL
//////////////////////////
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

//////////////////////////
// 📌 CREATE PROJECT
//////////////////////////
router.post('/', auth, upload.single('thesisPdf'), async (req, res) => {
  try {
    const { title, description, link, tags, status, collaborators, thesisDraft } = req.body;

    if (!title || !description) {
      return res.status(400).json({ msg: 'Title and description are required' });
    }

    // Parse thesisDraft if it's a string (from FormData)
    let parsedThesisDraft = {};
    if (thesisDraft) {
      try {
        parsedThesisDraft = typeof thesisDraft === 'string' ? JSON.parse(thesisDraft) : thesisDraft;
      } catch (error) {
        console.error('Failed to parse thesisDraft:', error);
      }
    }

    // Validate that either link OR thesis draft is provided
    const hasLink = link && link.trim();
    const hasThesisDraft = req.file || (parsedThesisDraft.externalLink && parsedThesisDraft.externalLink.trim());
    
    if (!hasLink && !hasThesisDraft) {
      return res.status(400).json({ msg: 'Either project link or thesis draft is required' });
    }

    // Validate URLs if provided
    if (hasLink && !isValidURL(link)) {
      return res.status(400).json({ msg: 'Invalid project link URL' });
    }

    if (parsedThesisDraft.externalLink && !isValidURL(parsedThesisDraft.externalLink)) {
      return res.status(400).json({ msg: 'Invalid thesis draft external link URL' });
    }

    // Prepare thesis draft data
    let thesisDraftData = {};
    if (req.file) {
      // File was uploaded
      thesisDraftData = {
        pdfUrl: `/uploads/${req.file.filename}`,
        pdfFileName: req.file.originalname,
        pdfSize: req.file.size,
        description: parsedThesisDraft.description || '',
        uploadedAt: new Date()
      };
    } else if (parsedThesisDraft.externalLink) {
      // External link provided
      thesisDraftData = {
        externalLink: parsedThesisDraft.externalLink,
        description: parsedThesisDraft.description || '',
        uploadedAt: new Date()
      };
    }

    const project = new Project({
      title,
      description,
      link: link || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      status: status || 'Planned',
      collaborators: Array.isArray(collaborators) ? collaborators : [],
      creator: req.user.id,
      thesisDraft: Object.keys(thesisDraftData).length > 0 ? thesisDraftData : undefined
    });

    await project.save();
    await project.populate('creator', 'name email university');

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Create project error:', error);
    
    // Clean up uploaded file if project creation failed
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up uploaded file:', unlinkError);
      }
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: 'File size too large. Maximum size is 10MB.' });
    }
    
    res.status(500).json({ msg: 'Server error while creating project', error: error.message });
  }
});

//////////////////////////
// � SERVE UPLOADED FILES
//////////////////////////
router.get('/uploads/:filename', auth, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ msg: 'File not found' });
  }
  
  // Set headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  
  // Send file
  res.sendFile(filePath);
});

//////////////////////////
// �📌 GET ALL PROJECTS
//////////////////////////
router.get('/', async (_req, res) => {
  try {
    const projects = await Project.find()
      .populate('creator', 'name email university')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: projects.length, data: projects });
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


router.put('/:id', auth, async (req, res) => {
  const projectId = req.params.id;

  try {
    console.log('Update request for project ID:', projectId);

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ msg: 'Invalid project ID format' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.creator.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to update this project' });
    }

    const { title, description, link, tags, status, collaborators } = req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;

    if (link !== undefined) {
      if (!isValidURL(link)) {
        return res.status(400).json({ msg: 'Invalid project link URL' });
      }
      project.link = link;
    }

    if (tags !== undefined) project.tags = Array.isArray(tags) ? tags : [];
    if (status !== undefined) project.status = status;
    if (collaborators !== undefined) project.collaborators = Array.isArray(collaborators) ? collaborators : [];

    await project.save();
    await project.populate('creator', 'name email university');

    res.json({ success: true, msg: 'Project updated', data: project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ msg: 'Server error while updating project', error: error.message });
  }
});


router.delete('/:id', auth, async (req, res) => {
  const projectId = req.params.id;

  try {
    console.log('Delete request for project ID:', projectId);
    console.log('User ID:', req.user.id);

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ msg: 'Invalid project ID format' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.creator.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to delete this project' });
    }

    const deleteResult = await Project.deleteOne({ _id: projectId });
    if (deleteResult.deletedCount === 0) {
      return res.status(500).json({ msg: 'Failed to delete project' });
    }

    console.log('Project deleted successfully');
    res.json({ success: true, msg: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ msg: 'Server error while deleting project', error: error.message });
  }
});

module.exports = router;
