const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Publication = require('../models/publicationSchema');

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

// Get users with filtering options
router.get('/', async (req, res) => {
  try {
    const { role, search, department, university, limit } = req.query;
    
    // Build query object
    let query = {};
    
    // Filter by role if specified
    if (role) {
      query.role = role; // This will filter for students when role=student
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Additional filters
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }
    
    if (university) {
      query.university = { $regex: university, $options: 'i' };
    }
    
    // Execute query
    let userQuery = User.find(query).select('-password');
    
    // Apply limit if specified
    if (limit) {
      userQuery = userQuery.limit(parseInt(limit));
    }
    
    // Sort by creation date (newest first)
    userQuery = userQuery.sort({ createdAt: -1 });
    
    const users = await userQuery;
    
    res.json({ 
      success: true, 
      count: users.length, 
      data: users 
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Server error', 
      error: err.message 
    });
  }
});

// Get all students specifically (alternative endpoint)
router.get('/students', async (req, res) => {
  try {
    const { search, department, university, limit, skills } = req.query;
    
    // Base query for students
    let query = { role: 'student' };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Additional filters
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }
    
    if (university) {
      query.university = { $regex: university, $options: 'i' };
    }
    
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }
    
    // Execute query
    let studentQuery = User.find(query).select('-password');
    
    // Apply limit if specified
    if (limit) {
      studentQuery = studentQuery.limit(parseInt(limit));
    }
    
    // Sort by creation date (newest first)
    studentQuery = studentQuery.sort({ createdAt: -1 });
    
    const students = await studentQuery;
    
    res.json({ 
      success: true, 
      count: students.length, 
      data: students 
    });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Server error', 
      error: err.message 
    });
  }
});

// Get user statistics
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user's projects
    const projects = await Project.find({ creator: userId });
    
    // Get user's publications
    const publications = await Publication.find({ creator: userId });
    
    // Count projects by status
    const projectStats = projects.reduce((acc, project) => {
      const status = project.status || 'Planned';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Count total collaborators from all projects
    const allCollaborators = new Set();
    projects.forEach(project => {
      if (project.collaborators && Array.isArray(project.collaborators)) {
        project.collaborators.forEach(collaborator => {
          if (collaborator && collaborator.trim()) {
            allCollaborators.add(collaborator.trim());
          }
        });
      }
    });
    
    // Count publications by type
    const publicationStats = publications.reduce((acc, pub) => {
      const type = pub.type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const stats = {
      projects: {
        total: projects.length,
        planned: projectStats['Planned'] || 0,
        inProgress: projectStats['In Progress'] || 0,
        completed: projectStats['Completed'] || 0
      },
      publications: {
        total: publications.length,
        byType: publicationStats,
        totalCitations: publications.reduce((sum, pub) => sum + (pub.citations || 0), 0)
      },
      collaborators: {
        total: allCollaborators.size
      },
      activity: {
        recentProjects: projects.slice(-5).reverse(),
        recentPublications: publications.slice(-5).reverse()
      }
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Get user stats error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: 'User not found' 
      });
    }
    res.json({ 
      success: true, 
      data: user 
    });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ 
      success: false, 
      msg: 'Server error' 
    });
  }
});

module.exports = router;