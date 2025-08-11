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
  message: {
    type: String,
    default: 'Would like to collaborate with you!'
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

// Ensure unique collaboration requests
collaborationSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('Collaboration', collaborationSchema);