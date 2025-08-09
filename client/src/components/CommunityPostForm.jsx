import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { MessageSquare, X } from 'lucide-react';
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
    content: '',
    createdAt: new Date().toISOString(),
    title: '',
    skillsNeeded: '',
    status: 'open',
    tags: '',
    projectId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Update authorId when user changes
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({
        ...prev,
        authorId: user.id
      }));
    }
  }, [user]);

  // Fetch user's projects for the dropdown
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!user?.id) return;
      
      setLoadingProjects(true);
      try {
        const response = await axios.get('/projects/my-projects', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        setUserProjects(response.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch user projects:', err);
        setUserProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchUserProjects();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in to create a post');
      if (!user?.id) throw new Error('User authentication required');
      if (!formData.authorId) throw new Error('User ID is missing');

      const hasRequiredFields = formData.content.trim();
      const hasCollabFields = formData.type !== 'collab' || (
        formData.title.trim() &&
        formData.skillsNeeded.trim() &&
        formData.status.trim()
      );

      if (!hasRequiredFields || !hasCollabFields) {
        throw new Error('Please fill all required fields');
      }

      const submitData = {
        postId: formData.postId,
        type: formData.type,
        authorId: formData.authorId,
        content: formData.content,
        createdAt: formData.createdAt,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      // Add optional project ID if provided
      if (formData.projectId.trim()) {
        submitData.projectId = formData.projectId;
      }

      if (formData.type === 'collab') {
        submitData.title = formData.title;
        submitData.skillsNeeded = formData.skillsNeeded.split(',').map(skill => skill.trim()).filter(Boolean);
        submitData.status = formData.status;
      }

      const response = await axios.post('/community-posts', submitData, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      setFormData({
        postId: uuidv4(),
        type: 'general',
        authorId: user?.id || '',
        content: '',
        createdAt: new Date().toISOString(),
        title: '',
        skillsNeeded: '',
        status: 'open',
        tags: '',
        projectId: ''
      });
      setSuccess(true);
      if (onPostCreated) onPostCreated(response.data.post);
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 3000);

    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to create post'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg p-4" style={getStatusStyles('error')}>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg p-4" style={getStatusStyles('success')}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.status.success.border }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.text.primary }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium">Post created successfully!</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Post Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
            onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
            onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
          >
            <option value="general">General</option>
            <option value="collab">Collaboration</option>
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="What's on your mind? Share your thoughts or collaboration ideas..."
            required
            rows={5}
            className="w-full p-3 rounded-lg transition-all duration-200 resize-none"
            style={getInputStyles()}
            onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
            onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Related Project (Optional)
            </label>
            <select
              id="projectId"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="w-full p-3 rounded-lg transition-all duration-200"
              style={getInputStyles()}
              onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
              onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
              disabled={loadingProjects}
            >
              <option value="">Select a project (optional)</option>
              {loadingProjects ? (
                <option disabled>Loading projects...</option>
              ) : (
                userProjects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))
              )}
            </select>
            {loadingProjects && (
              <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
                Loading your projects...
              </p>
            )}
            {!loadingProjects && userProjects.length === 0 && (
              <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
                No projects found. Create a project first to link it to this post.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., Research, Machine Learning, Data Science"
              className="w-full p-3 rounded-lg transition-all duration-200"
              style={getInputStyles()}
              onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
              onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
            />
            <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
              Separate multiple tags with commas
            </p>
          </div>
        </div>

        {formData.type === 'collab' && (
          <div className="border rounded-lg p-4" style={{ 
            borderColor: colors.border.secondary, 
            backgroundColor: colors.background.card 
          }}>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: colors.text.primary }}>
              <MessageSquare size={20} />
              Collaboration Details
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                  Collaboration Title *
                </label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter your collaboration title..."
                  required
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={getInputStyles()}
                  onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                  onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                />
              </div>

              <div>
                <label htmlFor="skillsNeeded" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                  Skills Needed *
                </label>
                <input
                  id="skillsNeeded"
                  name="skillsNeeded"
                  value={formData.skillsNeeded}
                  onChange={handleChange}
                  placeholder="e.g., Python, Data Analysis, Machine Learning"
                  required
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={getInputStyles()}
                  onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                  onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                />
                <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
                  Separate multiple skills with commas
                </p>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-lg transition-all duration-200"
                  style={getInputStyles()}
                  onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                  onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200"
            style={getButtonStyles('secondary')}
            onMouseEnter={(e) => Object.assign(e.target.style, {
              background: colors.button.secondary.backgroundHover,
              transform: 'scale(1.02)'
            })}
            onMouseLeave={(e) => Object.assign(e.target.style, {
              background: colors.button.secondary.background,
              transform: 'scale(1)'
            })}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200"
            style={
              loading || !isFormValid()
                ? getButtonStyles('primary', true)
                : getButtonStyles('primary')
            }
            onMouseEnter={!loading && isFormValid() ? (e) => {
              Object.assign(e.target.style, {
                background: colors.button.primary.backgroundHover,
                transform: 'scale(1.02)'
              });
            } : undefined}
            onMouseLeave={!loading && isFormValid() ? (e) => {
              Object.assign(e.target.style, {
                background: colors.button.primary.background,
                transform: 'scale(1)'
              });
            } : undefined}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Post...
              </span>
            ) : (
              'Create Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}