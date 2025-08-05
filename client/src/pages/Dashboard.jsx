import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Users, 
  BookOpen, 
  TrendingUp,
  ExternalLink
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
import ProfileCard from '../components/DashboardProfileCard';
import ProjectForm from '../components/ProjectForm';
import PublicationForm from '../components/PublicationForm';
import PublicationCard from '../components/ PublicationCard';
import PublicationSearch from '../components/PublicationSearch';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [showPublicationSearch, setShowPublicationSearch] = useState(false);

  // Projects state
  const [recentProjects, setRecentProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  // Publications state
  const [recentPublications, setRecentPublications] = useState([]);
  const [loadingPublications, setLoadingPublications] = useState(false);
  const [publicationsError, setPublicationsError] = useState(null);

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
        setStatsError('Failed to load statistics');
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
        const response = await axios.get('/projects');
        setRecentProjects(response.data?.data || []);
      } catch (error) {
        setProjectsError('Failed to load projects');
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
        setPublicationsError('Failed to load publications');
        setRecentPublications([]);
      } finally {
        setLoadingPublications(false);
      }
    };
    fetchPublications();
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
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Add new project to list & close form & refresh stats
  const handleProjectCreated = (newProject) => {
    const projectData = newProject?.data || newProject;
    setRecentProjects([projectData, ...recentProjects]);
    setShowProjectForm(false);
    
    // Refresh user stats
    if (user?.id) {
      statsService.getUserStats(user.id)
        .then(stats => setUserStats(stats))
        .catch(error => console.error('Failed to refresh stats:', error));
    }
  };

  // Add new publication to list & close form & refresh stats
  const handlePublicationCreated = (newPublication) => {
    const publicationData = newPublication?.data || newPublication;
    setRecentPublications([publicationData, ...recentPublications]);
    setShowPublicationForm(false);
    
    // Refresh user stats
    if (user?.id) {
      statsService.getUserStats(user.id)
        .then(stats => setUserStats(stats))
        .catch(error => console.error('Failed to refresh stats:', error));
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
      
      // Refresh user stats
      if (user?.id) {
        statsService.getUserStats(user.id)
          .then(stats => setUserStats(stats))
          .catch(error => console.error('Failed to refresh stats:', error));
      }
      
      return newPublication;
    } catch (error) {
      console.error('Failed to add publication:', error);
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
                    color: colors.primary.blue[400],
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
                    color: colors.accent.green[400],
                    borderColor: `${colors.accent.green[500]}4D`
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.green[500]}4D`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.green[500]}33`}
                >
                  <BookOpen size={16} />
                  Add Publication
                </button>
                <button 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: `${colors.primary.purple[500]}33`,
                    color: colors.primary.purple[400],
                    borderColor: `${colors.primary.purple[500]}4D`
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.primary.purple[500]}4D`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.primary.purple[500]}33`}
                >
                  <Users size={16} />
                  Find Collaborators
                </button>
                <button 
                  onClick={handleBrowsePublications}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: `${colors.primary.blue[600]}33`,
                    color: colors.primary.blue[400],
                    borderColor: `${colors.primary.blue[600]}4D`
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.primary.blue[600]}4D`}
                  onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.primary.blue[600]}33`}
                >
                  <BookOpen size={16} />
                  External Publication Finder
                </button>
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
                          .then(stats => setUserStats(stats))
                          .catch(error => console.error('Failed to refresh stats:', error));
                        setStatsError(null);
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
                      axios.get('/projects').then(res => setRecentProjects(res.data?.data || []));
                      setProjectsError(null);
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
                      axios.get('/publications').then(res => setRecentPublications(res.data?.data || []));
                      setPublicationsError(null);
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

                  <div 
                    className="backdrop-blur-lg rounded-xl p-6 border"
                    style={{
                      backgroundColor: colors.background.glass,
                      borderColor: colors.border.secondary
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>Recent Forum Activity</h2>
                      <button 
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
                      {forumActivity.length === 0 ? (
                        <p className="text-sm italic" style={{ color: `${colors.text.secondary}99` }}>No recent forum activity to show.</p>
                      ) : (
                        forumActivity.map((activity, index) => (
                          <ForumActivityCard
                            key={index}
                            title={activity.title}
                            snippet={activity.snippet}
                            tags={activity.tags}
                            time={activity.time}
                            category={activity.category}
                          />
                        ))
                      )}
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