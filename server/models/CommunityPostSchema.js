const mongoose = require('mongoose');

// Community Post Schema WITHOUT replies
const CommunityPostSchema = new mongoose.Schema({
  postId: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['collab', 'general'], required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

  title: { type: String, required: function () { return this.type === 'collab'; } },
  content: { type: String, required: true },

  skillsNeeded: {
    type: [String],
    required: function () { return this.type === 'collab'; }
  },

  status: {
    type: String,
    enum: ['open', 'closed', 'in-progress'],
    required: function () { return this.type === 'collab'; },
  },

  tags: { type: [String], default: [] },
  likes: { type: Number, default: 0 },

}, {
  timestamps: true
});

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);
