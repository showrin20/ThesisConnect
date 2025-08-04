import React, { useState } from 'react';
import axios from '../axios';
import { Upload, Link as LinkIcon, FileText, X } from 'lucide-react';

export default function ProjectForm({ onProjectCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    tags: '',
    thesisDraft: {
      externalLink: '',
      description: ''
    }
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccess(false);

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Please log in to create a project');

    const hasLink = formData.link && formData.link.trim();
    const hasFile = selectedFile;
    const hasExternalLink = formData.thesisDraft.externalLink && formData.thesisDraft.externalLink.trim();

    if (!hasLink && !hasFile && !hasExternalLink) {
      throw new Error('Please provide a project link, upload a thesis draft, or external thesis link');
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    
    if (formData.link) submitData.append('link', formData.link);
    
    if (formData.tags) {
      submitData.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(Boolean)));
    }

    // **File upload key must match multer config: 'thesisPdf'**
    if (selectedFile) {
      submitData.append('thesisPdf', selectedFile);
    }

    if (formData.thesisDraft.externalLink) {
      submitData.append('thesisDraft', JSON.stringify({
        externalLink: formData.thesisDraft.externalLink,
        description: formData.thesisDraft.description || ''
      }));
    } else if (formData.thesisDraft.description) {
      submitData.append('thesisDraft', JSON.stringify({
        description: formData.thesisDraft.description
      }));
    }

    const response = await axios.post('/projects', submitData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-auth-token': token,
      },
    });

    setFormData({
      title: '',
      description: '',
      link: '',
      tags: '',
      thesisDraft: { externalLink: '', description: '' }
    });
    setSelectedFile(null);
    setSuccess(true);
    if (onProjectCreated) onProjectCreated(response.data.data);
    setTimeout(() => setSuccess(false), 3000);

  } catch (err) {
    setError(
      err.response?.data?.msg ||
      err.message ||
      'Failed to create project'
    );
  } finally {
    setLoading(false);
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('thesisDraft.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        thesisDraft: {
          ...prev.thesisDraft,
          [field]: value
        }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file only');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({
      ...prev,
      thesisDraft: {
        ...prev.thesisDraft,
        pdfUrl: '',
        pdfFileName: '',
        pdfSize: 0
      }
    }));
  };

  const isFormValid = () => {
    // Basic required fields
    if (!formData.title.trim() || !formData.description.trim()) {
      return false;
    }
    
    // Either link OR thesis draft is required
    const hasLink = formData.link.trim();
    const hasThesisDraft = selectedFile || formData.thesisDraft.externalLink.trim();
    
    return hasLink || hasThesisDraft;
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-300 text-sm font-medium">Project created successfully!</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Project Title *
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter your project title..."
            required
            className="w-full p-3 bg-slate-800/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Project Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your project goals, methodology, and expected outcomes..."
            required
            rows={5}
            className="w-full p-3 bg-slate-800/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div>
          <label htmlFor="link" className="block text-sm font-medium text-gray-300 mb-2">
            Project Link
          </label>
          <input
            id="link"
            name="link"
            type="url"
            value={formData.link}
            onChange={handleChange}
            placeholder="https://example.com/your-project-report-or-blog"
            className="w-full p-3 bg-slate-800/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
          <p className="text-gray-400 text-xs mt-1">
            Provide a link to your project report, blog post, GitHub repository, or documentation
          </p>
        </div>

        {/* Thesis Draft Section */}
        <div className="border border-gray-600 rounded-lg p-4 bg-slate-800/30">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <FileText size={20} />
            Project Report
          </h3>
          <p className="text-gray-400 text-sm mb-4">
  You must provide either a Project Link or a Project Report (PDF upload or external link). One is required.
</p>
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload PDF Draft
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="thesis-file"
                />
                <label
                  htmlFor="thesis-file"
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-sky-400 hover:bg-slate-800/50 transition-all"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-300">
                      {selectedFile ? 'Change PDF file' : 'Click to upload PDF file'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">PDF files only, max 10MB</p>
                  </div>
                </label>
              </div>
              
              {selectedFile && (
                <div className="mt-2 flex items-center justify-between bg-slate-700 p-2 rounded">
                  <span className="text-sm text-white flex items-center gap-2">
                    <FileText size={16} />
                    {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="text-center text-gray-400 text-sm">OR</div>

            {/* External Link */}
            <div>
              <label htmlFor="thesisDraft.externalLink" className="block text-sm font-medium text-gray-300 mb-2">
                External Link to Project Report
              </label>
              <input
                id="thesisDraft.externalLink"
                name="thesisDraft.externalLink"
                type="url"
                value={formData.thesisDraft.externalLink}
                onChange={handleChange}
                placeholder="https://drive.google.com/... or https://dropbox.com/..."
                className="w-full p-3 bg-slate-800/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
              <p className="text-gray-400 text-xs mt-1">
                Link to Google Drive, Dropbox, or other cloud storage
              </p>
            </div>

            {/* Draft Description */}
            <div>
              <label htmlFor="thesisDraft.description" className="block text-sm font-medium text-gray-300 mb-2">
                Draft Description
              </label>
              <textarea
                id="thesisDraft.description"
                name="thesisDraft.description"
                value={formData.thesisDraft.description}
                onChange={handleChange}
                placeholder="Brief description of the thesis draft, version notes, or current status..."
                rows={3}
                className="w-full p-3 bg-slate-800/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
            Research Tags
          </label>
          <input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., Machine Learning, Climate Science, Data Analysis"
            className="w-full p-3 bg-slate-800/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
          <p className="text-gray-400 text-xs mt-1">Separate multiple tags with commas</p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              loading || !isFormValid()
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Project...
              </span>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}