const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getProfile, 
  updateProfile, 
  googleLogin, 
  forgotPassword,
  resetPassword 
} = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/logout', logout);
router.get('/me', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;