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
      color: 'text-sky-400' 
    },
    { 
      number: loadingStats ? '...' : userStats.projects.planned.toString(), 
      label: 'Planned Projects', 
      icon: BookOpen, 
      color: 'text-yellow-400' 
    },
    { 
      number: loadingStats ? '...' : userStats.projects.inProgress.toString(), 
      label: 'In Progress', 
      icon: TrendingUp, 
      color: 'text-purple-400' 
    },
    { 
      number: loadingStats ? '...' : userStats.projects.completed.toString(), 
      label: 'Completed', 
      icon: Users, 
      color: 'text-green-400' 
    },
    { 
      number: loadingStats ? '...' : userStats.collaborators.total.toString(), 
      label: 'Collaborators', 
      icon: Users, 
      color: 'text-purple-400' 
    },
    { 
      number: loadingStats ? '...' : userStats.publications.total.toString(), 
      label: 'Publications', 
      icon: BookOpen, 
      color: 'text-green-400' 
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20">
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"></div>
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
                  className="flex items-center gap-2 px-4 py-2 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/30 transition-all duration-200"
                >
                  <TrendingUp size={16} />
                  Start New Project
                </button>
                <button
                  onClick={() => setShowPublicationForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-200"
                >
                  <BookOpen size={16} />
                  Add Publication
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all duration-200">
                  <Users size={16} />
                  Find Collaborators
                </button>
                <button 
                  onClick={handleBrowsePublications}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
                >
                  <BookOpen size={16} />
                  External Publication Finder
                </button>
              </div>

              {/* Error Messages */}
              {statsError && (
                <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                  <p className="text-yellow-300 text-sm">{statsError}</p>
                  <button 
                    onClick={() => {
                      if (user?.id) {
                        statsService.getUserStats(user.id)
                          .then(stats => setUserStats(stats))
                          .catch(error => console.error('Failed to refresh stats:', error));
                        setStatsError(null);
                      }
                    }}
                    className="mt-2 text-sm text-yellow-400 hover:text-yellow-300 underline"
                  >
                    Retry Loading Stats
                  </button>
                </div>
              )}
              
              {projectsError && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <p className="text-red-300 text-sm">{projectsError}</p>
                  <button 
                    onClick={() => {
                      axios.get('/projects').then(res => setRecentProjects(res.data?.data || []));
                      setProjectsError(null);
                    }}
                    className="mt-2 text-sm text-sky-400 hover:text-sky-300 underline"
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              {publicationsError && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <p className="text-red-300 text-sm">{publicationsError}</p>
                  <button 
                    onClick={() => {
                      axios.get('/publications').then(res => setRecentPublications(res.data?.data || []));
                      setPublicationsError(null);
                    }}
                    className="mt-2 text-sm text-green-400 hover:text-green-300 underline"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Modals */}
              {showProjectForm && (
                <div className="mb-6 p-6 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Create New Project</h3>
                    <button
                      onClick={() => setShowProjectForm(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <ProjectForm onProjectCreated={handleProjectCreated} />
                </div>
              )}

              {showPublicationForm && (
                <div className="mb-6 p-6 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Add Publication</h3>
                    <button
                      onClick={() => setShowPublicationForm(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <PublicationForm onPublicationCreated={handlePublicationCreated} />
                </div>
              )}

              {showPublicationSearch && (
                <div className="mb-6 p-6 bg-white/10 rounded-xl border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Browse Publications</h3>
                    <button
                      onClick={() => setShowPublicationSearch(false)}
                      className="text-gray-400 hover:text-white transition-colors"
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
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
                      <button 
                        onClick={() => navigate('/my-projects')}
                        className="flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium"
                      >
                        <span>View All</span>
                        <ExternalLink size={14} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {loadingProjects ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin"></div>
                          <span className="ml-2 text-white/60">Loading projects...</span>
                        </div>
                      ) : recentProjects.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-white/60 text-sm italic mb-4">No projects yet.</p>
                          <button
                            onClick={() => setShowProjectForm(true)}
                            className="text-sky-400 hover:text-sky-300 text-sm underline"
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
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Recent Publications</h2>
                      <button 
                        onClick={() => navigate('/my-publications')}
                        className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium"
                      >
                        <span>View All</span>
                        <ExternalLink size={14} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {loadingPublications ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                          <span className="ml-2 text-white/60">Loading publications...</span>
                        </div>
                      ) : recentPublications.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-white/60 text-sm italic mb-4">No publications yet.</p>
                          <button
                            onClick={() => setShowPublicationForm(true)}
                            className="text-green-400 hover:text-green-300 text-sm underline"
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

                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">This Week</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">New Messages</span>
                        <span className="text-sky-400 font-semibold">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Project Updates</span>
                        <span className="text-purple-400 font-semibold">{loadingStats ? '...' : userStats.projects.inProgress}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Collaboration Requests</span>
                        <span className="text-green-400 font-semibold">0</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Recent Forum Activity</h2>
                      <button className="flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium">
                        <span>View All</span>
                        <ExternalLink size={14} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {forumActivity.length === 0 ? (
                        <p className="text-white/60 text-sm italic">No recent forum activity to show.</p>
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