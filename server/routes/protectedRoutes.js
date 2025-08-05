const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// 🔐 Admin-only dashboard
router.get('/admin', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.json({ msg: 'Welcome to the Admin Dashboard!' });
});

// 🧑‍🏫 Mentor-only dashboard
router.get('/mentor', verifyToken, authorizeRoles('mentor'), (req, res) => {
  res.json({ msg: 'Welcome to the Mentor Dashboard!' });
});

// 🛠 Admin or Mentor - shared management area
router.get('/manage', verifyToken, authorizeRoles('admin', 'mentor'), (req, res) => {
  res.json({ msg: 'Access to Management Area (Admin or Mentor)' });
});

// 🙋 Any logged-in user
router.get('/me', verifyToken, (req, res) => {
  res.json({ 
    msg: `Hello, ${req.user.role}`, 
    user: req.user 
  });
});

module.exports = router;
