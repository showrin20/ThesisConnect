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


router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const users = await User.find({
      $or: [
        { domain: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } },
      ],
    }).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;