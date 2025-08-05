import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios'; // your axios instance configured with baseURL
import ProjectCard from '../components/ProjectCard';
import { Plus, Edit, Trash2 } from 'lucide-react';
import statsService from '../services/statsService';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getStatusStyles, getCardStyles, getGradientTextStyles } from '../styles/styleUtils';

// Import Dashboard components
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';

export default function MyProjects() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  
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
    title: '',
    description: '',
    link: '',
    tags: '',
    status: 'Planned',
    collaborators: '',
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

  const fetchMyProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/projects/my-projects');
      setProjects(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  // Handle escape key for modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (deletingProject) {
          setDeletingProject(null);
        } else if (editingProject) {
          cancelForm();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [deletingProject, editingProject]);

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
        ...formData,
        tags: parseCSV(formData.tags),
        collaborators: parseCSV(formData.collaborators),
      };

      const res = await axios.put(`/projects/${editingProject._id}`, payload);
      console.log('Updated:', res.data);

      setEditingProject(null);
      setFormData({ title: '', description: '', link: '', tags: '', status: 'Planned', collaborators: '' });
      fetchMyProjects();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update project');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/projects/${id}`);
      setDeletingProject(null);
      fetchMyProjects();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete project');
    }
  };

  const confirmDelete = (project) => {
    setDeletingProject(project);
  };

  const cancelDelete = () => {
    setDeletingProject(null);
  };

  const startEditing = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      link: project.link || '',
      tags: (project.tags || []).join(', '),
      status: project.status || 'Planned',
      collaborators: (project.collaborators || []).join(', '),
    });
  };

  const cancelForm = () => {
    setEditingProject(null);
    setDeletingProject(null);
    setFormData({ title: '', description: '', link: '', tags: '', status: 'Planned', collaborators: '' });
  };

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.background.page }}>
      {/* Background Pattern */}
      <div className="absolute inset-0" style={{ opacity: 0.3 }}>
        <div className="h-full w-full" style={{ background: colors.gradients.background.radial }}></div>
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} projects={projects} userStats={userStats} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Topbar */}
          <Topbar 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />

          {/* MyProjects Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
              <h1 className="text-4xl font-bold mb-8 text-center">
                <span style={getGradientTextStyles('secondary')}>
                  My Projects
                </span>
              </h1>

        {editingProject && (
          <form onSubmit={handleUpdate} className="max-w-2xl mx-auto rounded-xl p-8 mb-8 shadow-lg" style={getCardStyles('glass')}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold" style={{ color: colors.text.primary }}>Edit Project</h2>
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
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
                rows={4} 
                placeholder="Description" 
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={getInputStyles()}
                onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
              />
              <input 
                type="url" 
                name="link" 
                value={formData.link} 
                onChange={handleChange} 
                required 
                placeholder="Project Link" 
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
              <select 
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
              <input 
                type="text" 
                name="collaborators" 
                value={formData.collaborators} 
                onChange={handleChange} 
                placeholder="Collaborators (comma separated)" 
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
        {deletingProject && (
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
                  Delete Project
                </h3>
                
                <p className="text-sm mb-6" style={{ color: colors.text.secondary }}>
                  Are you sure you want to delete "<span style={{ color: colors.text.primary, fontWeight: '500' }}>{deletingProject.title}</span>"? This action cannot be undone.
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
                    onClick={() => handleDelete(deletingProject._id)}
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
        ) : projects.length === 0 ? (
          <p className="text-center" style={{ color: colors.text.primary }}>No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="relative group">
                <ProjectCard {...project} />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEditing(project)} 
                    title="Edit" 
                    className="p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: `${colors.status.warning.background}`, color: colors.status.warning.text }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary.blue[600]}
                    onMouseLeave={(e) => e.target.style.backgroundColor = colors.status.warning.background}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => confirmDelete(project)} 
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
