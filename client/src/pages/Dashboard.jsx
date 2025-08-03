import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Users, 
  BookOpen, 
  Clock,
  TrendingUp,
  Eye,
  ExternalLink
} from 'lucide-react';

// Import components
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import ForumActivityCard from '../components/ForumActivityCard';
import ProfileCard from '../components/DashboardProfileCard';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, navigate to login
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Sample data
  const stats = [
    { number: '12', label: 'Active Projects', icon: Activity, color: 'text-sky-400' },
    { number: '8', label: 'Collaborators', icon: Users, color: 'text-purple-400' },
    { number: '24', label: 'Publications', icon: BookOpen, color: 'text-green-400' },
  ];

  const recentProjects = [
    {
      title: 'Machine Learning for Climate Analysis',
      description: 'Developing predictive models to analyze climate change patterns using satellite data and advanced neural networks.',
      tags: ['Machine Learning', 'Climate'],
      status: 'Active',
      category: 'Data Science'
    }

  ];

  const forumActivity = [
    {
      title: 'Call for Papers: AI in Education Conference',
      snippet: 'Seeking innovative research on artificial intelligence applications in educational technology...',
      tags: ['Conference', 'AI'],
      time: '2 hours ago',
      category: 'Academic'
    },
    {
      title: 'Research Collaboration: NLP for Bengali',
      snippet: 'Looking for linguists and NLP researchers to work on Bengali language processing...',
      tags: ['NLP', 'Bengali'],
      time: '1 day ago',
      category: 'Collaboration'
    }
 
  ];

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
                <button className="flex items-center gap-2 px-4 py-2 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/30 transition-all duration-200">
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
                      <button className="flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-medium">
                        <span>View All</span>
                        <ExternalLink size={14} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {recentProjects.map((project, index) => (
                        <ProjectCard
                          key={index}
                          title={project.title}
                          description={project.description}
                          tags={project.tags}
                          status={project.status}
                          category={project.category}
                        />
                      ))}
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
                      {forumActivity.map((activity, index) => (
                        <ForumActivityCard
                          key={index}
                          title={activity.title}
                          snippet={activity.snippet}
                          tags={activity.tags}
                          time={activity.time}
                          category={activity.category}
                        />
                      ))}
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
                        <span className="text-sky-400 font-semibold">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Project Updates</span>
                        <span className="text-purple-400 font-semibold">5</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Collaboration Requests</span>
                        <span className="text-green-400 font-semibold">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Deadlines Approaching</span>
                        <span className="text-yellow-400 font-semibold">2</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-sky-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white/80 text-sm">Updated project documentation</p>
                          <p className="text-white/50 text-xs">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white/80 text-sm">Joined new collaboration</p>
                          <p className="text-white/50 text-xs">5 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white/80 text-sm">Published research paper</p>
                          <p className="text-white/50 text-xs">1 day ago</p>
                        </div>
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
