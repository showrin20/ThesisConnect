const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Collaboration = require('../models/Collaboration');
const User = require('../models/User');

const router = express.Router();

// Test endpoint to check if collaboration routes are working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Collaboration routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Auth middleware
const auth = (req, res, next) => {
  let token = req.header('x-auth-token') || '';
  
  const authHeader = req.header('Authorization');
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token, authorization denied' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

// Send collaboration request
router.post('/request', auth, async (req, res) => {
  try {
    console.log('Collaboration request received:', req.body);
    console.log('User making request:', req.user);
    
    const { recipientId, message, projectId } = req.body;
    
    if (!recipientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient ID is required' 
      });
    }

    // Validate recipient ID
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid recipient ID' 
      });
    }

    // Validate projectId if provided
    if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project ID' 
      });
    }

    // Ensure projectId is either a valid ObjectId or null (not undefined)
    const finalProjectId = projectId || null;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }

    // Check if user is trying to send request to themselves
    if (req.user.id === recipientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot send collaboration request to yourself' 
      });
    }

    // Check if request already exists (for the same project or general)
    const existingRequest = await Collaboration.findOne({
      requester: req.user.id,
      recipient: recipientId,
      projectId: finalProjectId
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: finalProjectId ? 'Collaboration request for this project already exists' : 'Collaboration request already exists' 
      });
    }

    // Also check for any existing collaboration between these users (regardless of project)
    // This prevents spam and ensures clean collaboration history
    // const anyExistingCollaboration = await Collaboration.findOne({
    //   requester: req.user.id,
    //   recipient: recipientId
    // });

    // if (anyExistingCollaboration && anyExistingCollaboration.status === 'pending') {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: 'You already have a pending collaboration request with this user' 
    //   });
    // }

    // Create new collaboration request
    const collaboration = new Collaboration({
      requester: req.user.id,
      recipient: recipientId,
      projectId: finalProjectId,
      message: message || 'Would like to collaborate with you!',
      status: 'pending'
    });

    await collaboration.save();
    
    // Populate the collaboration with user details
    await collaboration.populate([
      { path: 'requester', select: 'name email university' },
      { path: 'recipient', select: 'name email university' }
    ]);

    res.status(201).json({ 
      success: true, 
      message: 'Collaboration request sent successfully',
      data: collaboration 
    });
  } catch (error) {
    // Handle MongoDB duplicate key errors specifically
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'A collaboration request already exists between these users for this project' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending collaboration request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Check collaboration status between current user and another user
router.get('/status/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID' 
      });
    }

    // Find collaboration between the two users
    const collaboration = await Collaboration.findOne({
      $or: [
        { requester: req.user.id, recipient: userId },
        { requester: userId, recipient: req.user.id }
      ]
    }).sort({ createdAt: -1 });

    let status = 'none';
    let data = null;

    if (collaboration) {
      // Determine the status from the current user's perspective
      if (collaboration.requester.toString() === req.user.id) {
        // Current user is the requester
        status = collaboration.status === 'pending' ? 'sent' : collaboration.status;
      } else {
        // Current user is the recipient
        status = collaboration.status === 'pending' ? 'pending' : collaboration.status;
      }
      data = collaboration;
    }

    res.json({ 
      success: true, 
      status,
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error while checking collaboration status' 
    });
  }
});

// Get all collaboration requests for current user
router.get('/requests', auth, async (req, res) => {
  try {
    const { type = 'all' } = req.query; // 'sent', 'received', 'all'
    
    let query = {};
    
    if (type === 'sent') {
      query.requester = req.user.id;
    } else if (type === 'received') {
      query.recipient = req.user.id;
    } else {
      query = {
        $or: [
          { requester: req.user.id },
          { recipient: req.user.id }
        ]
      };
    }

    const collaborations = await Collaboration.find(query)
      .populate('requester', 'name email university profileImage')
      .populate('recipient', 'name email university profileImage')
      .populate('projectId', 'title description')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: collaborations.length,
      data: collaborations 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching collaboration requests' 
    });
  }
});

// Get collaboration requests for a specific project
router.get('/project/:projectId/requests', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project ID' 
      });
    }

    const collaborations = await Collaboration.find({ projectId })
      .populate('requester', 'name email university profileImage')
      .populate('recipient', 'name email university profileImage')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: collaborations.length,
      data: collaborations 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching project collaboration requests' 
    });
  }
});

// Respond to collaboration request (accept/decline)
router.put('/respond/:collaborationId', auth, async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const { status, responseMessage } = req.body; // 'accepted' or 'declined' with optional responseMessage
    
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be "accepted" or "declined"' 
      });
    }

    const collaboration = await Collaboration.findById(collaborationId);
    
    if (!collaboration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Collaboration request not found' 
      });
    }

    // Check if current user is the recipient
    if (collaboration.recipient.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to respond to this request' 
      });
    }

    // Check if already responded
    if (collaboration.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Request has already been responded to' 
      });
    }

    // Update collaboration status and response message
    collaboration.status = status;
    collaboration.responseMessage = responseMessage || null;
    collaboration.respondedAt = new Date();
    await collaboration.save();

    // If accepted and has projectId, add collaborator to project
    if (status === 'accepted' && collaboration.projectId) {
      try {
        const Project = require('../models/Project');
        const project = await Project.findById(collaboration.projectId);
        
        if (project && !project.collaborators.includes(collaboration.recipient)) {
          project.collaborators.push(collaboration.recipient);
          await project.save();
        }
      } catch (projectError) {
        // Don't fail the collaboration response if project update fails
      }
    }

    await collaboration.populate([
      { path: 'requester', select: 'name email university' },
      { path: 'recipient', select: 'name email university' }
    ]);

    res.json({ 
      success: true, 
      message: `Collaboration request ${status}`,
      data: collaboration 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error while responding to collaboration request' 
    });
  }
});

// Cancel collaboration request (requester or recipient)
router.delete('/cancel/:collaborationId', auth, async (req, res) => {
  try {
    const { collaborationId } = req.params;
    
    const collaboration = await Collaboration.findById(collaborationId);
    
    if (!collaboration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Collaboration request not found' 
      });
    }

    // Check if current user is either requester or recipient
    const isRequester = collaboration.requester.toString() === req.user.id;
    const isRecipient = collaboration.recipient.toString() === req.user.id;

    if (!isRequester && !isRecipient) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to delete this request' 
      });
    }

    // // Only allow deletion of pending requests
    // if (collaboration.status !== 'pending' && ) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: 'Can only delete pending requests' 
    //   });
    // }

    await Collaboration.findByIdAndDelete(collaborationId);

    res.json({ 
      success: true, 
      message: 'Collaboration request deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting collaboration request' 
    });
  }
});


module.exports = router;