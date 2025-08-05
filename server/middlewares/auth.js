const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Role validation utility - ensures only valid roles are used
const validateRole = (role) => {
  const validRoles = ['student', 'mentor', 'admin'];
  if (!role || typeof role !== 'string') return 'student';
  
  const normalizedRole = role.toLowerCase().trim();
  return validRoles.includes(normalizedRole) ? normalizedRole : 'student';
};

// Enhanced JWT authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header - check both x-auth-token and Authorization
    let token = req.header('x-auth-token');
    
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        msg: 'No token provided, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh user data from database to ensure role is current
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    // Validate and ensure role is correct
    const validatedRole = validateRole(user.role);
    
    // Update user role in database if it was invalid
    if (user.role !== validatedRole) {
      await User.findByIdAndUpdate(user._id, { role: validatedRole });
    }
    
    // Attach user to request with validated role
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: validatedRole,
      university: user.university,
      domain: user.domain
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid token format' 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        msg: 'Token has expired' 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      msg: 'Token verification failed' 
    });
  }
};

// Role-based authorization middleware factory
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        msg: 'Authentication required' 
      });
    }

    // Normalize allowed roles
    const normalizedAllowedRoles = allowedRoles.map(role => 
      validateRole(role)
    );

    // Check if user has required role
    if (!normalizedAllowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        msg: `Access denied. Required roles: ${normalizedAllowedRoles.join(', ')}. Your role: ${req.user.role}`,
        userRole: req.user.role,
        requiredRoles: normalizedAllowedRoles
      });
    }

    next();
  };
};

// Specific role middleware shortcuts
const requireAdmin = authorize('admin');
const requireMentor = authorize('mentor', 'admin');
const requireStudent = authorize('student', 'mentor', 'admin');

// Legacy verifyToken function for backward compatibility
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      msg: 'No token provided' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user and validate role
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        msg: 'User not found' 
      });
    }

    req.user = {
      id: user._id,
      role: validateRole(user.role),
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      msg: 'Invalid token' 
    });
  }
};

module.exports = {
  auth,
  authorize,
  requireAdmin,
  requireMentor,
  requireStudent,
  verifyToken,
  validateRole
};
