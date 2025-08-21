const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'contentModel',
    required: true
  },
  // Dynamic reference based on content type
  contentModel: {
    type: String,
    required: true,
    enum: ['Project', 'Publication', 'Blog', 'CommunityPost'],
    default: 'Project'
  },
  type: {
    type: String,
    default: 'project',
    enum: ['project', 'publication', 'blog', 'community', 'other']
  },
  projectTitle: {
    type: String,
    required: true
  },
  projectDescription: {
    type: String,
    required: false,
    default: ''
  },
  // Additional metadata for search and filtering
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    default: ''
  },
  lastVisited: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // adds createdAt and updatedAt fields automatically
});

// Method to update lastVisited timestamp
bookmarkSchema.methods.updateLastVisited = function() {
  this.lastVisited = Date.now();
  return this.save();
};

// Create indexes for better query performance
bookmarkSchema.index({ user: 1, type: 1 });
bookmarkSchema.index({ user: 1, projectId: 1 }, { unique: true });
bookmarkSchema.index({ projectTitle: 'text', projectDescription: 'text' });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
