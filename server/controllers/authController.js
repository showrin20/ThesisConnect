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
    linkedinLink,
    website,
    keywords = [],
    bio,
    phone,
    location,
    researchInterests,
    currentPosition,
    yearsOfExperience,
    role = 'student', 
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
      linkedinLink,
      website,
      keywords: Array.isArray(keywords) ? keywords : [],
      bio,
      phone,
      location,
      researchInterests,
      currentPosition,
      yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : 0,
      role: ['admin', 'student', 'supervisor'].includes(role) ? role : 'student',
    });

    await user.save();

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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
        linkedinLink: user.linkedinLink,
        website: user.website,
        keywords: user.keywords,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        researchInterests: user.researchInterests,
        currentPosition: user.currentPosition,
        yearsOfExperience: user.yearsOfExperience,
        role: user.role,
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
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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
        linkedinLink: user.linkedinLink,
        website: user.website,
        keywords: user.keywords,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        researchInterests: user.researchInterests,
        currentPosition: user.currentPosition,
        yearsOfExperience: user.yearsOfExperience,
        role: user.role,
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

// LOGOUT CONTROLLER
exports.logout = async (req, res) => {
  try {
   
    
    res.json({
      success: true,
      msg: 'Logged out successfully'
    });
  } catch (err) {
    console.error('🔴 Logout error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      error: err,
    });

    res.status(500).json({ msg: 'Server error during logout' });
  }
};

// GET USER PROFILE CONTROLLER
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      domain: user.domain,
      scholarLink: user.scholarLink,
      githubLink: user.githubLink,
      linkedinLink: user.linkedinLink,
      website: user.website,
      keywords: user.keywords,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      researchInterests: user.researchInterests,
      currentPosition: user.currentPosition,
      yearsOfExperience: user.yearsOfExperience,
      role: user.role,
    });
  } catch (err) {
    console.error('🔴 Get profile error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// UPDATE USER PROFILE CONTROLLER
exports.updateProfile = async (req, res) => {
  try {
    const {
      email,
      university,
      domain,
      scholarLink,
      githubLink,
      linkedinLink,
      website,
      keywords = [],
      bio,
      phone,
      location,
      researchInterests,
      currentPosition,
      yearsOfExperience,
    } = req.body;

    // Find and update user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }

    // Update user fields (excluding name as per requirement)
    if (email !== undefined) user.email = email;
    if (university !== undefined) user.university = university;
    if (domain !== undefined) user.domain = domain;
    if (scholarLink !== undefined) user.scholarLink = scholarLink;
    if (githubLink !== undefined) user.githubLink = githubLink;
    if (linkedinLink !== undefined) user.linkedinLink = linkedinLink;
    if (website !== undefined) user.website = website;
    if (Array.isArray(keywords)) user.keywords = keywords;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (researchInterests !== undefined) user.researchInterests = researchInterests;
    if (currentPosition !== undefined) user.currentPosition = currentPosition;
    if (yearsOfExperience !== undefined) user.yearsOfExperience = Number(yearsOfExperience) || 0;

    await user.save();

    res.json({
      msg: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        domain: user.domain,
        scholarLink: user.scholarLink,
        githubLink: user.githubLink,
        linkedinLink: user.linkedinLink,
        website: user.website,
        keywords: user.keywords,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        researchInterests: user.researchInterests,
        currentPosition: user.currentPosition,
        yearsOfExperience: user.yearsOfExperience,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('🔴 Update profile error:', err);
    res.status(500).json({ msg: 'Server error during profile update' });
  }
};
