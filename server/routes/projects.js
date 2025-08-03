const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Project = require('../models/Project');

const router = express.Router();

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
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, link, tags, status, collaborators } = req.body;

    if (!title || !description || !link) {
      return res.status(400).json({ msg: 'Title, description, and project link are required' });
    }

    if (!isValidURL(link)) {
      return res.status(400).json({ msg: 'Invalid project link URL' });
    }

    const project = new Project({
      title,
      description,
      link,
      tags: Array.isArray(tags) ? tags : [],
      status: status || 'Planned',
      collaborators: Array.isArray(collaborators) ? collaborators : [],
      creator: req.user.id,
    });

    await project.save();
    await project.populate('creator', 'name email university');

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ msg: 'Server error while creating project', error: error.message });
  }
});

//////////////////////////
// 📌 GET ALL PROJECTS
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

//////////////////////////
// ✏️ UPDATE PROJECT
//////////////////////////
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

//////////////////////////
// ❌ DELETE PROJECT
//////////////////////////
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
