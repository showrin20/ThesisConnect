import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, MapPin, BookOpen, Tag, Star, TrendingUp, Edit2, User, Mail } from 'lucide-react';
import axios from '../axios';
import statsService from '../services/statsService';
import { getColors } from '../styles/colors';

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
  const [themeColors, setThemeColors] = useState(getColors());

  // Listen for theme change events
  useEffect(() => {
    const updateColors = () => setThemeColors(getColors());
    window.addEventListener('themeChange', updateColors);
    return () => window.removeEventListener('themeChange', updateColors);
  }, []);

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
      .catch(() => setProjects([]));
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const c = themeColors; // shortcut for colors

  const profileCompletion = Math.round(
    ((user?.name ? 1 : 0) +
      (user?.email ? 1 : 0) +
      (user?.university ? 1 : 0) +
      (user?.domain ? 1 : 0) +
      (user?.keywords?.length > 0 ? 1 : 0) +
      (user?.scholarLink ? 1 : 0) +
      (user?.githubLink ? 1 : 0)) /
    7 * 100
  );

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: c.background.primary }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: c.background.primary }}>
        <div className="relative flex h-screen">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} projects={projects} userStats={userStats} />
          <div className="flex-1 flex flex-col lg:ml-0">
            <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
            <main className="flex-1 overflow-y-auto p-6">
              <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto rounded-xl shadow-lg p-8"
                  style={{
                    backgroundColor: c.surface.secondary,
                    color: c.text.primary,
                    border: `1px solid ${c.border.primary}`
                  }}>
                  <User className="w-16 h-16 mx-auto mb-4" style={{ color: c.text.muted }} />
                  <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: c.text.secondary }}>No User Data Found</h2>
                  <p className="mb-6 text-center" style={{ color: c.text.muted }}>Please log in to view your profile.</p>
                  <Link
                    to="/auth"
                    className="block max-w-xs mx-auto text-center rounded-lg px-6 py-3 font-semibold shadow-lg"
                    style={{ backgroundColor: c.primary.blue[600], color: c.surface.primary }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = c.primary.blue[700]}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = c.primary.blue[600]}
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
    <div className="min-h-screen" style={{ backgroundColor: c.background.primary }}>
      <div className="relative flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} projects={projects} userStats={userStats} />
        <div className="flex-1 flex flex-col lg:ml-0">
          <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-4xl mx-auto rounded-xl shadow-lg p-8"
                style={{
                  backgroundColor: c.surface.primary,
                  color: c.text.primary,
                  border: `1px solid ${c.border.primary}`
                }}>
                <h1 className="text-3xl font-bold text-center mb-8" style={{ color: c.text.primary }}>My Profile</h1>

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-md"
                        style={{
                          backgroundColor: c.primary.blue[500],
                          color: c.surface.primary
                        }}>
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                        style={{
                          backgroundColor: c.accent.green[500],
                          borderColor: c.surface.primary
                        }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.surface.primary }}></div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold mb-2" style={{ color: c.text.primary }}>
                        {user.name || 'Unknown User'}
                      </h2>
                      {user.university && (
                        <div className="flex items-center mb-2" style={{ color: c.text.secondary }}>
                          <MapPin className="w-4 h-4 mr-1" style={{ color: c.primary.blue[400] }} />
                          <span className="text-sm truncate">{user.university}</span>
                        </div>
                      )}
                      <div className="flex items-center mb-2" style={{ color: c.text.secondary }}>
                        <Mail className="w-4 h-4 mr-1" style={{ color: c.primary.blue[400] }} />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      {user.role && (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor: c.status[user.role]?.background || c.status.success.background,
                            color: c.status[user.role]?.text || c.text.success,
                            borderColor: c.status[user.role]?.border || c.border.success
                          }}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/settings"
                    className="flex items-center space-x-1 px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
                    style={{ backgroundColor: c.primary.blue[600], color: c.surface.primary }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = c.primary.blue[700]}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = c.primary.blue[600]}>
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
                          backgroundColor: c.primary.blue[100],
                          color: c.primary.blue[800],
                          borderColor: c.border.primary
                        }}>
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
                            style={{ color: c.primary.blue[600] }}
                            onMouseEnter={(e) => e.currentTarget.style.color = c.primary.blue[500]}
                            onMouseLeave={(e) => e.currentTarget.style.color = c.primary.blue[600]}>
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
                            style={{ color: c.primary.blue[600] }}
                            onMouseEnter={(e) => e.currentTarget.style.color = c.primary.blue[500]}
                            onMouseLeave={(e) => e.currentTarget.style.color = c.primary.blue[600]}>
                            <ExternalLink className="w-4 h-4" />
                            <span>GitHub</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Keywords */}
                {user.keywords && user.keywords.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <Tag className="w-4 h-4 mr-2" style={{ color: c.primary.blue[600] }} />
                      <span className="text-sm font-medium" style={{ color: c.text.primary }}>Research Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-sm rounded-full transition-colors duration-200 border"
                          style={{
                            backgroundColor: c.surface.muted,
                            color: c.text.muted,
                            borderColor: c.border.primary
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = c.primary.blue[600];
                            e.currentTarget.style.color = c.surface.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = c.surface.muted;
                            e.currentTarget.style.color = c.text.muted;
                          }}>
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}




                {/* Profile Completion */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: c.text.secondary }}>Profile Completion</span>
                    <span className="text-sm" style={{ color: c.text.muted }}>{profileCompletion}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: c.surface.muted }}>
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: c.primary.blue[600],
                        width: `${profileCompletion}%`
                      }}>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="relative inline-flex items-center px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    style={{ backgroundColor: c.primary.blue[600], color: c.surface.primary }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = c.primary.blue[700]}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = c.primary.blue[600]}>
                    Back to Dashboard
                    <span
                      className="absolute inset-0 rounded-full border opacity-0 hover:opacity-100 transition-opacity duration-300"
                      style={{ borderColor: c.border.primary }}>
                    </span>
                  </Link>

                  <Link
                    to="/settings"
                    className="relative inline-flex items-center px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    style={{ backgroundColor: c.surface.muted, color: c.text.primary }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = c.surface.secondary}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = c.surface.muted}>
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
