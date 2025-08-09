const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, 'Associated blog is required.']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required.']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required.'],
    trim: true,
    minlength: [1, 'Comment cannot be empty.'],
    maxlength: [2000, 'Comment cannot be longer than 2000 characters.']
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

commentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
