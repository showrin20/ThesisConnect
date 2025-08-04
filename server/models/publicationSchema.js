const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authors: [{ type: String, required: true }], // array of author names
  year: { type: Number, required: true },
  venue: { type: String, required: true }, // conference/journal name
  type: { type: String, enum: ['Journal', 'Conference', 'Workshop', 'Book Chapter', 'Other'], required: true },
  genre: { type: String }, // e.g. Machine Learning
  quality: { type: String, enum: ['A*', 'A','Q1', 'Q2', 'Q3', 'Q4', 'N/A'], default: 'N/A' }, // impact factor tier etc.
  tags: [{ type: String }], // array of keywords
  doi: { type: String }, // digital object identifier
  abstract: { type: String },
  citations: { type: Number, default: 0 },
  location: { type: String }, // place of publication, e.g. country or city
  createdAt: { type: Date, default: Date.now },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who added this publication
});

module.exports = mongoose.model('Publication', publicationSchema);
