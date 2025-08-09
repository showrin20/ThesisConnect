const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required.'],
    trim: true,
    maxlength: [150, 'Title cannot be longer than 150 characters.']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required.'],
    minlength: [20, 'Content must be at least 20 characters long.']
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [300, 'Excerpt cannot be longer than 300 characters.']
  },
  category: {
    type: String,
    enum: {
      values: ['Research', 'Technology', 'Academia', 'Tutorial', 'Opinion', 'News', 'Review', 'Personal'],
      message: 'Category must be one of: Research, Technology, Academia, Tutorial, Opinion, News, Review, Personal.'
    },
    default: 'Technology'
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.every(tag => typeof tag === 'string');
      },
      message: 'All tags must be strings.'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'archived'],
      message: 'Status must be either draft, published, or archived.'
    },
    default: 'draft'
  },
  featuredImage: {
    type: String,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required.']
  },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  readTime: {
    type: Number,
    default: function () {
      const wordCount = this.content ? this.content.split(/\s+/).length : 0;
      return Math.max(1, Math.ceil(wordCount / 200));
    }
  },
  isPublished: {
    type: Boolean,
    default: function () {
      return this.status === 'published';
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

blogSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
