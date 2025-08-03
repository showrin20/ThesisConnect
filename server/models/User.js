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
    enum: ['student', 'supervisor', 'admin'],
    default: 'student',
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
