const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  university: { type: String },
  domain: { type: String },
  scholarLink: { type: String },
  githubLink: { type: String },
  keywords: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);