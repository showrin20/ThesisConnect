const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  type: { 
    type: String, 
    required: true,
    enum: ['conference', 'journal', 'publication']
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 300
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  date: { 
    type: Date,
    default: Date.now
  },
  externalLink: { 
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty string
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  likes: { 
    type: Number, 
    default: 0,
    min: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: { 
    type: Number, 
    default: 0,
    min: 0
  },
  views: { 
    type: Number, 
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
forumSchema.index({ author: 1, createdAt: -1 });
forumSchema.index({ type: 1 });
forumSchema.index({ tags: 1 });
forumSchema.index({ title: 'text', description: 'text' });
forumSchema.index({ date: 1 });
forumSchema.index({ likes: -1 });

// Virtual for formatted date
forumSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to increment views
forumSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get popular posts
forumSchema.statics.getPopularPosts = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ likes: -1, views: -1 })
    .limit(limit)
    .populate('author', 'name email university');
};

// Static method to get recent posts
forumSchema.statics.getRecentPosts = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'name email university');
};

module.exports = mongoose.model('Forum', forumSchema);