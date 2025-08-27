const express = require('express');
const router = express.Router();
const { register, login, logout, getProfile, updateProfile, googleLogin } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/logout', logout);
router.get('/me', auth, getProfile);
router.put('/profile', auth, updateProfile);




module.exports = router;