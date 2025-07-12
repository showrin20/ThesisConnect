const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// Only admin can access this
router.get('/admin', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.json({ msg: 'Welcome, Admin!' });
});
ç
// Admin OR Supervisor can access this
router.get('/manage', verifyToken, authorizeRoles('admin', 'supervisor'), (req, res) => {
  res.json({ msg: 'Management dashboard' });
});

// Any logged in user
router.get('/me', verifyToken, (req, res) => {
  res.json({ msg: `Hello, ${req.user.role}` });
});

module.exports = router;
