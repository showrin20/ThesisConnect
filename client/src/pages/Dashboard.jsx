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
import axios from '../axios'; // Use the configured axios instance

// Import components
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import ForumActivityCard from '../components/ForumActivityCard';
import ProfileCard from '../components/DashboardProfileCard';
import ProjectForm from '../components/ProjectForm';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [recentProjects, setRecentProjects] = useState([]);
  const [forumActivity, setForumActivity] = useState([]);
  
  // Add missing state variables
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      setProjectsError(null);
      try {
        const response = await axios.get('/projects');
        console.log('API Response:', response.data); // Debug log
        
        // Your backend returns: { success: true, count: X, data: [...] }
        // So we need to access response.data.data for the actual projects array
        const projects = response.data?.data || [];
        
        setRecentProjects(projects);
      } catch (error) {
        setProjectsError('Failed to load projects');
        console.error('Failed to fetch projects:', error);
        setRecentProjects([]); // Ensure it's always an array
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Update stats to show actual project count
  const stats = [
    { 
      number: recentProjects.length.toString(), 
      label: 'Active Projects', 
      icon: Activity, 
      color: 'text-sky-400' 
    },
    { number: '0', label: 'Collaborators', icon: Users, color: 'text-purple-400' },
    { number: '0', label: 'Publications', icon: BookOpen, color: 'text-green-400' },
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

  const handleProjectCreated = (newProject) => {
    // The ProjectForm gets the response from backend which includes response.data.data
    // So we need to extract the actual project data
    const projectData = newProject?.data || newProject;
    setRecentProjects([projectData, ...recentProjects]);
    setShowProjectForm(false);
    
    // Optionally refresh the projects list
    // fetchProjects();
  };

  const fetchProjectsRefresh = async () => {
    try {
      const response = await axios.get('/projects');
      const projects = response.data?.data || [];
      setRecentProjects(projects);
    } catch (error) {
      console.error('Failed to refresh projects:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Topbar */}
          <Topbar 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />

          {/* Dashboard Content */}
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
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all duration-200">
                  <Users size={16} />
                  Find Collaborators
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-200">
                  <BookOpen size={16} />
                  Browse Publications
                </button>
              </div>

              {/* Show error if projects failed to load */}
              {projectsError && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <p className="text-red-300 text-sm">{projectsError}</p>
                  <button 
                    onClick={fetchProjectsRefresh}
                    className="mt-2 text-sm text-sky-400 hover:text-sky-300 underline"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Conditionally render ProjectForm */}
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

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <StatCard
                    key={index}
                    number={stat.number}
                    label={stat.label}
                    icon={stat.icon}
                    color={stat.color}
                  />
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Projects and Activity */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Recent Projects */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
                      <button 
                        onClick={() => navigate('/projects')}
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

                  {/* Forum Activity */}
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

                {/* Right Column - Profile and Quick Info */}
                <div className="space-y-6">
                  {/* Profile Card */}
                  <ProfileCard />

                  {/* Quick Stats */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">This Week</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">New Messages</span>
                        <span className="text-sky-400 font-semibold">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Project Updates</span>
                        <span className="text-purple-400 font-semibold">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Collaboration Requests</span>
                        <span className="text-green-400 font-semibold">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Deadlines Approaching</span>
                        <span className="text-yellow-400 font-semibold">0</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <p className="text-white/60 text-sm italic">No recent activity to show.</p>
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