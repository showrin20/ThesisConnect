import React, { useState, useEffect, useRef } from 'react';
import axios from '../axios';
import { Upload, FileText, X, Search } from 'lucide-react';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getStatusStyles } from '../styles/styleUtils';

export default function ProjectForm({ onProjectCreated, onProjectUpdated, onCancel, isEditMode = false, initialData = {}, projectId }) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    link: initialData.link || '',
    tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
    status: initialData.status || 'Planned',
    collaborators: Array.isArray(initialData.collaborators) ? initialData.collaborators : [],
    thesisDraft: initialData.thesisDraft || { externalLink: '', description: '' },
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [collaboratorResults, setCollaboratorResults] = useState([]);
  const dropdownRef = useRef(null);

  // Validate URL
  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Search collaborators (debounced)
  useEffect(() => {
    const searchCollaborators = async () => {
      if (!collaboratorSearch.trim()) {
        setCollaboratorResults([]);
        return;
      }
      try {
        const response = await axios.get(`/projects/search-collaborators?q=${encodeURIComponent(collaboratorSearch)}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setCollaboratorResults(response.data.data);
      } catch (err) {
        setError('Failed to search collaborators');
      }
    };
    const timeout = setTimeout(searchCollaborators, 300);
    return () => clearTimeout(timeout);
  }, [collaboratorSearch]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCollaboratorResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in to proceed');

      const hasLink = formData.link.trim();
      const hasFile = selectedFile;
      const hasExternalLink = formData.thesisDraft.externalLink.trim();

      if (!formData.title.trim() || !formData.description.trim()) {
        throw new Error('Title and description are required');
      }

      if (!hasLink && !hasFile && !hasExternalLink) {
        throw new Error('Please provide a project link, upload a thesis draft, or external thesis link');
      }

      if (hasLink && !isValidURL(formData.link)) {
        throw new Error('Invalid project link URL');
      }
      if (hasExternalLink && !isValidURL(formData.thesisDraft.externalLink)) {
        throw new Error('Invalid thesis draft external link URL');
      }

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('status', formData.status);
      if (hasLink) submitData.append('link', formData.link);
      if (formData.tags) {
        const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tags.length) submitData.append('tags', JSON.stringify([...new Set(tags)]));
      }
      if (formData.collaborators.length) {
        const collaboratorIds = formData.collaborators.map(user => user._id);
        submitData.append('collaborators', JSON.stringify(collaboratorIds));
      }
      if (selectedFile) {
        submitData.append('thesisPdf', selectedFile);
      }
      if (hasExternalLink || formData.thesisDraft.description) {
        submitData.append('thesisDraft', JSON.stringify({
          externalLink: formData.thesisDraft.externalLink,
          description: formData.thesisDraft.description || '',
        }));
      }

      let response;
      if (isEditMode) {
        response = await axios.put(`/projects/${projectId}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token,
          },
        });
        setSuccess(true);
        if (onProjectUpdated) onProjectUpdated(response.data.data);
      } else {
        response = await axios.post('/projects', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token,
          },
        });
        setSuccess(true);
        if (onProjectCreated) onProjectCreated(response.data.data);
      }

      setFormData({
        title: '',
        description: '',
        link: '',
        tags: '',
        status: 'Planned',
        collaborators: [],
        thesisDraft: { externalLink: '', description: '' },
      });
      setSelectedFile(null);
      setCollaboratorSearch('');
      setCollaboratorResults([]);
      document.getElementById('thesis-file').value = '';
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || err.message || (isEditMode ? 'Failed to update project' : 'Failed to create project'));
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
        thesisDraft: { ...prev.thesisDraft, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file only');
        return;
      }
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
    document.getElementById('thesis-file').value = '';
  };

  const addCollaborator = (user) => {
    if (!formData.collaborators.some(c => c._id === user._id)) {
      setFormData(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, user],
      }));
      setCollaboratorSearch('');
      setCollaboratorResults([]);
    }
  };

  const removeCollaborator = (userId) => {
    setFormData(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter(user => user._id !== userId),
    }));
  };

  const isFormValid = () => {
    const hasLink = formData.link.trim();
    const hasThesisDraft = selectedFile || formData.thesisDraft.externalLink.trim();
    return formData.title.trim() && formData.description.trim() && (hasLink || hasThesisDraft);
  };

  return (
    <div className="space-y-6" role="region" aria-label={isEditMode ? "Project update form" : "Project creation form"}>
      {error && (
        <div className="rounded-lg p-4" style={getStatusStyles('error')}>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg p-4" style={getStatusStyles('success')} role="alert">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.status.success.border }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.text.primary }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium">{isEditMode ? 'Project updated successfully!' : 'Project created successfully!'}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Project Title *
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter your project title..."
            required
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
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
            className="w-full p-3 rounded-lg transition-all duration-200 resize-none"
            style={getInputStyles()}
          />
        </div>

        {/* Link */}
        <div>
          <label htmlFor="link" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Project Link
          </label>
          <input
            id="link"
            name="link"
            type="url"
            value={formData.link}
            onChange={handleChange}
            placeholder="https://example.com/your-project-report-or-blog"
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
            onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
            onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
          >
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Collaborators Section */}
        <div className="relative border rounded-lg p-4" style={{ borderColor: colors.border.secondary, backgroundColor: colors.background.card }} ref={dropdownRef}>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: colors.text.primary }}>
            <Search size={20} />
            Collaborators
          </h3>

          <div className="relative">
            <label htmlFor="collaboratorSearch" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Search Collaborators (Mentors or Students)
            </label>
            <input
              id="collaboratorSearch"
              value={collaboratorSearch}
              onChange={(e) => setCollaboratorSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full p-3 rounded-lg transition-all duration-200"
              style={getInputStyles()}
              onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
              onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
            />

            {collaboratorResults.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: colors.border.secondary }}>
                {collaboratorResults.map(user => (
                  <li
                    key={user._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => addCollaborator(user)}
                    style={{ color: colors.text.primary, backgroundColor: colors.background.card }}
                  >
                    {user.name} ({user.email}) - {user.role}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {formData.collaborators.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                Selected Collaborators:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.collaborators.map(user => (
                  <div key={user._id} className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: colors.background.tertiary }}>
                    <span className="text-sm" style={{ color: colors.text.primary }}>
                      {user.name} ({user.email})
                    </span>
                    <button type="button" onClick={() => removeCollaborator(user._id)} style={{ color: colors.status.error.text }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Thesis Draft Section */}
        <div className="border rounded-lg p-4" style={{ borderColor: colors.border.secondary, backgroundColor: colors.background.card, color: colors.text.primary }}>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: colors.text.primary }}>
            <FileText size={20} />
            Project Report
          </h3>
          <div>
            <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="thesis-file" />
            <label htmlFor="thesis-file" className="cursor-pointer block p-3 border rounded-lg text-center">
              {selectedFile ? `Change file: ${selectedFile.name}` : 'Upload PDF Draft'}
            </label>
          </div>
          {selectedFile && (
            <div className="mt-2 flex items-center justify-between p-2 rounded" style={{ backgroundColor: colors.background.tertiary }}>
              <span className="text-sm flex items-center gap-2">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
              <button type="button" onClick={removeFile} style={{ color: colors.status.error.text }}>
                <X size={16} />
              </button>
            </div>
          )}
          <div className="mt-4">
            <label htmlFor="thesisDraft.externalLink" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Thesis Draft External Link
            </label>
            <input
              id="thesisDraft.externalLink"
              name="thesisDraft.externalLink"
              type="url"
              value={formData.thesisDraft.externalLink}
              onChange={handleChange}
              placeholder="https://example.com/thesis-draft"
              className="w-full p-3 rounded-lg transition-all duration-200"
              style={getInputStyles()}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="thesisDraft.description" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Thesis Draft Description
            </label>
            <textarea
              id="thesisDraft.description"
              name="thesisDraft.description"
              value={formData.thesisDraft.description}
              onChange={handleChange}
              placeholder="Describe your thesis draft..."
              rows={3}
              className="w-full p-3 rounded-lg transition-all duration-200 resize-none"
              style={getInputStyles()}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Research Tags
          </label>
          <input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., Machine Learning, Climate Science"
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
          />
        </div>

        {/* Submit and Cancel */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200"
            style={getButtonStyles('outline')}
            onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('outline'), { backgroundColor: colors.button.outline.backgroundHover })}
            onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('outline'))}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200"
            style={loading || !isFormValid() ? getButtonStyles('primary', true) : getButtonStyles('primary')}
            onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' })}
            onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' })}
          >
            {loading ? (isEditMode ? 'Updating Project...' : 'Creating Project...') : (isEditMode ? 'Update Project' : 'Create Project')}
          </button>
          
        </div>
      </form>
    </div>
  );
}