const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  university: String,
  domain: String,
  scholarLink: String,
  githubLink: String,
  linkedinLink: String,
  website: String,
  keywords: [String],
  bio: String,
  phone: String,
  location: String,
  researchInterests: String,
  currentPosition: String,
  yearsOfExperience: { type: Number, default: 0 },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student',
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  avatar: String,
  profilePicture: String, // For Google profile picture
  googleId: String, // For Google ID token
  isGoogleAccount: { type: Boolean, default: false }, // Flag for Google accounts
  isActive: {
    type: Boolean,
    default: true
  },
  mentorApplication: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
    },
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
