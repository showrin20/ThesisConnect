const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
  postId: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['collab', 'general'], required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

  title: { 
    type: String, 
    required: function () { return this.type === 'collab'; } 
  },
  content: { type: String, required: true },

  skillsNeeded: {
    type: [String],
    required: function () { return this.type === 'collab'; },
    default: []
  },

  status: {
    type: String,
    enum: ['open', 'closed', 'in-progress'],
    required: function () { return this.type === 'collab'; },
  },

  tags: { type: [String], default: [] },

  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  comments: [{
    commentId: { type: String, required: true },
    text: { type: String, required: true, maxLength: 500 },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

// Useful indexes for faster queries
CommunityPostSchema.index({ type: 1 });
CommunityPostSchema.index({ tags: 1 });
CommunityPostSchema.index({ authorId: 1 });

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);
