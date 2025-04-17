const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER CONTROLLER
exports.register = async (req, res) => {
  const {
    name,
    email,
    password,
    university,
    domain,
    scholarLink,
    githubLink,
    keywords = [],
  } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Name, email, and password are required' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    user = new User({
      name,
      email,
      password: hashedPassword,
      university,
      domain,
      scholarLink,
      githubLink,
      keywords,
    });

    await user.save();

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Respond
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        domain: user.domain,
        scholarLink: user.scholarLink,
        githubLink: user.githubLink,
        keywords: user.keywords,
      },
    });
  } catch (err) {
    console.error('🔴 Registration error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      error: err,
    });

    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation error: ' + err.message });
    }

    res.status(500).json({ msg: 'Server error during registration' });
  }
};

// LOGIN CONTROLLER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Respond
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        domain: user.domain,
        scholarLink: user.scholarLink,
        githubLink: user.githubLink,
        keywords: user.keywords,
      },
    });
  } catch (err) {
    console.error('🔴 Login error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      error: err,
    });

    res.status(500).json({ msg: 'Server error during login' });
  }
};
