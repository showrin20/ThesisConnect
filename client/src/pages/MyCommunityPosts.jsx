import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import CommunityPostCard from '../components/CommunityPostCard';
import { Plus, Edit, Trash2 } from 'lucide-react';
import statsService from '../services/statsService';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getStatusStyles, getCardStyles, getGradientTextStyles } from '../styles/styleUtils';

// Import Dashboard components
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
  
  // User statistics state
  const [userStats, setUserStats] = useState({
    projects: { total: 0, planned: 0, inProgress: 0, completed: 0 },
    publications: { total: 0, byType: {}, totalCitations: 0 },
    collaborators: { total: 0 }
  });
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Fetch user statistics
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
  
  const [formData, setFormData] = useState({
    content: '',
    type: 'general',
    title: '',
    skillsNeeded: '',
    status: 'open',
    tags: '',
    projectId: ''
  });

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

  const fetchMyPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/community-posts/my-posts');
      setPosts(res.data?.data?.posts || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load your community posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  // Handle escape key for modals
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const parseCSV = (str) =>
    str.split(',').map(s => s.trim()).filter(Boolean);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        content: formData.content,
        type: formData.type,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      // Add optional project ID if provided
      if (formData.projectId.trim()) {
        payload.projectId = formData.projectId;
      }

      // Add optional project ID if provided
      if (formData.projectId.trim()) {
        payload.projectId = formData.projectId;
      }

      if (formData.type === 'collab') {
        payload.title = formData.title;
        payload.skillsNeeded = parseCSV(formData.skillsNeeded);
        payload.status = formData.status;
      }

      const res = await axios.put(`/community-posts/${editingPost.postId}`, payload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Updated:', res.data);

      setEditingPost(null);
      setFormData({ 
        content: '', 
        type: 'general', 
        title: '', 
        skillsNeeded: '', 
        status: 'open',
        tags: '',
        projectId: ''
      });
      fetchMyPosts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update post');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`/community-posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDeletingPost(null);
      fetchMyPosts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post');
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
      content: post.content || '',
      type: post.type || 'general',
      title: post.title || '',
      skillsNeeded: (post.skillsNeeded || []).join(', '),
      status: post.status || 'open',
      tags: (post.tags || []).join(', '),
      projectId: post.projectId || ''
    });
  };

  const cancelForm = () => {
    setEditingPost(null);
    setDeletingPost(null);
    setFormData({ 
      content: '', 
      type: 'general', 
      title: '', 
      skillsNeeded: '', 
      status: 'open',
      tags: '',
      projectId: ''
    });
  };

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.background.page }}>
      {/* Background Pattern */}
      <div className="absolute inset-0" style={{ opacity: 0.3 }}>
        <div className="h-full w-full" style={{ background: colors.gradients.background.radial }}></div>
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} projects={[]} userStats={userStats} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Topbar */}
          <Topbar 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />

          {/* MyCommunityPosts Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
              <h1 className="text-4xl font-bold mb-8 text-center">
                <span style={getGradientTextStyles('secondary')}>
                  My Community Posts
                </span>
              </h1>

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

                  <div className="space-y-4">
                    <select 
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
                    
                    <textarea 
                      name="content" 
                      value={formData.content} 
                      onChange={handleChange} 
                      required 
                      rows={4} 
                      placeholder="Post content" 
                      className="w-full p-3 rounded-lg transition-all duration-200"
                      style={getInputStyles()}
                      onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                      onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                    />

                    <input 
                      type="text" 
                      name="tags" 
                      value={formData.tags} 
                      onChange={handleChange} 
                      placeholder="Tags (comma separated)" 
                      className="w-full p-3 rounded-lg transition-all duration-200"
                      style={getInputStyles()}
                      onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                      onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                    />

                    {formData.type === 'collab' && (
                      <>
                        <input 
                          type="text" 
                          name="title" 
                          value={formData.title} 
                          onChange={handleChange} 
                          required 
                          placeholder="Collaboration title" 
                          className="w-full p-3 rounded-lg transition-all duration-200"
                          style={getInputStyles()}
                          onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                          onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                        />
                        <input 
                          type="text" 
                          name="skillsNeeded" 
                          value={formData.skillsNeeded} 
                          onChange={handleChange} 
                          required 
                          placeholder="Skills needed (comma separated)" 
                          className="w-full p-3 rounded-lg transition-all duration-200"
                          style={getInputStyles()}
                          onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                          onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                        />
                        <select 
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
                      </>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <button 
                      type="submit" 
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      style={getButtonStyles('primary')}
                      onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' })}
                      onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' })}
                    >
                      Update
                    </button>
                    <button 
                      type="button" 
                      onClick={cancelForm} 
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      style={getButtonStyles('outline')}
                      onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('outline'), { backgroundColor: colors.button.outline.backgroundHover })}
                      onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('outline'))}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Delete Confirmation Modal */}
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
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4" style={{ backgroundColor: colors.status.error.background }}>
                        <Trash2 size={24} style={{ color: colors.status.error.text }} />
                      </div>
                      
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
                    <div key={post.postId} className="relative group">
                      <CommunityPostCard 
                        postId={post.postId}
                        type={post.type}
                        content={post.content}
                        title={post.title}
                        skillsNeeded={post.skillsNeeded}
                        status={post.status}
                        tags={post.tags}
                        author={post.author?.name || post.authorId}
                        createdAt={post.createdAt}
                      />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEditing(post)} 
                          title="Edit" 
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: `${colors.status.warning.background}`, color: colors.status.warning.text }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary.blue[600]}
                          onMouseLeave={(e) => e.target.style.backgroundColor = colors.status.warning.background}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(post)} 
                          title="Delete" 
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: `${colors.status.error.background}`, color: colors.status.error.text }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = colors.button.danger.background}
                          onMouseLeave={(e) => e.target.style.backgroundColor = colors.status.error.background}
                        >
                          <Trash2 size={16} />
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