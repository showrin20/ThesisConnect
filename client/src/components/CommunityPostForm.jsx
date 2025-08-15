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
  };

  const isFormValid = () => {
    if (!formData.content.trim()) return false;
    if (formData.type === 'collab') {
      return (
        formData.title.trim() &&
        formData.skillsNeeded.trim() &&
        formData.status.trim()
      );
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in to create a post');

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
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create post');
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
          </label>
          <textarea
            name="content"
            rows={5}
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your thoughts or collaboration ideas..."
            style={getInputStyles()}
            className="w-full p-3 rounded-lg resize-none"
          />
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
            </label>
            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., AI, Web Dev"
              style={getInputStyles()}
              className="w-full p-3 rounded-lg"
            />
          </div>
        </div>

        {/* Collab fields */}
        {formData.type === 'collab' && (
          <div className="border rounded-lg p-4" style={{ borderColor: colors.border.secondary }}>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: colors.text.primary }}>
              <MessageSquare size={20} /> Collaboration Details
            </h3>
            <div className="space-y-4">
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Collaboration Title"
                style={getInputStyles()}
                className="w-full p-3 rounded-lg"
              />
              <input
                name="skillsNeeded"
                value={formData.skillsNeeded}
                onChange={handleChange}
                placeholder="Skills Needed (comma-separated)"
                style={getInputStyles()}
                className="w-full p-3 rounded-lg"
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={getInputStyles()}
                className="w-full p-3 rounded-lg"
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
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
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
