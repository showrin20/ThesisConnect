const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Collaboration = require('../models/Collaboration');
const User = require('../models/User');

const router = express.Router();

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
    const { recipientId, message } = req.body;
    
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

    // Check if request already exists
    const existingRequest = await Collaboration.findOne({
      $or: [
        { requester: req.user.id, recipient: recipientId },
        { requester: recipientId, recipient: req.user.id }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Collaboration request already exists' 
      });
    }

    // Create new collaboration request
    const collaboration = new Collaboration({
      requester: req.user.id,
      recipient: recipientId,
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
    console.error('Send collaboration request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while sending collaboration request' 
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
    console.error('Check collaboration status error:', error);
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
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: collaborations.length,
      data: collaborations 
    });
  } catch (error) {
    console.error('Get collaboration requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching collaboration requests' 
    });
  }
});

// Respond to collaboration request (accept/decline)
router.put('/respond/:collaborationId', auth, async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const { status } = req.body; // 'accepted' or 'declined'
    
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

    // Update collaboration status
    collaboration.status = status;
    collaboration.respondedAt = new Date();
    await collaboration.save();

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
    console.error('Respond to collaboration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while responding to collaboration request' 
    });
  }
});

// Cancel collaboration request (requester only)
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

    // Check if current user is the requester
    if (collaboration.requester.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to cancel this request' 
      });
    }

    // Only allow cancellation of pending requests
    if (collaboration.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only cancel pending requests' 
      });
    }

    await Collaboration.findByIdAndDelete(collaborationId);

    res.json({ 
      success: true, 
      message: 'Collaboration request cancelled successfully' 
    });
  } catch (error) {
    console.error('Cancel collaboration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while cancelling collaboration request' 
    });
  }
});

module.exports = router;