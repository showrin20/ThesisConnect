const express = require('express');
const router = express.Router();
const { auth, authorize, requireMentor, requireAdmin, validateRole } = require('../middlewares/auth');
const User = require('../models/User');

// Test route to check authentication
router.get('/test', auth, (req, res) => {
  res.json({
    success: true,
    msg: 'Authentication successful',
    user: {
      id: req.user.id,
      role: req.user.role,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Mentor area - accessible by mentors and admins
router.get('/mentor-area', auth, authorize('mentor', 'admin'), (req, res) => {
  res.json({
    success: true,
    msg: 'Welcome Mentor!',
    data: {
      message: 'You have access to the mentor dashboard',
      userRole: req.user.role,
      features: [
        'View student requests',
        'Manage mentorship sessions',
        'Access research resources',
        'Create mentor announcements'
      ]
    }
  });
});

// Admin area - accessible only by admins
router.get('/admin-area', auth, requireAdmin, (req, res) => {
  res.json({
    success: true,
    msg: 'Welcome Admin!',
    data: {
      message: 'You have full administrative access',
      userRole: req.user.role,
      features: [
        'User management',
        'System configuration',
        'Analytics dashboard',
        'Role assignments',
        'Platform moderation'
      ]
    }
  });
});

// Student area - accessible by all authenticated users
router.get('/student-area', auth, (req, res) => {
  res.json({
    success: true,
    msg: 'Welcome to the student area!',
    data: {
      message: 'Access to student resources',
      userRole: req.user.role,
      features: [
        'Find mentors',
        'Browse research projects',
        'Join collaborations',
        'Access learning materials'
      ]
    }
  });
});

// 🔐 Legacy Admin-only dashboard (keep for backward compatibility)
router.get('/admin', auth, requireAdmin, (req, res) => {
  res.json({ 
    success: true,
    msg: 'Welcome to the Admin Dashboard!',
    userRole: req.user.role 
  });
});

// 🧑‍🏫 Legacy Mentor-only dashboard (keep for backward compatibility)
router.get('/mentor', auth, authorize('mentor', 'admin'), (req, res) => {
  res.json({ 
    success: true,
    msg: 'Welcome to the Mentor Dashboard!',
    userRole: req.user.role 
  });
});

// 🛠 Admin or Mentor - shared management area
router.get('/manage', auth, authorize('admin', 'mentor'), (req, res) => {
  res.json({ 
    success: true,
    msg: 'Access to Management Area (Admin or Mentor)',
    userRole: req.user.role 
  });
});

// 🙋 Any logged-in user
router.get('/me', auth, (req, res) => {
  res.json({ 
    success: true,
    msg: `Hello, ${req.user.role}`, 
    user: req.user 
  });
});

// Role management routes (admin only)
router.patch('/users/:userId/role', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    // Validate the new role
    const validatedRole = validateRole(role);
    
    // Prevent admins from demoting themselves
    if (req.user.id === userId && req.user.role === 'admin' && validatedRole !== 'admin') {
      return res.status(400).json({
        success: false,
        msg: 'Cannot demote yourself from admin role'
      });
    }

    // Update user role
    const user = await User.findByIdAndUpdate(
      userId, 
      { role: validatedRole }, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }

    res.json({
      success: true,
      msg: `User role updated to ${validatedRole}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error updating user role'
    });
  }
});

// Get all users (admin only)
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        domain: user.domain,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error fetching users'
    });
  }
});

// Get current user's role and permissions
router.get('/me/permissions', auth, (req, res) => {
  const permissions = {
    student: ['read_projects', 'create_projects', 'read_publications'],
    mentor: ['read_projects', 'create_projects', 'read_publications', 'mentor_students', 'moderate_content'],
    admin: ['*'] // All permissions
  };

  res.json({
    success: true,
    user: {
      id: req.user.id,
      role: req.user.role,
      name: req.user.name,
      email: req.user.email
    },
    permissions: permissions[req.user.role] || permissions.student
  });
});

module.exports = router;
