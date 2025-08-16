import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import ProjectCard from '../components/ProjectCard';
import { Edit, Trash2, Search, X } from 'lucide-react';
import statsService from '../services/statsService';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getCardStyles, getGradientTextStyles } from '../styles/styleUtils';
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null); // Added for better error handling

  // User statistics state
  const [userStats, setUserStats] = useState({
    projects: { total: 0, planned: 0, inProgress: 0, completed: 0 },
    publications: { total: 0, byType: {}, totalCitations: 0 },
    collaborators: { total: 0 },
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    tags: '',
    status: 'Planned',
    collaborators: [],
    thesisDraft: {
      pdfUrl: '',
      pdfFileName: '',
      pdfSize: '',
      externalLink: '',
      version: 1,
      thesisDescription: '',
    },
  });

  // Collaborator search state
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [collaboratorResults, setCollaboratorResults] = useState([]);
  const dropdownRef = useRef(null);

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

  // Search collaborators (debounced)
  useEffect(() => {
    const searchCollaborators = async () => {
      if (!collaboratorSearch.trim()) {
        setCollaboratorResults([]);
        return;
      }
      try {
        const response = await axios.get(`/projects/search-collaborators?q=${encodeURIComponent(collaboratorSearch)}`, {
          headers: { 'x-auth-token': user?.token || localStorage.getItem('token') }, // Use token from context if available
        });
        setCollaboratorResults(response.data.data || []);
      } catch (err) {
        console.error('Failed to search collaborators:', err);
      }
    };
    const timeoutId = setTimeout(searchCollaborators, 300);
    return () => clearTimeout(timeoutId);
  }, [collaboratorSearch, user?.token]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('thesisDraft.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        thesisDraft: { ...prev.thesisDraft, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Collaborator management functions
  const addCollaborator = (user) => {
    console.log('Adding collaborator:', user); // Debug log
    if (!formData.collaborators.some((c) => c._id === user._id)) {
      setFormData((prev) => ({
        ...prev,
        collaborators: [...prev.collaborators, user],
      }));
      setCollaboratorSearch('');
      setCollaboratorResults([]);
    }
  };

  const removeCollaborator = (userId) => {
    setFormData((prev) => ({
      ...prev,
      collaborators: prev.collaborators.filter((user) => user._id !== userId),
    }));
  };

  // Handle PDF file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file');
      e.target.value = '';
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setUploadError('File size exceeds 10MB limit');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('pdf', file);

      const res = await axios.post('/upload/pdf', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { pdfUrl, pdfFileName, pdfSize } = res.data;
      setFormData((prev) => ({
        ...prev,
        thesisDraft: {
          ...prev.thesisDraft,
          pdfUrl,
          pdfFileName,
          pdfSize,
        },
      }));
    } catch (err) {
      setUploadError(err.response?.data?.msg || 'Failed to upload PDF');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const parseCSV = (str) => str.split(',').map((s) => s.trim()).filter(Boolean);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: parseCSV(formData.tags),
        collaborators: formData.collaborators.map((user) => user._id),
        thesisDraft: {
          ...formData.thesisDraft,
          pdfSize: formData.thesisDraft.pdfSize ? Number(formData.thesisDraft.pdfSize) : undefined,
          version: Number(formData.thesisDraft.version),
        },
      };

      // Client-side validation
      if (!payload.link && !payload.thesisDraft.pdfUrl && !payload.thesisDraft.externalLink) {
        setError('Either project link or thesis draft (PDF URL or external link) is required');
        return;
      }

      if (payload.thesisDraft.pdfUrl && (!payload.thesisDraft.pdfFileName || !payload.thesisDraft.pdfSize)) {
        setError('Thesis draft PDF requires file name and size');
        return;
      }

      const res = await axios.put(`/projects/${editingProject._id}`, payload);
      console.log('Updated:', res.data);
      cancelForm();
      fetchMyProjects();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update project');
    }
  };

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

  const startEditing = async (project) => {
    console.log('Starting to edit project:', project); // Debug log
    console.log('Project collaborators:', project.collaborators); // Debug log
    
    setEditingProject(project);
    
    // Handle collaborators - if they're just IDs, we need to fetch user details
    let collaborators = project.collaborators || [];
    if (collaborators.length > 0 && typeof collaborators[0] === 'string') {
      // Collaborators are IDs, need to fetch user details
      try {
        const userPromises = collaborators.map(id => 
          axios.get(`/users/${id}`, {
            headers: { 'x-auth-token': user?.token || localStorage.getItem('token') }
          })
        );
        const userResponses = await Promise.all(userPromises);
        collaborators = userResponses.map(response => response.data.data || response.data);
      } catch (error) {
        console.error('Failed to fetch collaborator details:', error);
        collaborators = []; // Reset to empty if fetch fails
      }
    }
    
    setFormData({
      title: project.title || '',
      description: project.description || '',
      link: project.link || '',
      tags: (project.tags || []).join(', '),
      status: project.status || 'Planned',
      collaborators: collaborators,
      thesisDraft: {
        pdfUrl: project.thesisDraft?.pdfUrl || '',
        pdfFileName: project.thesisDraft?.pdfFileName || '',
        pdfSize: project.thesisDraft?.pdfSize || '',
        externalLink: project.thesisDraft?.externalLink || '',
        version: project.thesisDraft?.version || 1,
        thesisDescription: project.thesisDraft?.description || '',
      },
    });
  };

  const cancelForm = () => {
    setEditingProject(null);
    setDeletingProject(null);
    setFormData({
      title: '',
      description: '',
      link: '',
      tags: '',
      status: 'Planned',
      collaborators: [], // Consistent with initial state
      thesisDraft: {
        pdfUrl: '',
        pdfFileName: '',
        pdfSize: '',
        externalLink: '',
        version: 1,
        thesisDescription: '',
      },
    });
    setCollaboratorSearch('');
    setCollaboratorResults([]);
    setError(null);
    setUploadError(null);
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
              <h1 className="text-4xl font-bold mb-8 text-center">
                <span style={getGradientTextStyles('secondary')}>My Projects</span>
              </h1>

              {error && (
                <p className="text-center mb-4" style={{ color: colors.status.error.text }}>
                  {error}
                </p>
              )}

              {editingProject && (
                <form
                  onSubmit={handleUpdate}
                  className="max-w-2xl mx-auto rounded-xl p-8 mb-8 shadow-lg"
                  style={getCardStyles('glass')}
                >
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
                            {collaboratorResults.map((user) => (
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
      {formData.collaborators.map((user) => (
        <div key={user._id || user.id || Math.random()} className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: colors.background.tertiary }}>
          <span className="text-sm" style={{ color: colors.text.primary }}>
            {user.name || user.email || 'Unknown User'} {user.email && user.name ? `(${user.email})` : ''}
          </span>
          <button type="button" onClick={() => removeCollaborator(user._id || user.id)} style={{ color: colors.status.error.text }}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  </div>
)}
                    </div>

                    {/* Thesis Draft Fields */}
                    <h3 className="text-lg font-semibold mt-6" style={{ color: colors.text.primary }}>
                      Thesis Draft
                    </h3>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                        Upload PDF
                      </label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="w-full p-3 rounded-lg transition-all duration-200"
                        style={getInputStyles()}
                      />
                      {uploading && (
                        <p className="text-sm" style={{ color: colors.text.secondary }}>
                          Uploading...
                        </p>
                      )}
                      {uploadError && (
                        <p className="text-sm" style={{ color: colors.status.error.text }}>
                          {uploadError}
                        </p>
                      )}
                      {formData.thesisDraft.pdfFileName && (
                        <p
                          className="text-sm overflow-wrap break-word"
                          style={{
                            color: colors.text.secondary,
                            wordBreak: 'break-word',
                            maxWidth: '100%',
                          }}
                        >
                          Uploaded: {formData.thesisDraft.pdfFileName} (
                          {(formData.thesisDraft.pdfSize / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                    <input
                      type="url"
                      name="thesisDraft.externalLink"
                      value={formData.thesisDraft.externalLink}
                      onChange={handleChange}
                      placeholder="Thesis External Link"
                      className="w-full p-3 rounded-lg transition-all duration-200"
                      style={getInputStyles()}
                      onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                      onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                    />
                    <textarea
                      name="thesisDraft.thesisDescription"
                      value={formData.thesisDraft.thesisDescription}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Thesis Description"
                      className="w-full p-3 rounded-lg transition-all duration-200"
                      style={getInputStyles()}
                      onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                      onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                    />
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
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
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      style={getButtonStyles('primary')}
                      onMouseEnter={(e) =>
                        !uploading &&
                        Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' })
                      }
                      onMouseLeave={(e) =>
                        !uploading &&
                        Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' })
                      }
                    >
                      Update
                    </button>
                    
                  </div>
                </form>
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
                    <div key={project._id} className="relative group">
                      <ProjectCard {...project} />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(project)}
                          title="Edit"
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: colors.status.warning.background, color: colors.text.primary }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = colors.status.warning.backgroundHover[300])}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = colors.status.warning.background)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => confirmDelete(project)}
                          title="Delete"
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: colors.status.error.background, color: colors.text.primary }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = colors.button.danger.backgroundHover[300])}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = colors.status.error.background)}
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