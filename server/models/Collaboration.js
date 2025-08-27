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

// Create a compound index that considers status
// This allows multiple requests between same users for same project 
// as long as they don't have multiple active (non-declined) requests
collaborationSchema.index({ 
  requester: 1, 
  recipient: 1, 
  projectId: 1, 
  status: 1 
});

// Create a unique index that only applies to non-declined requests
// This allows new requests after a request has been declined
collaborationSchema.index(
  { 
    requester: 1, 
    recipient: 1, 
    projectId: 1,
  },
  { 
    unique: true,
    partialFilterExpression: { status: { $ne: 'declined' } }
  }
);

module.exports = mongoose.model('Collaboration', collaborationSchema);