import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import ProjectCard from '../components/ProjectCard';
import ProjectForm from '../components/ProjectForm';
import { Edit, Trash2 } from 'lucide-react';
import statsService from '../services/statsService';
import { colors } from '../styles/colors';
import { getButtonStyles, getCardStyles, getGradientTextStyles } from '../styles/styleUtils';
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
    collaborators: { total: 0 },
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Filter state
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id) return;
      setLoadingStats(true);
      try {
        const stats = await statsService.getUserStats(user.id);
        setUserStats(stats);
      } catch (error) {
        // Failed to fetch user stats
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
      // Get projects with reviews data
      const projectsData = res.data.data || [];
      
      // Fetch reviews for each project
      const projectsWithReviews = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const reviewsRes = await axios.get(`/projects/${project._id}/reviews`);
            return { ...project, reviews: reviewsRes.data.data || [] };
          } catch (err) {
            return { ...project, reviews: [] };
          }
        })
      );
      
      setProjects(projectsWithReviews);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique tags from all projects
  useEffect(() => {
    const uniqueTags = [...new Set(projects.flatMap(project => project.tags || []))];
    setAllTags(uniqueTags.sort());
  }, [projects]);

  // Filter projects based on selected filters
  useEffect(() => {
    let filtered = projects;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(project =>
        project.tags && selectedTags.every(tag => project.tags.includes(tag))
      );
    }

    // Filter by status
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    setFilteredProjects(filtered);
  }, [projects, selectedTags, selectedStatus, searchQuery]);

  // Tag filtering functions
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedStatus('All');
    setSearchQuery('');
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/projects/${id}`);
      setDeletingProject(null);
      fetchMyProjects();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete project');
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
  };

  const cancelForm = () => {
    setEditingProject(null);
    setDeletingProject(null);
    setError(null);
  };

  const handleProjectUpdated = (updatedProject) => {
    // Update the projects list with the updated project
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project._id === updatedProject._id ? updatedProject : project
      )
    );
    setEditingProject(null);
    setError(null);
  };

  const handleReviewAdded = (updatedProject) => {
    // Update the projects list with the updated project including new review
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project._id === updatedProject._id ? updatedProject : project
      )
    );
  };
  
  const handleReviewDeleted = (updatedProject) => {
    // Update the projects list with the updated project after review deletion
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project._id === updatedProject._id ? updatedProject : project
      )
    );
  };

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.background.page }}>
      <div className="absolute inset-0" style={{ opacity: 0.3 }}>
        <div className="h-full w-full" style={{ background: colors.gradients.background.radial }}></div>
      </div>

      <div className="relative flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} projects={projects} userStats={userStats} />
        <div className="flex-1 flex flex-col lg:ml-0">
          <Topbar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center md:justify-between mb-8 gap-4">
  <h1 className="text-4xl font-bold text-center flex-1">
    <span style={getGradientTextStyles('secondary')}>My Projects</span>
  </h1>
  <button
    onClick={() => navigate('/collaboration-requests')}
    className="px-6 py-3 rounded-xs text-xs transition-all duration-200"
    style={getButtonStyles('primary')}
    onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' })}
    onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' })}
  >
    View Collaboration Requests
  </button>
</div>


              {error && (
                <p className="text-center mb-4" style={{ color: colors.status.error.text }}>
                  {error}
                </p>
              )}

              {editingProject && (
                <div className="max-w-2xl mx-auto rounded-xl p-8 mb-8 shadow-lg" style={getCardStyles('glass')}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                      Edit Project
                    </h2>
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="text-2xl transition-colors"
                      style={{ color: colors.text.muted }}
                      onMouseEnter={(e) => (e.target.style.color = colors.text.primary)}
                      onMouseLeave={(e) => (e.target.style.color = colors.text.muted)}
                    >
                      ✕
                    </button>
                  </div>

                  <ProjectForm
                    isEditMode={true}
                    initialData={editingProject}
                    projectId={editingProject._id}
                    onProjectUpdated={handleProjectUpdated}
                    onCancel={cancelForm}
                    />
                  </div>
              )}

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
                      <div
                        className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
                        style={{ backgroundColor: colors.status.error.background }}
                      >
                        <Trash2 size={24} style={{ color: colors.status.error.text }} />
                      </div>
                      <h3 className="text-lg font-medium mb-2" style={{ color: colors.text.primary }}>
                        Delete Project
                      </h3>
                      <p className="text-sm mb-6" style={{ color: colors.text.secondary }}>
                        Are you sure you want to delete "
                        <span style={{ color: colors.text.primary, fontWeight: '500' }}>{deletingProject.title}</span>
                        "? This action cannot be undone.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={cancelDelete}
                          className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                          style={getButtonStyles('outline')}
                          onMouseEnter={(e) =>
                            Object.assign(e.target.style, getButtonStyles('outline'), {
                              backgroundColor: colors.button.outline.backgroundHover,
                            })
                          }
                          onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('outline'))}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(deletingProject._id)}
                          className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                          style={getButtonStyles('danger')}
                          onMouseEnter={(e) =>
                            Object.assign(e.target.style, getButtonStyles('danger'), { transform: 'scale(1.02)' })
                          }
                          onMouseLeave={(e) =>
                            Object.assign(e.target.style, getButtonStyles('danger'), { transform: 'scale(1)' })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <p className="text-center" style={{ color: colors.text.primary }}>
                  Loading...
                </p>
              ) : projects.length === 0 ? (
                <p className="text-center" style={{ color: colors.text.primary }}>
                  No projects found.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div key={project._id}>
                      <ProjectCard 
                        {...project}
                        creator={project.creator?._id || project.creator}
                        collaborators={project.collaborators}
                        currentUserId={user?.id}
                        userRole={user?.role}
                        onEdit={() => startEditing(project)}
                        onDelete={() => confirmDelete(project)}
                        onReviewAdded={handleReviewAdded}
                        onReviewDeleted={handleReviewDeleted}
                      />
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