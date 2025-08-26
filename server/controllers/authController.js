const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRole } = require('../middlewares/auth');

// Password validation function
const validatePasswordStrength = (password) => {
  if (!password) return false;
  
  // Check all criteria separately for better feedback
  const hasMinLength = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  // Calculate strength score (0-5)
  const score = [hasMinLength, hasLowercase, hasUppercase, hasDigit, hasSpecial]
    .filter(Boolean).length;
  
  // Require at least 4 out of 5 criteria to be met
  return score >= 4;
};

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
    role, 
  } = req.body;

  try {
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        msg: 'Name, email, and password are required' 
      });
    }
    
    // Password strength validation
    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        success: false,
        msg: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        msg: 'User already exists' 
      });
    }

    // Validate and normalize role
    const validatedRole = validateRole(role);

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
      role: validatedRole, // Use validated role
    });

    await user.save();

    // Create JWT with validated role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Extended expiry
    );

    // Respond
    res.status(201).json({
      success: true,
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
      return res.status(400).json({ 
        success: false,
        msg: 'Validation error: ' + err.message 
      });
    }

    res.status(500).json({ 
      success: false,
      msg: 'Server error during registration' 
    });
  }
};

// LOGIN CONTROLLER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        msg: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid credentials' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid credentials' 
      });
    }

    // Validate role before creating token
    const validatedRole = validateRole(user.role);
    
    // Update user role if it was invalid and update last login
    await User.findByIdAndUpdate(user._id, { 
      role: validatedRole,
      lastLogin: new Date()
    });
    user.role = validatedRole;

    // Create JWT with validated role
    const token = jwt.sign(
      { id: user._id, role: validatedRole },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respond
    res.json({
      success: true,
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
        role: validatedRole,
      },
    });
  } catch (err) {
    console.error('🔴 Login error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      error: err,
    });

    res.status(500).json({ 
      success: false,
      msg: 'Server error during login' 
    });
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
