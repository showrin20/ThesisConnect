const mongoose = require('mongoose');
const validator = require('validator');

// Project Schema
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  link: {
    type: String,
    trim: true,
    validate: {
      validator: (value) => !value || validator.isURL(value),
      message: 'Invalid project link URL',
    },
  },
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed'],
    default: 'Planned',
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async (userId) => {
        const user = await mongoose.model('User').findById(userId);
        return !!user; // Ensure user exists
      },
      message: 'Collaborator must be a registered user',
    },
  }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Thesis draft section
  thesisDraft: {
    pdfUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => {
          if (!value) return true;
          // ✅ Allow both full URLs and relative /uploads/ paths
          return (
            validator.isURL(value, { require_protocol: true }) ||
            value.startsWith('/Uploads/')
          );
        },
        message: 'Invalid PDF URL or file path',
      },
    },
    pdfFileName: { type: String, trim: true },
    pdfSize: { type: Number, min: 0 },
    externalLink: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => {
          if (!value) return true;
          // Only allow real URLs for externalLink
          return validator.isURL(value, { require_protocol: true });
        },
        message: 'Invalid external link URL',
      },
    },
    uploadedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1, min: 1 },
    description: { type: String, trim: true },
  },

  // ✅ Project Reviews (only mentors can add)
  reviews: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: async function (userId) {
          const user = await mongoose.model('User').findById(userId);
          return user && user.role === 'mentor'; // Only mentors allowed
        },
        message: 'Only mentors can leave reviews',
      },
    },
    comment: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
  }],

  createdAt: { type: Date, default: Date.now },
});

// Indexes for performance
projectSchema.index({ creator: 1 });
projectSchema.index({ collaborators: 1 });
projectSchema.index({ createdAt: -1 });

// Custom validation: Ensure at least one of link, pdfUrl, or externalLink is provided
projectSchema.pre('save', function (next) {
  const hasLink = this.link?.trim();
  const hasPdfUrl = this.thesisDraft?.pdfUrl?.trim();
  const hasExternalLink = this.thesisDraft?.externalLink?.trim();

  if (!hasLink && !hasPdfUrl && !hasExternalLink) {
    return next(new Error('Either project link or thesis draft (PDF upload or external link) is required'));
  }

  if (hasPdfUrl && (!this.thesisDraft.pdfFileName || !this.thesisDraft.pdfSize)) {
    return next(new Error('Thesis draft PDF requires file name and size'));
  }

  next();
});

// Method to increment thesis draft version
projectSchema.methods.incrementVersion = async function () {
  if (this.thesisDraft) {
    this.thesisDraft.version += 1;
    this.thesisDraft.uploadedAt = Date.now();
    await this.save();
  }
};

// ✅ Method to add review (enforces mentor-only)
projectSchema.methods.addReview = async function (userId, comment, rating) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);

  if (!user || user.role !== 'mentor') {
    throw new Error('Only mentors can add reviews');
  }

  this.reviews.push({ reviewer: userId, comment, rating });
  await this.save();
  return this;
};

module.exports = mongoose.model('Project', projectSchema);