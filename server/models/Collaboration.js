const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false // Optional for general collaboration requests
  },
  message: {
    type: String,
    default: 'Would like to collaborate with you!'
  },
  responseMessage: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
});

// Ensure unique collaboration requests per project
collaborationSchema.index({ requester: 1, recipient: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('Collaboration', collaborationSchema);