import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { 
  Activity, 
  Users, 
  BookOpen, 
  TrendingUp,
  ExternalLink,
  FileText
} from 'lucide-react';
import axios from '../axios';
import statsService from '../services/statsService';
import { colors } from '../styles/colors';
import { getCardStyles, getButtonStyles, getGradientTextStyles } from '../styles/styleUtils';

// Components
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import ForumActivityCard from '../components/ForumActivityCard';
import BlogForm from '../components/BlogForm';
import ProfileCard from '../components/DashboardProfileCard';
import ProjectForm from '../components/ProjectForm';
import PublicationForm from '../components/PublicationForm';
import PublicationCard from '../components/PublicationCard';
import PublicationSearch from '../components/PublicationSearch';
import CommunityPostCard from '../components/CommunityPostCard';
import CommunityPostForm from '../components/CommunityPostForm';


export default function Dashboard() {
  const { user, logout } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useAlert();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [showPublicationSearch, setShowPublicationSearch] = useState(false);
  const [showCommunityPostForm, setShowCommunityPostForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogFormError, setBlogFormError] = useState(null);
  const [blogFormLoading, setBlogFormLoading] = useState(false);

  // Projects state
  const [recentProjects, setRecentProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  // Publications state
  const [recentPublications, setRecentPublications] = useState([]);
  const [loadingPublications, setLoadingPublications] = useState(false);
  const [publicationsError, setPublicationsError] = useState(null);

  // Forum activity state
  const [recentCommunityPosts, setRecentCommunityPosts] = useState([]);
  const [loadingCommunityPosts, setLoadingCommunityPosts] = useState(false);
  const [communityPostsError, setCommunityPostsError] = useState(null);


  // Statistics state
  const [userStats, setUserStats] = useState({
    projects: { total: 0, planned: 0, inProgress: 0, completed: 0 },
    publications: { total: 0, byType: {}, totalCitations: 0 },
    collaborators: { total: 0 },
    activity: { recentProjects: [], recentPublications: [] }
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // Forum activity state
  const [forumActivity, setForumActivity] = useState([]);


  // Fetch user statistics on mount
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id) return;
      
      setLoadingStats(true);
      setStatsError(null);
      try {
        const stats = await statsService.getUserStats(user.id);
        setUserStats(stats);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load statistics';
        setStatsError(errorMessage);
        showError(`Error loading statistics: ${errorMessage}`);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchUserStats();
  }, [user?.id]);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      setProjectsError(null);
      try {
        // Use the my-projects endpoint which fetches both created and collaborated projects
        const response = await axios.get('/projects/my-projects');
        setRecentProjects(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load projects';
        setProjectsError(errorMessage);
        
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          showError('Cannot connect to server. Please make sure the backend server is running.');
        } else {
          showError(`Error loading projects: ${errorMessage}`);
        }
        setRecentProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch publications on mount
  useEffect(() => {
    const fetchPublications = async () => {
      setLoadingPublications(true);
      setPublicationsError(null);
      try {
        const response = await axios.get('/publications');
        setRecentPublications(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch publications:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load publications';
        setPublicationsError(errorMessage);
        
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          showError('Cannot connect to server. Please make sure the backend server is running.');
        } else {
          showError(`Error loading publications: ${errorMessage}`);
        }
        setRecentPublications([]);
      } finally {
        setLoadingPublications(false);
      }
    };
    fetchPublications();
  }, []);

  // Fetch community posts on mount
  useEffect(() => {
    const fetchCommunityPosts = async () => {
      setLoadingCommunityPosts(true);
      setCommunityPostsError(null);
      try {
        const response = await axios.get('/community-posts');
        setRecentCommunityPosts(response.data?.data?.posts || []);
      } catch (error) {
        console.error('Failed to fetch community posts:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load community posts';
        setCommunityPostsError(errorMessage);
        
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          showError('Cannot connect to server. Please make sure the backend server is running.');
        } else {
          showError(`Error loading community posts: ${errorMessage}`);
        }
        setRecentCommunityPosts([]);
      } finally {
        setLoadingCommunityPosts(false);
      }
    };
    fetchCommunityPosts();
  }, []);




  // Stats grid with dynamic numbers from API
  const stats = [
    { 
      number: loadingStats ? '...' : userStats.projects.total.toString(), 
      label: 'Total Projects', 
      icon: Activity, 
      color: colors.primary.blue[400]
    },
    { 
      number: loadingStats ? '...' : userStats.projects.planned.toString(), 
      label: 'Planned Projects', 
      icon: BookOpen, 
      color: colors.accent.yellow[400]
    },
    { 
      number: loadingStats ? '...' : userStats.projects.inProgress.toString(), 
      label: 'In Progress', 
      icon: TrendingUp, 
      color: colors.primary.purple[400]
    },
    { 
      number: loadingStats ? '...' : userStats.projects.completed.toString(), 
      label: 'Completed', 
      icon: Users, 
      color: colors.accent.green[400]
    },
    { 
      number: loadingStats ? '...' : userStats.collaborators.total.toString(), 
      label: 'Collaborators', 
      icon: Users, 
      color: colors.primary.purple[400]
    },
    { 
      number: loadingStats ? '...' : userStats.publications.total.toString(), 
      label: 'Publications', 
      icon: BookOpen, 
      color: colors.accent.green[400]
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      showSuccess('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to logout';
      showError(`Logout failed: ${errorMessage}`);
      // Still navigate to login page even if logout fails
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Add new project to list & close form & refresh stats
  const handleProjectCreated = (newProject) => {
    try {
      const projectData = newProject?.data || newProject;
      setRecentProjects([projectData, ...recentProjects]);
      setShowProjectForm(false);
      showSuccess('Project created successfully!');
      
      // Refresh user stats and projects list to ensure collaboration projects are included
      if (user?.id) {
        Promise.all([
          statsService.getUserStats(user.id),
          axios.get('/projects/my-projects')
        ])
        .then(([stats, projectsRes]) => {
          setUserStats(stats);
          setRecentProjects(projectsRes.data?.data || []);
        })
        .catch(error => {
          console.error('Failed to refresh data:', error);
          showWarning('Project created but failed to refresh dashboard data. Please refresh the page.');
        });
      }
    } catch (error) {
      console.error('Error handling project creation:', error);
      showError('Project may have been created but there was an error updating the display. Please refresh the page.');
    }
  };

  // Add new publication to list & close form & refresh stats
  const handlePublicationCreated = (newPublication) => {
    try {
      const publicationData = newPublication?.data || newPublication;
      setRecentPublications([publicationData, ...recentPublications]);
      setShowPublicationForm(false);
      showSuccess('Publication added successfully!');
      
      // Refresh user stats
      if (user?.id) {
        statsService.getUserStats(user.id)
          .then(stats => setUserStats(stats))
          .catch(error => {
            console.error('Failed to refresh stats:', error);
            showWarning('Publication added but failed to refresh statistics. Please refresh the page.');
          });
      }
    } catch (error) {
      console.error('Error handling publication creation:', error);
      showError('Publication may have been added but there was an error updating the display. Please refresh the page.');
    }
  };

  // Add new community post to list & close form & refresh stats
  const handleCommunityPostCreated = (newPost) => {
    try {
      const postData = newPost?.data || newPost;
      setRecentCommunityPosts([postData, ...recentCommunityPosts]);
      setShowCommunityPostForm(false);
      showSuccess('Community post created successfully!');
      
      // Refresh user stats
      if (user?.id) {
        statsService.getUserStats(user.id)
          .then(stats => setUserStats(stats))
          .catch(error => {
            console.error('Failed to refresh stats:', error);
            showWarning('Community post created but failed to refresh statistics. Please refresh the page.');
          });
      }
    } catch (error) {
      console.error('Error handling community post creation:', error);
      showError('Community post may have been created but there was an error updating the display. Please refresh the page.');
    }
  };

  // Blog form state and handlers
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Technology',
    tags: '',
    status: 'draft',
    featuredImage: null,
  });

  const handleBlogFormChange = (e) => {
    const { name, value, files } = e.target;
    setBlogFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const resetBlogForm = () => {
    setBlogFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'Technology',
      tags: '',
      status: 'draft',
      featuredImage: null,
    });
    setBlogFormError(null);
    setBlogFormLoading(false);
  };

  const parseCSV = (str) =>
    str.split(',').map(s => s.trim()).filter(Boolean);

  // Test server connection function
  const testServerConnection = async () => {
    try {
      console.log('🔍 Testing server connection...');
      const response = await axios.get('/test');
      console.log('✅ Server connection successful:', response.data);
      showSuccess('✅ Server connection successful!');
    } catch (error) {
      console.error('❌ Server connection failed:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        showError('❌ Server is not running. Please start your backend server.');
      } else {
        showError(`❌ Connection test failed: ${error.message}`);
      }
    }
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    setBlogFormLoading(true);
    setBlogFormError(null);
    
    try {
      console.log('🚀 Starting blog submission...');
      console.log('📝 Blog form data:', blogFormData);
      
      // Validate required fields on frontend
      if (!blogFormData.title?.trim()) {
        setBlogFormError('Blog title is required');
        return;
      }
      if (!blogFormData.content?.trim()) {
        setBlogFormError('Blog content is required');
        return;
      }
      if (!blogFormData.excerpt?.trim()) {
        setBlogFormError('Blog excerpt is required');
        return;
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', blogFormData.title.trim());
      formDataToSend.append('content', blogFormData.content.trim());
      formDataToSend.append('excerpt', blogFormData.excerpt.trim());
      formDataToSend.append('category', blogFormData.category);
      formDataToSend.append('status', blogFormData.status);
      formDataToSend.append('tags', JSON.stringify(parseCSV(blogFormData.tags)));
      
      if (blogFormData.featuredImage) {
        // Validate file size (5MB limit)
        if (blogFormData.featuredImage.size > 5 * 1024 * 1024) {
          setBlogFormError('Featured image must be less than 5MB');
          return;
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(blogFormData.featuredImage.type)) {
          setBlogFormError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
          return;
        }
        
        formDataToSend.append('featuredImage', blogFormData.featuredImage);
      }

      // Log FormData contents for debugging
      console.log('📤 Sending FormData:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const res = await axios.post('/blogs', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('✅ Blog created successfully:', res.data);
      
      // Check response structure for both success and error cases
      if (res.data.success === true) {
        showSuccess(res.data.message || 'Blog created successfully!');
        
        // Success case - close form and reset
        setShowBlogForm(false);
        resetBlogForm();
        
        // Refresh user stats
        if (user?.id) {
          statsService.getUserStats(user.id)
            .then(stats => setUserStats(stats))
            .catch(error => {
              console.error('Failed to refresh stats:', error);
              showWarning('Blog created but failed to refresh statistics. Please refresh the page.');
            });
        }
      } else if (res.data.success === false) {
        // Handle validation errors from backend
        if (res.data.errors && Array.isArray(res.data.errors)) {
          const errorMessage = res.data.errors.join('\n');
          setBlogFormError(errorMessage);
          showError(`Validation Errors:\n${errorMessage}`);
          return;
        } else if (res.data.message) {
          setBlogFormError(res.data.message);
          showError(`Error: ${res.data.message}`);
          return;
        }
      } else {
        // Fallback for unexpected response structure
        showSuccess('Blog created successfully!');
        setShowBlogForm(false);
        resetBlogForm();
      }
    } catch (err) {
      console.error('❌ Blog creation error:', err);
      
      // Enhanced error handling
      if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        const errorMsg = 'Server is not running. Please start your backend server and try again.';
        setBlogFormError(errorMsg);
        showError(`Network Error: ${errorMsg}`);
      } else if (err.response) {
        // Server responded with error
        const errorData = err.response.data;
        console.log('Server error response:', errorData);
        
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          const errorMessage = errorData.errors.join('\n');
          setBlogFormError(errorMessage);
          showError(`Validation Errors:\n${errorMessage}`);
        } else if (errorData?.message) {
          setBlogFormError(errorData.message);
          showError(`Server Error: ${errorData.message}`);
        } else {
          const errorMsg = `Server error: ${err.response.status} ${err.response.statusText}`;
          setBlogFormError(errorMsg);
          showError(errorMsg);
        }
      } else if (err.request) {
        const errorMsg = 'Network error: Unable to connect to the server. Please check your internet connection.';
        setBlogFormError(errorMsg);
        showError(errorMsg);
      } else {
        const errorMsg = `Request error: ${err.message}`;
        setBlogFormError(errorMsg);
        showError(errorMsg);
      }
    } finally {
      setBlogFormLoading(false);
    }
  };

  // Browse publications handler
  const handleBrowsePublications = () => {
    setShowPublicationSearch(true);
  };

  // Add publication from external search
  const handleAddPublicationFromSearch = async (publicationData) => {
    try {
      const response = await axios.post('/publications', publicationData);
      const newPublication = response.data?.data || response.data;
      setRecentPublications([newPublication, ...recentPublications]);
      
      showSuccess('Publication added successfully from external search!');
      
      // Refresh user stats
      if (user?.id) {
        statsService.getUserStats(user.id)
          .then(stats => setUserStats(stats))
          .catch(error => {
            console.error('Failed to refresh stats:', error);
            showWarning('Publication added but failed to refresh statistics. Please refresh the page.');
          });
      }
      
      return newPublication;
    } catch (error) {
      console.error('Failed to add publication:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add publication';
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        showError('Cannot connect to server. Please make sure the backend server is running.');
      } else {
        showError(`Failed to add publication: ${errorMessage}`);
      }
      
      throw error;
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${colors.gradients.background.main}, ${colors.gradients.background.hero})`
      }}
    >
      <div className="absolute inset-0 opacity-30">
        <div 
          className="h-full w-full"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.primary.blue[400]}1A, transparent 50%)`
          }}
        ></div>
      </div>

      <div className="relative flex h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          projects={recentProjects}
          userStats={userStats}
        />

        <div className="flex-1 flex flex-col lg:ml-0">
          <Topbar 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: `${colors.primary.blue[500]}33`,
                    color: colors.text.primary,
                    borderColor: `${colors.primary.blue[500]}4D`
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.primary.blue[500]}4D`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.primary.blue[500]}33`}
                >
                  <TrendingUp size={16} />
                  Start New Project
                </button>
                
                <button
                  onClick={() => setShowPublicationForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: `${colors.accent.green[500]}33`,
                    color: colors.text.primary,
                    borderColor: `${colors.accent.green[500]}4D`
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.green[500]}4D`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.green[500]}33`}
                >
                  <BookOpen size={16} />
                  Add Publication
                </button>
                
                <button
                  onClick={() => setShowCommunityPostForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: `${colors.primary.purple[500]}33`,
                    color: colors.text.primary,
                    borderColor: `${colors.primary.purple[500]}4D`
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.primary.purple[500]}4D`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.primary.purple[500]}33`}
                >
                  <Users size={16} />
                  Create Community Post
                </button>
                
                <button
                  onClick={() => setShowBlogForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: `${colors.accent.yellow[500]}33`,
                    color: colors.text.primary,
                    borderColor: `${colors.accent.yellow[500]}4D`
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.yellow[500]}4D`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.yellow[500]}33`}
                >
                  <FileText size={16} />
                  Create Blog Post
                </button>
                {/* <button 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: `${colors.accent.orange[500]}33`,
                    color: colors.text.primary,
                    borderColor: `${colors.accent.orange[500]}4D`
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.orange[500]}4D`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.orange[500]}33`}
                >
                  <Users size={16} />
                  Bookmarks
                </button> */}


                
                <button 
                  onClick={handleBrowsePublications}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: `${colors.primary.blue[300]}33`,
                    color: colors.text.primary,
                    borderColor: `${colors.primary.blue[600]}4D`
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.primary.blue[600]}4D`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.primary.blue[600]}33`}
                >
                  <BookOpen size={16} />
                  External Publication Finder
                </button>
                
                {/* Temporary Debug Button */}
                {/* <button 
                  onClick={testServerConnection}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: `${colors.accent.red[500]}33`,
                    color: colors.accent.red[400],
                    borderColor: `${colors.accent.red[500]}4D`
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.red[500]}4D`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.red[500]}33`}
                >
                  <Activity size={16} />
                  Test Server
                </button> */}
              </div>

              {/* Error Messages */}
              {statsError && (
                <div 
                  className="mb-6 p-4 rounded-lg border"
                  style={{
                    backgroundColor: `${colors.accent.yellow[500]}33`,
                    borderColor: `${colors.accent.yellow[500]}80`
                  }}
                >
                  <p className="text-sm" style={{ color: colors.accent.yellow[300] }}>{statsError}</p>
                  <button 
                    onClick={() => {
                      if (user?.id) {
                        statsService.getUserStats(user.id)
                          .then(stats => {
                            setUserStats(stats);
                            setStatsError(null);
                            showSuccess('Statistics loaded successfully!');
                          })
                          .catch(error => {
                            console.error('Failed to refresh stats:', error);
                            const errorMessage = error.response?.data?.message || error.message || 'Failed to load statistics';
                            showError(`Failed to reload statistics: ${errorMessage}`);
                          });
                      }
                    }}
                    className="mt-2 text-sm underline transition-colors"
                    style={{ color: colors.accent.yellow[400] }}
                    onMouseEnter={(e) => e.target.style.color = colors.accent.yellow[300]}
                    onMouseLeave={(e) => e.target.style.color = colors.accent.yellow[400]}
                  >
                    Retry Loading Stats
                  </button>
                </div>
              )}
              
              {projectsError && (
                <div 
                  className="mb-6 p-4 rounded-lg border"
                  style={{
                    backgroundColor: `${colors.accent.red[500]}33`,
                    borderColor: `${colors.accent.red[500]}80`
                  }}
                >
                  <p className="text-sm" style={{ color: colors.accent.red[300] }}>{projectsError}</p>
                  <button 
                    onClick={() => {
                      axios.get('/projects')
                        .then(res => {
                          setRecentProjects(res.data?.data || []);
                          setProjectsError(null);
                          showSuccess('Projects loaded successfully!');
                        })
                        .catch(error => {
                          console.error('Failed to reload projects:', error);
                          const errorMessage = error.response?.data?.message || error.message || 'Failed to load projects';
                          showError(`Failed to reload projects: ${errorMessage}`);
                        });
                    }}
                    className="mt-2 text-sm underline transition-colors"
                    style={{ color: colors.primary.blue[400] }}
                    onMouseEnter={(e) => e.target.style.color = colors.primary.blue[300]}
                    onMouseLeave={(e) => e.target.style.color = colors.primary.blue[400]}
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              {publicationsError && (
                <div 
                  className="mb-6 p-4 rounded-lg border"
                  style={{
                    backgroundColor: `${colors.accent.red[500]}33`,
                    borderColor: `${colors.accent.red[500]}80`
                  }}
                >
                  <p className="text-sm" style={{ color: colors.accent.red[300] }}>{publicationsError}</p>
                  <button 
                    onClick={() => {
                      axios.get('/publications')
                        .then(res => {
                          setRecentPublications(res.data?.data || []);
                          setPublicationsError(null);
                          showSuccess('Publications loaded successfully!');
                        })
                        .catch(error => {
                          console.error('Failed to reload publications:', error);
                          const errorMessage = error.response?.data?.message || error.message || 'Failed to load publications';
                          showError(`Failed to reload publications: ${errorMessage}`);
                        });
                    }}
                    className="mt-2 text-sm underline transition-colors"
                    style={{ color: colors.accent.green[400] }}
                    onMouseEnter={(e) => e.target.style.color = colors.accent.green[300]}
                    onMouseLeave={(e) => e.target.style.color = colors.accent.green[400]}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {communityPostsError && (
                <div 
                  className="mb-6 p-4 rounded-lg border"
                  style={{
                    backgroundColor: `${colors.accent.red[500]}33`,
                    borderColor: `${colors.accent.red[500]}80`
                  }}
                >
                  <p className="text-sm" style={{ color: colors.accent.red[300] }}>{communityPostsError}</p>
                  <button 
                    onClick={() => {
                      axios.get('/community-posts').then(res => setRecentCommunityPosts(res.data?.data?.posts || []));
                      setCommunityPostsError(null);
                    }}
                    className="mt-2 text-sm underline transition-colors"
                    style={{ color: colors.primary.purple[400] }}
                    onMouseEnter={(e) => e.target.style.color = colors.primary.purple[300]}
                    onMouseLeave={(e) => e.target.style.color = colors.primary.purple[400]}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Modals */}
              {showProjectForm && (
                <div 
                  className="mb-6 p-6 backdrop-blur-lg rounded-xl border"
                  style={{
                    backgroundColor: colors.background.glass,
                    borderColor: colors.border.secondary
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>Create New Project</h3>
                    <button
                      onClick={() => setShowProjectForm(false)}
                      className="transition-colors"
                      style={{ color: colors.text.muted }}
                      onMouseEnter={(e) => e.target.style.color = colors.text.primary}
                      onMouseLeave={(e) => e.target.style.color = colors.text.muted}
                    >
                      ✕
                    </button>
                  </div>
                  <ProjectForm onProjectCreated={handleProjectCreated} />
                </div>
              )}

              {showPublicationForm && (
                <div 
                  className="mb-6 p-6 backdrop-blur-lg rounded-xl border"
                  style={{
                    backgroundColor: colors.background.glass,
                    borderColor: colors.border.secondary
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>Add Publication</h3>
                    <button
                      onClick={() => setShowPublicationForm(false)}
                      className="transition-colors"
                      style={{ color: colors.text.muted }}
                      onMouseEnter={(e) => e.target.style.color = colors.text.primary}
                      onMouseLeave={(e) => e.target.style.color = colors.text.muted}
                    >
                      ✕
                    </button>
                  </div>
                  <PublicationForm onPublicationCreated={handlePublicationCreated} />
                </div>
              )}

              {showPublicationSearch && (
                <div 
                  className="mb-6 p-6 backdrop-blur-lg rounded-xl border"
                  style={{
                    backgroundColor: colors.background.glass,
                    borderColor: colors.border.secondary
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>Browse Publications</h3>
                    <button
                      onClick={() => setShowPublicationSearch(false)}
                      className="transition-colors"
                      style={{ color: colors.text.muted }}
                      onMouseEnter={(e) => e.target.style.color = colors.text.primary}
                      onMouseLeave={(e) => e.target.style.color = colors.text.muted}
                    >
                      ✕
                    </button>
                  </div>
                  <PublicationSearch onPublicationAdd={handleAddPublicationFromSearch} />
                </div>
              )}

              {showCommunityPostForm && (
                <div 
                  className="mb-6 p-6 backdrop-blur-lg rounded-xl border"
                  style={{
                    backgroundColor: colors.background.glass,
                    borderColor: colors.border.secondary
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>Create Community Post</h3>
                    <button
                      onClick={() => setShowCommunityPostForm(false)}
                      className="transition-colors"
                      style={{ color: colors.text.muted }}
                      onMouseEnter={(e) => e.target.style.color = colors.text.primary}
                      onMouseLeave={(e) => e.target.style.color = colors.text.muted}
                    >
                      ✕
                    </button>
                  </div>
                  <CommunityPostForm onPostCreated={handleCommunityPostCreated} />
                </div>
              )}

              {showBlogForm && (
                <div 
                  className="mb-6 p-6 backdrop-blur-lg rounded-xl border"
                  style={{
                    backgroundColor: colors.background.glass,
                    borderColor: colors.border.secondary
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>Create New Blog</h3>
                    <button
                      onClick={() => setShowBlogForm(false)}
                      className="transition-colors"
                      style={{ color: colors.text.muted }}
                      onMouseEnter={(e) => e.target.style.color = colors.text.primary}
                      onMouseLeave={(e) => e.target.style.color = colors.text.muted}
                    >
                      ✕
                    </button>
                  </div>
                  <BlogForm 
                    formData={blogFormData}
                    onChange={handleBlogFormChange}
                    onSubmit={handleBlogSubmit}
                    onCancel={() => {
                      setShowBlogForm(false);
                      resetBlogForm();
                    }}
                    isEditing={false}
                    error={blogFormError}
                    loading={blogFormLoading}
                    success={false}
                  />
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                  <StatCard
                    key={idx}
                    number={stat.number}
                    label={stat.label}
                    icon={stat.icon}
                    color={stat.color}
                  />
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  {/* Recent Projects */}
                  <div 
                    className="backdrop-blur-lg rounded-xl p-6 border"
                    style={{
                      backgroundColor: colors.background.glass,
                      borderColor: colors.border.secondary
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>Recent Projects</h2>
                      <button 
                        onClick={() => navigate('/my-projects')}
                        className="flex items-center gap-2 text-sm font-medium transition-colors"
                        style={{ color: colors.primary.blue[400] }}
                        onMouseEnter={(e) => e.target.style.color = colors.primary.blue[300]}
                        onMouseLeave={(e) => e.target.style.color = colors.primary.blue[400]}
                      >
                        <span>View All</span>
                        <ExternalLink size={14} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {loadingProjects ? (
                        <div className="flex items-center justify-center py-8">
                          <div 
                            className="w-6 h-6 border-2 rounded-full animate-spin"
                            style={{
                              borderColor: `${colors.primary.blue[400]}4D`,
                              borderTopColor: colors.primary.blue[400]
                            }}
                          ></div>
                          <span className="ml-2" style={{ color: `${colors.text.secondary}99` }}>Loading projects...</span>
                        </div>
                      ) : recentProjects.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm italic mb-4" style={{ color: `${colors.text.secondary}99` }}>No projects yet.</p>
                          <button
                            onClick={() => setShowProjectForm(true)}
                            className="text-sm underline transition-colors"
                            style={{ color: colors.primary.blue[400] }}
                            onMouseEnter={(e) => e.target.style.color = colors.primary.blue[300]}
                            onMouseLeave={(e) => e.target.style.color = colors.primary.blue[400]}
                          >
                            Create your first project
                          </button>
                        </div>
                      ) : (
                        recentProjects.slice(0, 3).map((project, index) => (
                          <ProjectCard
                            key={project._id || index}
                            title={project.title}
                            description={project.description}
                            link={project.link}
                            tags={project.tags}
                            status={project.status}
                            category={project.category}
                            creator={project.creator?.name}
                            createdAt={project.createdAt}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Publications */}
                  <div 
                    className="backdrop-blur-lg rounded-xl p-6 border"
                    style={{
                      backgroundColor: colors.background.glass,
                      borderColor: colors.border.secondary
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>Recent Publications</h2>
                      <button 
                        onClick={() => navigate('/my-publications')}
                        className="flex items-center gap-2 text-sm font-medium transition-colors"
                        style={{ color: colors.accent.green[400] }}
                        onMouseEnter={(e) => e.target.style.color = colors.accent.green[300]}
                        onMouseLeave={(e) => e.target.style.color = colors.accent.green[400]}
                      >
                        <span>View All</span>
                        <ExternalLink size={14} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {loadingPublications ? (
                        <div className="flex items-center justify-center py-8">
                          <div 
                            className="w-6 h-6 border-2 rounded-full animate-spin"
                            style={{
                              borderColor: `${colors.accent.green[400]}4D`,
                              borderTopColor: colors.accent.green[400]
                            }}
                          ></div>
                          <span className="ml-2" style={{ color: `${colors.text.secondary}99` }}>Loading publications...</span>
                        </div>
                      ) : recentPublications.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm italic mb-4" style={{ color: `${colors.text.secondary}99` }}>No publications yet.</p>
                          <button
                            onClick={() => setShowPublicationForm(true)}
                            className="text-sm underline transition-colors"
                            style={{ color: colors.accent.green[400] }}
                            onMouseEnter={(e) => e.target.style.color = colors.accent.green[300]}
                            onMouseLeave={(e) => e.target.style.color = colors.accent.green[400]}
                          >
                            Add your first publication
                          </button>
                        </div>
                      ) : (
                        recentPublications.slice(0, 3).map((pub, idx) => (
                          <PublicationCard
                            key={pub._id || idx}
                            title={pub.title}
                            authors={pub.authors}
                            year={pub.year}
                            venue={pub.venue}
                            tags={pub.tags}
                            doi={pub.doi}
                            abstract={pub.abstract}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  
                </div>

                {/* Right Column - Profile and Quick Info */}
                <div className="space-y-6">
                  <ProfileCard userStats={userStats} loadingStats={loadingStats} />

                  <div 
                    className="backdrop-blur-lg rounded-xl p-6 border"
                    style={{
                      backgroundColor: colors.background.glass,
                      borderColor: colors.border.secondary
                    }}
                  >
                    <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>This Week</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: `${colors.text.secondary}CC` }}>New Messages</span>
                        <span className="font-semibold" style={{ color: colors.primary.blue[400] }}>0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: `${colors.text.secondary}CC` }}>Project Updates</span>
                        <span className="font-semibold" style={{ color: colors.primary.purple[400] }}>{loadingStats ? '...' : userStats.projects.inProgress}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: `${colors.text.secondary}CC` }}>Collaboration Requests</span>
                        <span className="font-semibold" style={{ color: colors.accent.green[400] }}>0</span>
                      </div>
                    </div>
                  </div>




                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}