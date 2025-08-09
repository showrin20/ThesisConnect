const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  type: {
    type: String,
    default: 'project',
    enum: ['project', 'article', 'other'] // You can expand this list if needed
  },
  projectTitle: {
    type: String,
    required: true
  },
  projectDescription: {
    type: String,
    required: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);
