const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

const blogSchema = new mongoose.Schema(
  {
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
      validate: [
        {
          validator: function (arr) {
            return arr.every(tag => typeof tag === 'string' && tag.length <= 30);
          },
          message: 'Each tag must be a string and no longer than 30 characters.'
        },
        {
          validator: function (arr) {
            return arr.length <= 10;
          },
          message: 'Cannot have more than 10 tags.'
        },
        {
          validator: function (arr) {
            const uniqueTags = new Set(arr.map(tag => tag.toLowerCase()));
            return uniqueTags.size === arr.length;
          },
          message: 'Duplicate tags are not allowed.'
        }
      ]
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
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow null/undefined
          return /^(https?:\/\/|\/uploads\/)/.test(v);
        },
        message: 'Featured image must be a valid URL or upload path.'
      }
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required.']
    },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    readTime: {
      type: Number,
      default: 1
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true } // Include virtuals in JSON output
  }
);

// Virtual for isPublished
blogSchema.virtual('isPublished').get(function () {
  return this.status === 'published';
});

// Pre-save hook for sanitization and readTime
blogSchema.pre('save', function (next) {
  // Sanitize HTML inputs
  if (this.isModified('title')) {
    this.title = sanitizeHtml(this.title, { allowedTags: [], allowedAttributes: {} });
  }
  if (this.isModified('content')) {
    this.content = sanitizeHtml(this.content, {
      allowedTags: ['p', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'code', 'pre'],
      allowedAttributes: { a: ['href'], code: ['class'], pre: ['class'] }
    });
    // Update readTime
    const wordCount = this.content ? this.content.split(/\s+/).filter(word => word.length > 0).length : 0;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  if (this.isModified('excerpt') && this.excerpt) {
    this.excerpt = sanitizeHtml(this.excerpt, { allowedTags: [], allowedAttributes: {} });
  }

  // Normalize tags to lowercase and trim
  if (this.isModified('tags')) {
    this.tags = this.tags.map(tag => tag.trim().toLowerCase());
  }

  next();
});

// Pre-validate hook to ensure category is stored capitalized
blogSchema.pre('validate', function (next) {
  if (this.isModified('category') && this.category) {
    this.category = this.category.charAt(0).toUpperCase() + this.category.slice(1).toLowerCase();
  }
  next();
});

// Indexes for performance
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ status: 1 });
blogSchema.index({ category: 1 });

module.exports = mongoose.model('Blog', blogSchema);