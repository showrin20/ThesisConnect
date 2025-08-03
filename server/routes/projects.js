const express = require('express');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');

const router = express.Router();

const auth = (req, res, next) => {
  let token = req.header('x-auth-token');
  
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
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

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ 
        success: false,
        msg: 'Title and description are required' 
      });
    }

    const project = new Project({
      title,
      description,
      tags: Array.isArray(tags) ? tags : [],
      creator: req.user.id,
    });
    
    await project.save();
    
    // Populate creator info before sending response
    await project.populate('creator', 'name email university');
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while creating project',
      error: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('creator', 'name email university')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while fetching projects',
      error: error.message
    });
  }
});

router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ creator: req.user.id })
      .populate('creator', 'name email university')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while fetching your projects',
      error: error.message
    });
  }
});

module.exports = router;