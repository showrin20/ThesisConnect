import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, MapPin, BookOpen, Tag, Star, TrendingUp, Edit2, User, Mail } from 'lucide-react';
import axios from '../axios';
import statsService from '../services/statsService';
import { colors } from '../styles/colors';

import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';

export default function MyProfile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [projects, setProjects] = useState([]);
  const [userStats, setUserStats] = useState({
    projects: { total: 0, planned: 0, inProgress: 0, completed: 0 },
    publications: { total: 0, byType: {}, totalCitations: 0 },
    collaborators: { total: 0 }
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Colors for light/dark mode
  const baseBg = colors.surface.primary;        // white in light, light in dark
  const baseText = colors.text.primary;         // dark in light, light in dark
  const mutedText = colors.text.muted;          // gray text
  const secondaryText = colors.text.secondary;  // secondary text color
  const cardBgLight = colors.surface.secondary; // light card bg
  const cardBgDark = colors.background.gray[300]; // dark card bg
  const borderColor = colors.border.primary;

  useEffect(() => {
    if (!user?.id) return;
    setLoadingStats(true);
    statsService.getUserStats(user.id)
      .then(setUserStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [user?.id]);

  useEffect(() => {
    axios.get('/projects')
      .then(res => setProjects(res.data?.data || []))
      .catch(err => {
        console.error(err);
        setProjects([]);
      });
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

  // Decide background color of card based on dark/light mode
  // This example assumes you have a CSS class or method to detect dark mode.
  // For demonstration, we'll use a simple window.matchMedia check on mount (you can replace with your theme context)
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkQuery.matches);
    const handler = (e) => setIsDarkMode(e.matches);
    darkQuery.addEventListener('change', handler);
    return () => darkQuery.removeEventListener('change', handler);
  }, []);

  const cardBg = isDarkMode ? cardBgDark : cardBgLight;
  const cardTextColor = isDarkMode ? colors.text.primary : colors.text.primary; // Both safe as text.primary adapts

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: isDarkMode ? colors.background.dark : colors.surface.secondary }}>
        {/* ...your loading skeleton here with updated colors if needed */}
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: isDarkMode ? colors.background.dark : colors.surface.secondary }}>
        <div className="relative flex h-screen">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} projects={projects} userStats={userStats} />
          <div className="flex-1 flex flex-col lg:ml-0">
            <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
            <main className="flex-1 overflow-y-auto p-6">
              <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto rounded-xl shadow-lg p-8" style={{ backgroundColor: cardBg, color: cardTextColor, border: `1px solid ${borderColor}` }}>
                  <User className="w-16 h-16 mx-auto mb-4" style={{ color: mutedText }} />
                  <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: secondaryText }}>No User Data Found</h2>
                  <p className="mb-6 text-center" style={{ color: mutedText }}>Please log in to view your profile.</p>
                  <Link
                    to="/auth"
                    className="block max-w-xs mx-auto text-center rounded-lg px-6 py-3 font-semibold shadow-lg"
                    style={{ backgroundColor: colors.primary.blue[600], color: baseBg }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.primary.blue[700]}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = colors.primary.blue[600]}
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: isDarkMode ? colors.background.dark : colors.surface.secondary }}>
      <div className="relative flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} projects={projects} userStats={userStats} />
        <div className="flex-1 flex flex-col lg:ml-0">
          <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-4xl mx-auto rounded-xl shadow-lg p-8" style={{ backgroundColor: cardBg, color: cardTextColor, border: `1px solid ${borderColor}` }}>
                <h1 className="text-3xl font-bold text-center mb-8" style={{ color: baseText }}>
                  My Profile
                </h1>

                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-md"
                        style={{
                          backgroundColor: colors.primary.blue[500],
                          color: colors.surface.primary
                        }}
                      >
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                        style={{
                          backgroundColor: colors.accent.green[500],
                          borderColor: colors.surface.primary
                        }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.surface.primary }}></div>
                      </div>
                    </div>

                    {/* Name and University */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold mb-2" style={{ color: baseText }}>
                        {user.name || 'Unknown User'}
                      </h2>
                      {user.university && (
                        <div className="flex items-center mb-2" style={{ color: secondaryText }}>
                          <MapPin className="w-4 h-4 mr-1" style={{ color: colors.primary.blue[400] }} />
                          <span className="text-sm truncate">{user.university}</span>
                        </div>
                      )}
                      <div className="flex items-center mb-2" style={{ color: secondaryText }}>
                        <Mail className="w-4 h-4 mr-1" style={{ color: colors.primary.blue[400] }} />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      {user.role && (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor:
                              user.role === 'admin'
                                ? `${colors.accent.red[500]}1A`
                                : user.role === 'mentor'
                                  ? `${colors.primary.blue[500]}1A`
                                  : `${colors.accent.green[500]}1A`,
                            color:
                              user.role === 'admin'
                                ? colors.accent.red[600]
                                : user.role === 'mentor'
                                  ? colors.primary.blue[600]
                                  : colors.accent.green[600],
                            borderColor:
                              user.role === 'admin'
                                ? `${colors.accent.red[500]}33`
                                : user.role === 'mentor'
                                  ? `${colors.primary.blue[500]}33`
                                  : `${colors.accent.green[500]}33`
                          }}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/settings"
                    className="flex items-center space-x-1 px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
                    style={{
                      backgroundColor: colors.primary.blue[600],
                      color: colors.surface.primary
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.primary.blue[700])}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.primary.blue[600])}
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
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mb-4"
                        style={{
                          backgroundColor: colors.primary.blue[100],
                          color: colors.primary.blue[800],
                          borderColor: `${colors.primary.blue[500]}33`
                        }}
                      >
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
                            className="flex items-center space-x-1 transition-colors duration-200"
                            style={{ color: colors.primary.blue[600] }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary.blue[500])}
                            onMouseLeave={(e) => (e.currentTarget.style.color = colors.primary.blue[600])}
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
                            className="flex items-center space-x-1 transition-colors duration-200"
                            style={{ color: colors.primary.blue[600] }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary.blue[500])}
                            onMouseLeave={(e) => (e.currentTarget.style.color = colors.primary.blue[600])}
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
                      <Tag className="w-4 h-4 mr-2" style={{ color: colors.primary.blue[600] }} />
                      <span className="text-sm font-medium" style={{ color: baseText }}>
                        Research Keywords
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-sm rounded-full transition-colors duration-200 border"
                          style={{
                            backgroundColor: isDarkMode ? `${colors.background.gray[700]}cc` : `${colors.background.gray[100]}cc`,
                            color: isDarkMode ? colors.text.secondary : colors.text.muted,
                            borderColor: isDarkMode ? colors.border.secondary : colors.border.primary
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.primary.blue[600];
                            e.currentTarget.style.color = colors.surface.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? `${colors.background.gray[700]}cc` : `${colors.background.gray[100]}cc`;
                            e.currentTarget.style.color = isDarkMode ? colors.text.secondary : colors.text.muted;
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{
                      backgroundColor: isDarkMode ? colors.background.gray[800] : colors.primary.blue[50],
                      color: isDarkMode ? colors.primary.blue[300] : colors.primary.blue[800]
                    }}
                  >
                    <BookOpen className="w-5 h-5 mx-auto mb-2" style={{ color: colors.primary.blue[600] }} />
                    <div className="text-lg font-bold">{user.publications || '0'}</div>
                    <div className="text-xs">Publications</div>
                  </div>
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{
                      backgroundColor: isDarkMode ? colors.background.gray[800] : colors.accent.green[100],
                      color: isDarkMode ? colors.accent.green[300] : colors.accent.green[800]
                    }}
                  >
                    <TrendingUp className="w-5 h-5 mx-auto mb-2" style={{ color: colors.accent.green[600] }} />
                    <div className="text-lg font-bold">{user.citations || '0'}</div>
                    <div className="text-xs">Citations</div>
                  </div>
                  <div
                    className="rounded-lg p-4 text-center"
                    style={{
                      backgroundColor: isDarkMode ? colors.background.gray[800] : colors.primary.blue[50],
                      color: isDarkMode ? colors.primary.purple[300] : colors.primary.purple[800]
                    }}
                  >
                    <Star className="w-5 h-5 mx-auto mb-2" style={{ color: colors.primary.purple[600] }} />
                    <div className="text-lg font-bold">{user.hIndex || '0'}</div>
                    <div className="text-xs">H-Index</div>
                  </div>
                </div>

                {/* Profile Completion */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: secondaryText }}>Profile Completion</span>
                    <span className="text-sm" style={{ color: mutedText }}>
                      {Math.round(
                        ((user.name ? 1 : 0) +
                          (user.email ? 1 : 0) +
                          (user.university ? 1 : 0) +
                          (user.domain ? 1 : 0) +
                          (user.keywords?.length > 0 ? 1 : 0) +
                          (user.scholarLink ? 1 : 0) +
                          (user.githubLink ? 1 : 0)) /
                        7 * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: isDarkMode ? colors.background.gray[700] : colors.background.gray[300] }}>
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: colors.primary.blue[600],
                        width: `${Math.round(
                          ((user.name ? 1 : 0) +
                            (user.email ? 1 : 0) +
                            (user.university ? 1 : 0) +
                            (user.domain ? 1 : 0) +
                            (user.keywords?.length > 0 ? 1 : 0) +
                            (user.scholarLink ? 1 : 0) +
                            (user.githubLink ? 1 : 0)) /
                          7 * 100
                        )}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="relative inline-flex items-center px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    style={{
                      backgroundColor: colors.primary.blue[600],
                      color: colors.surface.primary
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.primary.blue[700])}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.primary.blue[600])}
                    aria-label="Go to dashboard"
                  >
                    Back to Dashboard
                    <span
                      className="absolute inset-0 rounded-full border opacity-0 hover:opacity-100 transition-opacity duration-300"
                      style={{ borderColor: `${colors.primary.blue[400]}4D` }}
                    ></span>
                  </Link>

                  <Link
                    to="/settings"
                    className="relative inline-flex items-center px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    style={{
                      backgroundColor: colors.background.gray[600],
                      color: colors.surface.primary
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.background.gray[700])}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.background.gray[600])}
                    aria-label="Edit profile settings"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
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
