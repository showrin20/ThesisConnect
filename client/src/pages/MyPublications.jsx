import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getStatusStyles, getCardStyles, getGradientTextStyles } from '../styles/styleUtils';
import statsService from '../services/statsService';

import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';

export default function MyPublications() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPublication, setEditingPublication] = useState(null);
  const [deletingPublication, setDeletingPublication] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    journal: '',
    year: '',
    doi: '',
    tags: '',
  });

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

  const fetchMyPublications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/publications/my-publications');
      setPublications(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPublications();
  }, []);

  // Handle escape key for modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (deletingPublication) {
          setDeletingPublication(null);
        } else if (editingPublication) {
          cancelForm();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [deletingPublication, editingPublication]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        authors: formData.authors.split(',').map(a => a.trim()),
      };

      const res = await axios.put(`/publications/${editingPublication._id}`, payload);
      setEditingPublication(null);
      setFormData({ title: '', authors: '', journal: '', year: '', doi: '', tags: '' });
      fetchMyPublications();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update publication');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/publications/${id}`);
      setDeletingPublication(null);
      fetchMyPublications();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete publication');
    }
  };

  const confirmDelete = (pub) => {
    setDeletingPublication(pub);
  };

  const cancelDelete = () => {
    setDeletingPublication(null);
  };

  const startEditing = (pub) => {
    setEditingPublication(pub);
    setFormData({
      title: pub.title || '',
      authors: (pub.authors || []).join(', '),
      journal: pub.journal || '',
      year: pub.year || '',
      doi: pub.doi || '',
      tags: (pub.tags || []).join(', '),
    });
  };

  const cancelForm = () => {
    setEditingPublication(null);
    setDeletingPublication(null);
    setFormData({ title: '', authors: '', journal: '', year: '', doi: '', tags: '' });
  };

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.background.page }}>
      {/* Background Pattern */}
      <div className="absolute inset-0" style={{ opacity: 0.3 }}>
        <div className="h-full w-full" style={{ background: colors.gradients.background.radial }}></div>
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} publications={publications} userStats={userStats} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Topbar */}
          <Topbar 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />

          {/* MyPublications Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
              <h1 className="text-4xl font-bold mb-8 text-center">
                <span style={getGradientTextStyles('secondary')}>
                  My Publications
                </span>
              </h1>

              {editingPublication && (
                <form onSubmit={handleUpdate} className="max-w-2xl mx-auto rounded-xl p-8 mb-8 shadow-lg" style={getCardStyles('glass')}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold" style={{ color: colors.text.primary }}>Edit Publication</h2>
                    <button type="button" onClick={cancelForm} className="text-2xl transition-colors" style={{ color: colors.text.muted }}
                      onMouseEnter={(e) => e.target.style.color = colors.text.primary}
                      onMouseLeave={(e) => e.target.style.color = colors.text.muted}>
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      required 
                      placeholder="Title" 
                      className="w-full p-3 rounded-lg transition-all duration-200"
                      style={getInputStyles()}
                      onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                      onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                    />
                    <input 
                      type="text" 
                      name="authors" 
                      value={formData.authors} 
                      onChange={handleChange} 
                      required 
                      placeholder="Authors (comma separated)" 
                      className="w-full p-3 rounded-lg transition-all duration-200"
                      style={getInputStyles()}
                      onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                      onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                    />
                    <input 
                      type="text" 
                      name="journal" 
                      value={formData.journal} 
                      onChange={handleChange} 
                      required 
                      placeholder="Journal / Conference" 
                      className="w-full p-3 rounded-lg transition-all duration-200"
                      style={getInputStyles()}
                      onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                      onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                    />
                    <input 
                      type="text" 
                      name="year" 
                      value={formData.year} 
                      onChange={handleChange} 
                      required 
                      placeholder="Year" 
                      className="w-full p-3 rounded-lg transition-all duration-200"
                      style={getInputStyles()}
                      onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                      onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                    />
                    <input 
                      type="text" 
                      name="doi" 
                      value={formData.doi} 
                      onChange={handleChange} 
                      placeholder="DOI / Link" 
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
              {deletingPublication && (
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
                        Delete Publication
                      </h3>
                      
                      <p className="text-sm mb-6" style={{ color: colors.text.secondary }}>
                        Are you sure you want to delete "<span style={{ color: colors.text.primary, fontWeight: '500' }}>{deletingPublication.title}</span>"? This action cannot be undone.
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
                          onClick={() => handleDelete(deletingPublication._id)}
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
              ) : publications.length === 0 ? (
                <p className="text-center" style={{ color: colors.text.primary }}>No publications found.</p>
              ) : (

                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publications.map((pub) => (
                    <div key={pub._id} className="relative group p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200" style={getCardStyles()}>
                      <h3 className="text-lg font-semibold mb-1" style={{ color: colors.text.primary }}>{pub.title}</h3>
                      <p className="text-sm mb-1" style={{ color: colors.text.secondary }}>{pub.authors.join(', ')}</p>
                      <p className="text-sm italic" style={{ color: colors.text.muted }}>{pub.journal} • {pub.year}</p>
                      {pub.doi && (
                      
                          <a href={pub.doi} target="_blank" rel="noopener noreferrer">
          <button
            className="mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: colors.button.primary.background,
              color: colors.button.primary.text,
              border: `1px solid ${colors.button.primary.border}`,
            }}
            onMouseEnter={(e) => (e.target.style.background = colors.button.primary.backgroundHover)}
            onMouseLeave={(e) => (e.target.style.background = colors.button.primary.background)}
          >
            View Publication
          </button>
        </a>

                      )}




                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEditing(pub)} 
                          title="Edit" 
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: `${colors.status.warning.background}`, color: colors.status.warning.text }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary.blue[600]}
                          onMouseLeave={(e) => e.target.style.backgroundColor = colors.status.warning.background}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(pub)} 
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
