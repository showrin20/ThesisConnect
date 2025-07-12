const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  university: String,
  domain: String,
  scholarLink: String,
  githubLink: String,
  keywords: [String],
  role: {
    type: String,
    enum: ['student', 'supervisor', 'admin'],
    default: 'student',
  },
});

module.exports = mongoose.model('User', UserSchema);
