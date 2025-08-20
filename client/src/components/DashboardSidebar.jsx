import React, { useState, useEffect } from 'react';
import { 
  Home, FolderOpen, BookOpen, Settings, Activity, Clock, CheckCircle, 
  Search, ChevronDown, ChevronRight, Users, TrendingUp, MessageSquare, 
  FileText, UserPlus, MessageCircle, UserCheck, Star, Shield, 
  ClipboardList, Server, BarChart2, Award, Globe,
  Bookmark
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ isOpen, onClose, projects = [], userStats = null }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({ actions: true, status: true });

  // Get user role dynamically (default to 'student' if undefined)
  const userRole = user?.role || 'student';



  
  // Helper: safely unwrap counts that might be nested objects like { total: 5 } or { count: 3 }
  const unwrapCount = (value) => {
    if (value == null) return 0;
    if (typeof value === 'number' || typeof value === 'string') return value;
    if (typeof value === 'object') {
      // common nested shapes
      if ('total' in value && (typeof value.total === 'number' || typeof value.total === 'string')) return value.total;
      if ('count' in value && (typeof value.count === 'number' || typeof value.count === 'string')) return value.count;
      if ('length' in value && typeof value.length === 'number') return value.length;
      // attempt numeric cast
      const maybeNumber = Number(value);
      if (!Number.isNaN(maybeNumber)) return maybeNumber;
      // fallback to a stringified representation (so React renders a string, not an object)
      try { return JSON.stringify(value); } catch (e) { return String(value); }
    }
    return String(value);
  };

  // Compute project counts safely (unwrap any nested shapes)
  const plannedCount = unwrapCount(userStats?.projects?.planned ?? projects.filter(p => p.status === 'Planned').length);
  const inProgressCount = unwrapCount(userStats?.projects?.inProgress ?? projects.filter(p => p.status === 'In Progress').length);
  const completedCount = unwrapCount(userStats?.projects?.completed ?? projects.filter(p => p.status === 'Completed').length);
  const totalActiveCount = Number(plannedCount) + Number(inProgressCount);
  const totalProjects = unwrapCount(userStats?.projects?.total ?? projects.length);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Check if current path is active
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // ================= ROLE-BASED MENUS =================
  const quickNavConfig = {
    student: [
      { icon: Home, label: 'My Dashboard', path: '/dashboard' },
      { icon: FolderOpen, label: 'My Projects', path: '/my-projects' },
      { icon: BookOpen, label: 'My Publications', path: '/my-publications' },
      { icon: FileText, label: 'My Blogs', path: '/my-blogs' },
      { icon: MessageSquare, label: 'My Community Posts', path: '/my-community-posts' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
    mentor: [
      { icon: Home, label: 'Mentor Dashboard', path: '/dashboard' },
      { icon: FolderOpen, label: 'My Projects', path: '/my-projects' },
      { icon: Users, label: 'My Mentees', path: '/my-mentees' },
      { icon: BookOpen, label: 'My Publications', path: '/my-publications' },
      { icon: FileText, label: 'My Blogs', path: '/my-blogs' },
      { icon: MessageSquare, label: 'My Community Posts', path: '/my-community-posts' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
    admin: [
      { icon: Home, label: 'Admin Dashboard', path: '/dashboard' },
      { icon: Shield, label: 'User Management', path: '/user-management' },
      { icon: ClipboardList, label: 'Project Management', path: '/project-management' },
      { icon: BookOpen, label: 'Publication Management', path: '/publication-management' },
      { icon: FileText, label: 'Blog Management', path: '/blog-management' },
      { icon: MessageSquare, label: 'Community Management', path: '/community-management' },
    ]
  };

  const actionConfig = {
    student: [
      { 
        icon: UserPlus, 
        label: 'Find Mentors', 
        path: '/find-mentors', 
        color: colors.primary?.blue?.[500] || '#3b82f6',
        description: 'Connect with experienced mentors'
      },
      { 
        icon: Users, 
        label: 'Find Collaborators', 
        path: '/find-collaborators', 
        color: colors.primary?.purple?.[500] || '#9333ea',
        description: 'Find research partners'
      },
            { 
        icon: TrendingUp, 
        label: 'Community Feed', 
        path: '/community-feed', 
        color: colors.accent?.green?.[500] || '#22c55e',
        description: 'Student communications'
      },

      { 
        icon: UserCheck, 
        label: 'Requests', 
        path: '/collaboration-requests', 
        color: colors.accent?.yellow?.[500] || '#f59e0b',
        description: 'Collaboration requests'
      },
         { 
        icon: Bookmark, 
        label: 'Bookmarks', 
        path: '/bookmarks', 
        color: colors.accent?.red?.[500] || '#ef4444',
        description: 'Manage your bookmarks'
      }
      
    ],
    mentor: [
      { 
        icon: Users, 
        label: 'Explore Students', 
        path: '/find-collaborators', 
        color: colors.primary?.blue?.[500] || '#3b82f6',
        description: 'Mentor new students'
      },
      { 
        icon: UserPlus, 
        label: 'Explore Mentors', 
        path: '/find-mentors', 
        color: colors.primary?.purple?.[500] || '#9333ea',
        description: 'Connect with experienced mentors'
      },
      { 
        icon: UserCheck, 
        label: 'Mentorship Requests', 
        path: '/collaboration-requests', 
        color: colors.accent?.yellow?.[500] || '#f59e0b',
        description: 'Review applications'
      },
      { 
        icon: TrendingUp, 
        label: 'Community Feed', 
        path: '/community-feed', 
        color: colors.accent?.green?.[500] || '#22c55e',
        description: 'Student communications'
      },
    
      { 
        icon: Star, 
        label: 'Project Reviews', 
        path: '/project-reviews', 
        color: colors.accent?.purple?.[500] || '#9333ea',
        description: 'Review student work'
      },
         { 
        icon: Bookmark, 
        label: 'Bookmarks', 
        path: '/bookmarks', 
        color: colors.accent?.red?.[500] || '#ef4444',
        description: 'Manage your bookmarks'
      }
    ],
    admin: [
      { 
        icon: FolderOpen, 
        label: 'My Projects', 
        path: '/my-projects', 
        color: colors.primary?.blue?.[500] || '#3b82f6',
        description: 'Manage your projects'
      },
      { 
        icon: BookOpen, 
        label: 'My Publications', 
        path: '/my-publications', 
        color: colors.accent?.green?.[500] || '#22c55e',
        description: 'Manage your publications'
      },
      { 
        icon: Globe, 
        label: 'My Blogs', 
        path: '/my-blogs', 
        color: colors.accent?.red?.[500] || '#ef4444',
        description: 'Manage your blogs'
      },
    ]
  };


  // defensive defaults if configs missing
  const navItems = quickNavConfig[userRole] ?? quickNavConfig.student;
  const actions = actionConfig[userRole] ?? actionConfig.student;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          style={{ backgroundColor: `${colors.background?.primary || '#000000'}80` }}
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-full w-80 backdrop-blur-xl border-r
          transform transition-transform duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
        style={{
          backgroundColor: colors.background?.card || '#ffffff',
          borderColor: colors.border?.secondary || '#e2e8f0'
        }}
      >
        <div className="flex flex-col h-full">
          
          {/* Logo + Search */}
          <div 
            className="p-6 border-b" 
            style={{ borderColor: colors.border?.secondary || '#e2e8f0' }}
          >
            <Link to="/dashboard" className="flex items-center space-x-3 group mb-4">
              <div className="relative w-12 h-12">
                <img 
                  src="/1.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // fallback: hide broken image and leave initials
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  ThesisConnect
                </h1>
                <p className="text-xs font-medium" style={{ color: colors.text?.secondary || '#64748b' }}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal
                </p>
              </div>
            </Link>

            {userRole !== 'admin' && (
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  size={18} 
                  style={{ color: colors.text?.secondary || '#64748b' }} 
                />
                <input
                  type="text"
                  placeholder="Search projects, people..."
                  className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: colors.background?.secondary || '#f8fafc',
                    borderColor: colors.border?.secondary || '#e2e8f0',
                    color: colors.text?.primary || '#1e293b'
                  }}
                />
              </div>
            )}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Quick Navigation */}
            <div>
              <h3 
                className="text-sm font-semibold mb-3" 
                style={{ color: colors.text?.secondary || '#64748b' }}
              >
                Navigation
              </h3>
              <nav className="space-y-1">
                {navItems.map((item, idx) => {
                  const isActive = isActivePath(item.path);
                  return (
                    <Link
                      key={`${item.path}-${idx}`}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive ? 'border' : ''
                      }`}
                      style={{
                        backgroundColor: isActive 
                          ? `${colors.primary?.blue?.[500] || '#3b82f6'}15` 
                          : 'transparent',
                        borderColor: isActive 
                          ? `${colors.primary?.blue?.[500] || '#3b82f6'}40` 
                          : 'transparent',
                        color: colors.text?.primary || '#1e293b'
                      }}
                    >
                      <item.icon 
                        size={18} 
                        style={{ 
                          color: isActive 
                            ? colors.primary?.blue?.[500] || '#3b82f6' 
                            : colors.text?.secondary || '#64748b' 
                        }} 
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Action Buttons */}
            {actions && actions.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection('actions')}
                  className="flex items-center justify-between w-full text-sm font-semibold mb-3"
                  style={{ color: colors.text?.secondary || '#64748b' }}
                >
                  <span>Quick Actions</span>
                  {expandedSections.actions ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedSections.actions && (
                  <div className="space-y-2">
                    {actions.map((action, idx) => (
                      <Link
                        key={`${action.path}-${idx}`}
                        to={action.path}
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          borderColor: `${action.color}30`,
                          backgroundColor: `${action.color}10`,
                          color: colors.text?.primary || '#1e293b'
                        }}
                      >
                        <action.icon size={18} style={{ color: action.color }} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{action.label}</div>
                          <div 
                            className="text-xs" 
                            style={{ color: colors.text?.secondary || '#64748b' }}
                          >
                            {action.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}




            {/* Project Status (Hidden for Admin)
            {userRole !== 'admin' && (
              <div>
                <button
                  onClick={() => toggleSection('status')}
                  className="flex items-center justify-between w-full text-sm font-semibold mb-3"
                  style={{ color: colors.text?.secondary || '#64748b' }}
                >
                  <span>Project Status</span>
                  {expandedSections.status ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {expandedSections.status && (
                  <div className="space-y-1">
                    {projectStatus.map((status, idx) => (
                      <div 
                        key={`${status.label}-${idx}`} 
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ color: colors.text?.primary || '#1e293b' }}
                      >
                        <div className="flex items-center gap-3">
                          <status.icon size={18} style={{ color: status.color }} />
                          <span className="text-sm font-medium">{status.label}</span>
                        </div>
                        <span 
                          className="text-xs px-2 py-1 rounded-full font-semibold"
                          style={{
                            backgroundColor: `${status.color}20`,
                            color: status.color
                          }}
                        >
                          {String(status.count)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )} */}

            {/* Overview Stats */}
            {/* <div>
              <h3 
                className="text-sm font-semibold mb-3" 
                style={{ color: colors.text?.secondary || '#64748b' }}
              >
                Overview
              </h3>
              <div className="space-y-2">
                {overviewStats.map((stat, idx) => (
                  <div 
                    key={`${stat.label}-${idx}`} 
                    className="flex items-center justify-between px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: `${stat.color}10`,
                      borderColor: `${stat.color}20`,
                      color: colors.text?.primary || '#1e293b'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <stat.icon size={18} style={{ color: stat.color }} />
                      <span className="text-sm font-medium">{stat.label}</span>
                    </div>
                    <span 
                      className="text-xs px-2 py-1 rounded-full font-bold"
                      style={{
                        backgroundColor: `${stat.color}20`,
                        color: stat.color
                      }}
                    >
                      {String(stat.count)}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}

          




            <div 
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: colors.background?.secondary || '#f8fafc',
                borderColor: colors.border?.secondary || '#e2e8f0'
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold"
                >
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p 
                    className="text-sm font-semibold" 
                    style={{ color: colors.text?.primary || '#1e293b' }}
                  >
                    {user?.name || 'User'}
                  </p>
                  <p 
                    className="text-xs" 
                    style={{ color: colors.text?.secondary || '#64748b' }}
                  >
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span 
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}20`,
                    color: colors.primary?.blue?.[500] || '#3b82f6'
                  }}
                >
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
