import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, MapPin, BookOpen, Tag, Star, TrendingUp, Edit2, User, Mail } from 'lucide-react';
import axios from '../axios';
import statsService from '../services/statsService';

// Import Dashboard components
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';

export default function MyProfile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [projects, setProjects] = useState([]);
  
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

  // Fetch projects for sidebar counts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/projects');
        const projectsData = response.data?.data || [];
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"></div>
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

            {/* Loading Content */}
            <main className="flex-1 overflow-y-auto p-6">
              <div className="container mx-auto px-4 py-12">
                <div className="relative max-w-4xl mx-auto">
                  <div className="relative bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800 text-white rounded-xl shadow-2xl p-8">
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-400/20 rounded w-48 mx-auto mb-8"></div>
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-400/20 rounded-full"></div>
                          <div>
                            <div className="h-6 bg-gray-400/20 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-400/20 rounded w-64 mb-2"></div>
                            <div className="h-4 bg-gray-400/20 rounded w-56"></div>
                          </div>
                        </div>
                        <div className="h-10 bg-gray-400/20 rounded w-32"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-8 bg-gray-400/20 rounded w-full"></div>
                        <div className="h-20 bg-gray-400/20 rounded w-full"></div>
                        <div className="grid grid-cols-3 gap-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-400/20 rounded"></div>
                          ))}
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"></div>
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

            {/* No User Content */}
            <main className="flex-1 overflow-y-auto p-6">
              <div className="container mx-auto px-4 py-12">
                <div className="relative max-w-4xl mx-auto">
                  <div className="relative bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800 text-white rounded-xl shadow-2xl p-8 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-300 mb-4">No User Data Found</h2>
                    <p className="text-gray-400 mb-6">Please log in to view your profile.</p>
                    <Link
                      to="/auth"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      Go to Login
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"></div>
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

          {/* Profile Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto px-4 py-12">
              <div className="relative max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-50 animate-pulse"></div>
                <div className="relative card bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800 text-white rounded-xl shadow-2xl p-8 animate-fade-in">
                  <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
                    My Profile
                  </h1>

          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              {/* Name and University */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {user.name || 'Unknown User'}
                </h2>
                {user.university && (
                  <div className="flex items-center text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 mr-1 text-blue-400" />
                    <span className="text-sm truncate">{user.university}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-300 mb-2">
                  <Mail className="w-4 h-4 mr-1 text-blue-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.role && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : user.role === 'supervisor'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                )}
              </div>
            </div>
            <Link
              to="/settings"
              className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              aria-label="Edit my profile"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Link>
          </div>

          {/* Domain and Links */}
          {(user.domain || user.scholarLink || user.githubLink) && (
            <div className="mb-6">
              {user.domain && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 mb-4">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {user.domain}
                </span>
              )}
              
              {(user.scholarLink || user.githubLink) && (
                <div className="flex space-x-4 mt-4">
                  {user.scholarLink && (
                    <a
                      href={user.scholarLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      aria-label="Visit Google Scholar profile"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Google Scholar</span>
                    </a>
                  )}
                  {user.githubLink && (
                    <a
                      href={user.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      aria-label="Visit GitHub profile"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Keywords Section */}
          {user.keywords && user.keywords.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <Tag className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Research Keywords
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-700/50 text-gray-200 text-sm rounded-full hover:bg-blue-700/50 hover:text-blue-300 transition-colors duration-200 border border-slate-600/50"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Section - Using placeholder data since these aren't in the user model yet */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 rounded-lg p-4 text-center">
              <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold">{user.publications || '0'}</div>
              <div className="text-xs">Publications</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 text-green-800 rounded-lg p-4 text-center">
              <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold">{user.citations || '0'}</div>
              <div className="text-xs">Citations</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 rounded-lg p-4 text-center">
              <Star className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold">{user.hIndex || '0'}</div>
              <div className="text-xs">H-Index</div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Profile Completion</span>
              <span className="text-sm text-gray-400">
                {Math.round(
                  ((user.name ? 1 : 0) +
                   (user.email ? 1 : 0) +
                   (user.university ? 1 : 0) +
                   (user.domain ? 1 : 0) +
                   (user.keywords?.length > 0 ? 1 : 0) +
                   (user.scholarLink ? 1 : 0) +
                   (user.githubLink ? 1 : 0)) / 7 * 100
                )}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round(
                    ((user.name ? 1 : 0) +
                     (user.email ? 1 : 0) +
                     (user.university ? 1 : 0) +
                     (user.domain ? 1 : 0) +
                     (user.keywords?.length > 0 ? 1 : 0) +
                     (user.scholarLink ? 1 : 0) +
                     (user.githubLink ? 1 : 0)) / 7 * 100
                  )}%`
                }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Link
              to="/dashboard"
              className="relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              aria-label="Go to dashboard"
            >
              Back to Dashboard
              <span className="absolute inset-0 rounded-full border border-blue-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            
            <Link
              to="/settings"
              className="relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full shadow-lg hover:from-gray-700 hover:to-gray-800 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              aria-label="Edit profile settings"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
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