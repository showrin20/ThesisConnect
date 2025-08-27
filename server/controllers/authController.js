const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { validateRole } = require('../middlewares/auth');

// Check if nodemailer is available
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (err) {
  console.warn('Nodemailer not installed. Email functionality will be limited.');
}

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

// GOOGLE LOGIN/SIGNUP CONTROLLER
exports.googleLogin = async (req, res) => {
  try {
    const { token, email, name, picture, role } = req.body;
    
    if (!token || !email) {
      return res.status(400).json({ 
        success: false,
        msg: 'Google token and email are required' 
      });
    }
    
    // Validate and normalize role
    const validatedRole = validateRole(role || 'student');

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists - login
      // Update picture if provided and not already set
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    } else {
      // User doesn't exist - register
      user = new User({
        name: name || email.split('@')[0],
        email,
        profilePicture: picture,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), 10),
        googleId: token,
        role: validatedRole,
        isGoogleAccount: true
      });
      
      await user.save();
    }

    // Create JWT
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respond
    res.json({
      success: true,
      token: jwtToken,
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
        profilePicture: user.profilePicture
      },
    });
  } catch (err) {
    console.error('🔴 Google login error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      error: err,
    });

    res.status(500).json({ 
      success: false,
      msg: 'Server error during Google authentication' 
    });
  }
};

// FORGOT PASSWORD CONTROLLER
exports.forgotPassword = async (req, res) => {

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        msg: 'Email is required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    // Don't reveal if user exists or not for security reasons
    if (!user) {
      return res.json({ 
        success: true, 
        msg: 'If that email exists in our system, we have sent a password reset link.'
      });
    }

    // Check if user is a Google account
    if (user.isGoogleAccount) {
      return res.status(400).json({
        success: false,
        msg: 'This account uses Google authentication. Please use the "Sign in with Google" option.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Check if nodemailer is available
    if (nodemailer) {
      try {
        // Configure email transporter
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: process.env.EMAIL_PORT || 587,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        // Email options
        const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: 'ThesisConnect - Password Reset',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <h2 style="color: #4f46e5; text-align: center;">ThesisConnect Password Reset</h2>
              <p>Hello ${user.name},</p>
              <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
              <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
              </div>
              <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
              <p>Best regards,<br>The ThesisConnect Team</p>
              <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
              <p style="font-size: 12px; color: #777; text-align: center;">
                If you're having trouble clicking the button, copy and paste this URL into your web browser:
                <br><a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a>
              </p>
            </div>
          `
        };

        console.log('Attempting to send email to:', user.email);
        
        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        console.log('Preview URL:', nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : 'No preview URL available');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        console.error('Email configuration used:', {
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          user: process.env.EMAIL_USER ? '✓ Set' : '✗ Missing',
          pass: process.env.EMAIL_PASS ? '✓ Set' : '✗ Missing',
          from: process.env.EMAIL_FROM
        });
        // Continue execution even if email fails
      }
    } else {
      console.log('Password reset token generated for', user.email);
      console.log('Reset URL:', resetUrl);
    }

    res.json({ 
      success: true, 
      msg: 'If that email exists in our system, we have sent a password reset link.'
    });

  } catch (err) {
    console.error('🔴 Forgot password error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      error: err,
    });

    res.status(500).json({ 
      success: false,
      msg: 'Server error during password reset request' 
    });
  }
};

// RESET PASSWORD CONTROLLER
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({
        success: false,
        msg: 'Reset token and new password are required'
      });
    }

    // Password strength validation
    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        success: false,
        msg: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: 'Password reset token is invalid or has expired'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      msg: 'Password has been successfully reset. You can now login with your new password.'
    });

  } catch (err) {
    console.error('🔴 Reset password error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      error: err,
    });

    res.status(500).json({
      success: false,
      msg: 'Server error during password reset'
    });
  }
};
