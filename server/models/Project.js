const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String }, // Made optional since we now have thesis draft options
  status: { type: String, enum: ['Planned', 'In Progress', 'Completed'], default: 'Planned' },
  collaborators: [String],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Thesis draft fields
  thesisDraft: {
    pdfUrl: { type: String }, // URL/path to uploaded PDF
    pdfFileName: { type: String }, // Original filename
    pdfSize: { type: Number }, // File size in bytes
    externalLink: { type: String }, // External link (Google Drive, Dropbox, etc.)
    uploadedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 }, // For future versioning
    description: { type: String } // Optional description of the draft
  },
  
  createdAt: { type: Date, default: Date.now },
});

// Custom validation: Either link OR thesis draft (pdfUrl OR externalLink) must be provided
projectSchema.pre('save', function(next) {
  const hasLink = this.link && this.link.trim();
  const hasPdfUrl = this.thesisDraft?.pdfUrl && this.thesisDraft.pdfUrl.trim();
  const hasExternalLink = this.thesisDraft?.externalLink && this.thesisDraft.externalLink.trim();
  
  if (!hasLink && !hasPdfUrl && !hasExternalLink) {
    return next(new Error('Either project link or thesis draft (PDF upload or external link) is required'));
  }
  
  next();
});

module.exports = mongoose.model('Project', projectSchema);
