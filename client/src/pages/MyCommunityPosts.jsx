import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import CommunityPostCard from '../components/CommunityPostCard';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import statsService from '../services/statsService';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getStatusStyles, getCardStyles, getGradientTextStyles } from '../styles/styleUtils';
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';

export default function MyCommunityPosts() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [success, setSuccess] = useState(false);

  const [userStats, setUserStats] = useState({
    projects: { total: 0, planned: 0, inProgress: 0, completed: 0 },
    publications: { total: 0, byType: {}, totalCitations: 0 },
    collaborators: { total: 0 }
  });
  const [loadingStats, setLoadingStats] = useState(false);

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

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id) return;
      
      setLoadingStats(true);
      try {
        const stats = await statsService.getUserStats(user.id);
        setUserStats(stats);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchUserStats();
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({ ...prev, authorId: user.id }));
    }
  }, [user]);

  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!user?.id) return;

      setLoadingProjects(true);
      try {
        const res = await axios.get('/projects/my-projects', {
          headers: { 'x-auth-token': user.token }
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

  const fetchMyPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/community-posts/my-posts', {
        headers: { 'x-auth-token': user.token }
      });
      setPosts(res.data?.data?.posts || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load your community posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (deletingPost) {
          setDeletingPost(null);
        } else if (editingPost) {
          cancelForm();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [deletingPost, editingPost]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const parseCSV = (str) =>
    str.split(',').map(s => s.trim()).filter(Boolean);

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        postId: editingPost.postId,
        type: formData.type,
        authorId: formData.authorId,
        content: formData.content.trim(),
        tags: parseCSV(formData.tags),
      };

      if (formData.projectId.trim()) {
        payload.projectId = formData.projectId;
      }

      if (formData.type === 'collab') {
        payload.title = formData.title.trim();
        payload.skillsNeeded = parseCSV(formData.skillsNeeded);
        payload.status = formData.status;
      }

      const res = await axios.put(`/community-posts/${editingPost.postId}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token
        }
      });

      setSuccess(true);
      setEditingPost(null);
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
      fetchMyPosts();
      setTimeout(() => setSuccess(false), 300);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`/community-posts/${postId}`, {
        headers: { 'x-auth-token': user.token }
      });
      setDeletingPost(null);
      fetchMyPosts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete post');
    }
  };

  const confirmDelete = (post) => {
    setDeletingPost(post);
  };

  const cancelDelete = () => {
    setDeletingPost(null);
  };

  const startEditing = (post) => {
    setEditingPost(post);
    setFormData({
      postId: post.postId,
      type: post.type || 'general',
      authorId: post.authorId || user?.id || '',
      projectId: post.projectId || '',
      title: post.title || '',
      content: post.content || '',
      skillsNeeded: (post.skillsNeeded || []).join(', '),
      status: post.status || 'open',
      tags: (post.tags || []).join(', '),
    });
  };

  const cancelForm = () => {
    setEditingPost(null);
    setDeletingPost(null);
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
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.background.page }}>
      <div className="absolute inset-0" style={{ opacity: 0.3 }}>
        <div className="h-full w-full" style={{ background: colors.gradients.background.radial }}></div>
      </div>

      <div className="relative flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} projects={[]} userStats={userStats} />
        <div className="flex-1 flex flex-col lg:ml-0">
          <Topbar 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
              <h1 className="text-4xl font-bold mb-8 text-center">
                <span style={getGradientTextStyles('secondary')}>
                  My Community Posts
                </span>
              </h1>

              {error && (
                <div className="rounded-lg p-4 max-w-2xl mx-auto mb-6" style={getStatusStyles('error')}>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {success && (
                <div className="rounded-lg p-4 max-w-2xl mx-auto mb-6" style={getStatusStyles('success')}>
                  <p className="text-sm font-medium">Post updated successfully!</p>
                </div>
              )}

              {editingPost && (
                <form onSubmit={handleUpdate} className="max-w-2xl mx-auto rounded-xl p-8 mb-8 shadow-lg" style={getCardStyles('glass')}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold" style={{ color: colors.text.primary }}>Edit Community Post</h2>
                    <button type="button" onClick={cancelForm} className="text-2xl transition-colors" style={{ color: colors.text.muted }}
                      onMouseEnter={(e) => e.target.style.color = colors.text.primary}
                      onMouseLeave={(e) => e.target.style.color = colors.text.muted}>
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
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
                        required
                      />
                    </div>

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

                    {formData.type === 'collab' && (
                      <div className="border rounded-lg p-4" style={{ borderColor: colors.border.secondary }}>
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: colors.text.primary }}>
                          <MessageSquare size={20} /> Collaboration Details
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                              Title *
                            </label>
                            <input
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              placeholder="Collaboration Title"
                              style={getInputStyles()}
                              className="w-full p-3 rounded-lg"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                              Skills Needed (comma-separated) *
                            </label>
                            <input
                              name="skillsNeeded"
                              value={formData.skillsNeeded}
                              onChange={handleChange}
                              placeholder="e.g., JavaScript, UI/UX"
                              style={getInputStyles()}
                              className="w-full p-3 rounded-lg"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                              Status *
                            </label>
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              style={getInputStyles()}
                              className="w-full p-3 rounded-lg"
                              required
                            >
                              <option value="open">Open</option>
                              <option value="in-progress">In Progress</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={cancelForm}
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
                        {loading ? 'Updating...' : 'Update Post'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {deletingPost && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center p-4" 
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      cancelDelete();
                    }
                  }}
                >
                  <div className="relative w-full max-w-md rounded-xl p-6 shadow-2xl" style={getCardStyles('glass')}>
                    <div className="text-center">
                      {/* <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4" style={{ backgroundColor: colors.status.error.background }}>
                        <Trash2 size={24} style={{ color: colors.text.primary }} />
                      </div> */}
                      <h3 className="text-lg font-medium mb-2" style={{ color: colors.text.primary }}>
                        Delete Community Post
                      </h3>
                      <p className="text-sm mb-6" style={{ color: colors.text.secondary }}>
                        Are you sure you want to delete this post? This action cannot be undone.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={cancelDelete}
                          className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                          style={getButtonStyles('outline')}
                          onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('outline'), { backgroundColor: colors.button.outline.backgroundHover })}
                          onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('outline'))}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(deletingPost.postId)}
                          className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                          style={getButtonStyles('danger')}
                          onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('danger'), { transform: 'scale(1.02)' })}
                          onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('danger'), { transform: 'scale(1)' })}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <p className="text-center" style={{ color: colors.text.primary }}>Loading...</p>
              ) : error ? (
                <p className="text-center" style={{ color: colors.status.error.text }}>{error}</p>
              ) : posts.length === 0 ? (
                <p className="text-center" style={{ color: colors.text.primary }}>No community posts found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <div key={post.postId} className="relative group p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200" style={getCardStyles()}>
                      <CommunityPostCard 
                        postId={post.postId}
                        type={post.type}
                        content={post.content}
                        title={post.title}
                        skillsNeeded={post.skillsNeeded}
                        status={post.status}
                        tags={post.tags}
                        projectId={post.projectId}
                        author={post.authorId?.name || post.authorId}
                        createdAt={post.createdAt}
                      />
                 
                      <div className="flex gap-2 pt-4 border-t" style={{ borderColor: colors.border.secondary }}>
                        <button
                          onClick={() => startEditing(post)}
                          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                          style={{
                            backgroundColor: `${colors.accent.green[500]}33`,
                            color: colors.text.primary,
                            border: `1px solid ${colors.accent.green[500]}4D`
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.green[500]}4D`}
                          onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.green[500]}33`}
                        >
                          Edit Post
                        </button>



                        <button
                          onClick={() => confirmDelete(post)}
                          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                          style={{
                            backgroundColor: `${colors.accent.red[500]}33`,
                            color: colors.text.primary,
                            border: `1px solid ${colors.accent.red[500]}4D`
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.red[500]}4D`}
                          onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.red[500]}33`}
                        >
                          Delete Post
                     
                 </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}