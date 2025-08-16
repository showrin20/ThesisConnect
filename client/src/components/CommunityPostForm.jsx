import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { MessageSquare } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getStatusStyles } from '../styles/styleUtils';
import { useAuth } from '../context/AuthContext';

export default function CommunityPostForm({ onPostCreated, onClose }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    postId: uuidv4(),
    type: 'general',
    authorId: user?.id || '',
    projectId: '',
    title: '',
    content: '',
    skillsNeeded: '',
    status: 'open',
    tags: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Keep authorId updated when user changes
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({ ...prev, authorId: user.id }));
    }
  }, [user]);

  // Fetch user's projects for dropdown
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!user?.id) return;

      setLoadingProjects(true);
      try {
        const res = await axios.get('/projects/my-projects', {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setUserProjects(res.data?.data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setUserProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchUserProjects();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Clear general error when user makes changes
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Content validation
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    } else if (formData.content.length > 300) {
      errors.content = `Content must be under 300 characters (currently ${formData.content.length})`;
    } else if (formData.content.length < 10) {
      errors.content = 'Content must be at least 10 characters long';
    }
    
    // Collaboration-specific validations
    if (formData.type === 'collab') {
      if (!formData.title.trim()) {
        errors.title = 'Title is required for collaboration posts';
      } else if (formData.title.length > 200) {
        errors.title = `Title must be under 200 characters (currently ${formData.title.length})`;
      }
      
      if (!formData.skillsNeeded.trim()) {
        errors.skillsNeeded = 'Skills needed are required for collaboration posts';
      }
      
      if (!formData.status) {
        errors.status = 'Status is required for collaboration posts';
      }
    }
    
    // Tags validation
    if (formData.tags && formData.tags.length > 100) {
      errors.tags = `Tags must be under 100 characters (currently ${formData.tags.length})`;
    }
    
    return errors;
  };

  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors below before submitting');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to create a post');
      }

      // Prepare payload based on backend schema
      const payload = {
        postId: formData.postId,
        type: formData.type,
        authorId: formData.authorId,
        content: formData.content.trim(),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      // Only include projectId if it's not empty
      if (formData.projectId && formData.projectId.trim() !== '') {
        payload.projectId = formData.projectId;
      }

      if (formData.type === 'collab') {
        payload.title = formData.title.trim();
        payload.skillsNeeded = formData.skillsNeeded.split(',').map(s => s.trim()).filter(Boolean);
        payload.status = formData.status;
      }

      const res = await axios.post('/community-posts', payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      // Reset form
      setFormData({
        postId: uuidv4(),
        type: 'general',
        authorId: user?.id || '',
        projectId: '',
        title: '',
        content: '',
        skillsNeeded: '',
        status: 'open',
        tags: '',
      });

      setSuccess(true);
      if (onPostCreated) onPostCreated(res.data.data);
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 300);

    } catch (err) {
      console.error('Error creating post:', err);
      
      // Handle different types of errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Handle validation errors from backend
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          if (error.path) {
            backendErrors[error.path] = error.msg || error.message;
          }
        });
        setFieldErrors(backendErrors);
        setError('Please fix the validation errors below');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg p-4" style={getStatusStyles('error')}>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg p-4" style={getStatusStyles('success')}>
          <p className="text-sm font-medium">Post created successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Post Type */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Post Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={getInputStyles()}
            className="w-full p-3 rounded-lg"
          >
            <option value="general">General</option>
            <option value="collab">Collaboration</option>
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Content * 
            <span className="text-xs opacity-70 ml-2">
              ({formData.content.length}/300 characters)
              {formData.content.length > 0 && formData.content.length < 10 && (
                <span style={{ color: colors.status.warning }}> - Too short</span>
              )}
              {formData.content.length > 1900 && (
                <span style={{ color: colors.status.warning }}> - Almost at limit</span>
              )}
              {formData.content.length > 300 && (
                <span style={{ color: colors.status.error }}> - Over limit!</span>
              )}
            </span>
          </label>
          <textarea
            name="content"
            rows={5}
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your thoughts or collaboration ideas..."
            style={{
              ...getInputStyles(),
              ...(fieldErrors.content ? { borderColor: colors.status.error } : {})
            }}
            className="w-full p-3 rounded-lg resize-none"
          />
          {fieldErrors.content && (
            <div className="mt-2 p-2 rounded" style={getStatusStyles('error')}>
              <p className="text-xs">{fieldErrors.content}</p>
            </div>
          )}
        </div>

        {/* Project and Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Related Project
            </label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              style={getInputStyles()}
              className="w-full p-3 rounded-lg"
            >
              <option value="">Select a project (optional)</option>
              {loadingProjects ? (
                <option disabled>Loading...</option>
              ) : (
                userProjects.map(project => (
                  <option key={project._id} value={project._id}>{project.title}</option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Tags
              <span className="text-xs opacity-70 ml-2">
                ({formData.tags.length}/100 characters)
              </span>
            </label>
            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., AI, Web Dev"
              style={{
                ...getInputStyles(),
                ...(fieldErrors.tags ? { borderColor: colors.status.error } : {})
              }}
              className="w-full p-3 rounded-lg"
            />
            {fieldErrors.tags && (
              <div className="mt-2 p-2 rounded" style={getStatusStyles('error')}>
                <p className="text-xs">{fieldErrors.tags}</p>
              </div>
            )}
          </div>
        </div>

        {/* Collab fields */}
        {formData.type === 'collab' && (
          <div className="border rounded-lg p-4" style={{ borderColor: colors.border.secondary }}>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: colors.text.primary }}>
              <MessageSquare size={20} /> Collaboration Details
            </h3>
            <div className="space-y-4">
              <div>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Collaboration Title"
                  style={{
                    ...getInputStyles(),
                    ...(fieldErrors.title ? { borderColor: colors.status.error } : {})
                  }}
                  className="w-full p-3 rounded-lg"
                />
                <div className="text-xs opacity-70 mt-1" style={{ color: colors.text.secondary }}>
                  {formData.title.length}/200 characters
                  {formData.title.length > 180 && (
                    <span style={{ color: colors.status.warning }}> - Almost at limit</span>
                  )}
                  {formData.title.length > 200 && (
                    <span style={{ color: colors.status.error }}> - Over limit!</span>
                  )}
                </div>
                {fieldErrors.title && (
                  <div className="mt-2 p-2 rounded" style={getStatusStyles('error')}>
                    <p className="text-xs">{fieldErrors.title}</p>
                  </div>
                )}
              </div>
              
              <div>
                <input
                  name="skillsNeeded"
                  value={formData.skillsNeeded}
                  onChange={handleChange}
                  placeholder="Skills Needed (comma-separated)"
                  style={{
                    ...getInputStyles(),
                    ...(fieldErrors.skillsNeeded ? { borderColor: colors.status.error } : {})
                  }}
                  className="w-full p-3 rounded-lg"
                />
                {fieldErrors.skillsNeeded && (
                  <div className="mt-2 p-2 rounded" style={getStatusStyles('error')}>
                    <p className="text-xs">{fieldErrors.skillsNeeded}</p>
                  </div>
                )}
              </div>
              
              <div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{
                    ...getInputStyles(),
                    ...(fieldErrors.status ? { borderColor: colors.status.error } : {})
                  }}
                  className="w-full p-3 rounded-lg"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                {fieldErrors.status && (
                  <div className="mt-2 p-2 rounded" style={getStatusStyles('error')}>
                    <p className="text-xs">{fieldErrors.status}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            style={getButtonStyles('secondary')}
            className="flex-1 py-3 px-6 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            style={loading || !isFormValid()
              ? getButtonStyles('primary', true)
              : getButtonStyles('primary')
            }
            className="flex-1 py-3 px-6 rounded-lg font-medium"
          >
            {loading ? 'Creating...' : !isFormValid() ? 'Fill Required Fields' : 'Create Post'}
          </button>
        </div>
        
        {/* Helper text */}
        <div className="text-xs opacity-70" style={{ color: colors.text.secondary }}>
          * Required fields. Content must be 10-300 characters. 
          {formData.type === 'collab' && ' Title must be under 200 characters.'}
        </div>
      </form>
    </div>
  );
}
