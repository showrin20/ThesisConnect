const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  replyId: { type: String, required: true, unique: true },
  authorId: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

const CommunityPostSchema = new mongoose.Schema({
  postId: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['collab', 'general'], required: true },
  authorId: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false }, // Reference to Project model
  title: { type: String, required: function() { return this.type === 'collab'; } },
  content: { type: String, required: true },
  skillsNeeded: {
    type: [String],
    required: function() { return this.type === 'collab'; },
    default: undefined,
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'in-progress'],
    required: function() { return this.type === 'collab'; },
  },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, default: Date.now },
  tags: { type: [String], default: [] },
  likes: { type: Number, default: 0 },
  replies: { type: [ReplySchema], default: [] },
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);
