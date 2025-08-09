import React, { useState } from 'react';
import { 
  Home, 
  FolderOpen, 
  BookOpen, 
  Settings, 
  Activity, 
  Clock, 
  CheckCircle, 
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  TrendingUp,
  MessageSquare,
  FileText,
  UserPlus,
  MessageCircle,
  UserCheck,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '../styles/colors';

const Sidebar = ({ isOpen, onClose, projects = [], userStats = null }) => {
  const [expandedSections, setExpandedSections] = useState({
    actions: true,
    status: true,
  });

  const plannedCount = userStats?.projects?.planned ?? projects.filter(p => p.status === 'Planned').length;
  const inProgressCount = userStats?.projects?.inProgress ?? projects.filter(p => p.status === 'In Progress').length;
  const completedCount = userStats?.projects?.completed ?? projects.filter(p => p.status === 'Completed').length;
  const totalActiveCount = plannedCount + inProgressCount;
  const totalProjects = userStats?.projects?.total ?? projects.length;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const quickNavItems = [
    { icon: Home, label: 'My Dashboard', active: true, path: '/dashboard' },
    { icon: FolderOpen, label: 'My Projects', path: '/my-projects' },
    { icon: BookOpen, label: 'My Publications', path: '/my-publications' },
    { icon: FileText, label: 'My Blogs', path: '/my-blogs' },
    { icon: MessageSquare, label: 'My Community Posts', path: '/my-community-posts' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const actionButtons = [
    { icon: UserPlus, label: 'Find Mentors', path: '/find-mentors', color: colors.primary.blue[400] },
    { icon: Users, label: 'Find Collaborators', path: '/find-collaborators', color: colors.primary.purple[400] },
    { icon: MessageCircle, label: 'Messages', path: '/messages', color: colors.accent.green[400] },
    { icon: UserCheck, label: 'Collaboration Requests', path: '/collaboration-requests', color: colors.accent.yellow[400] },
    { icon: Star, label: 'Project Reviews', path: '/project-reviews', color: colors.accent.red[400] },
  ];

  const projectStatus = [
    { icon: Activity, label: 'Total Projects', count: totalProjects, color: colors.gradients.accent.blue },
    { icon: Activity, label: 'Active Projects', count: totalActiveCount, color: colors.primary.blue[400] },
    { icon: Clock, label: 'Planned', count: plannedCount, color: colors.accent.yellow[400] },
    { icon: Clock, label: 'In Progress', count: inProgressCount, color: colors.primary.purple[400] },
    { icon: CheckCircle, label: 'Completed', count: completedCount, color: colors.accent.green[400] },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          style={{ backgroundColor: colors.background.overlay }}
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
          backgroundColor: colors.background.glass,
          borderColor: colors.border.secondary 
        }}
      >
        <div className="flex flex-col h-full">

          {/* Logo + Search */}
          <div className="p-6 border-b" style={{ borderColor: colors.border.secondary }}>
            <Link to="/dashboard" className="flex items-center space-x-3 group mb-4">
              <div className="relative w-12 h-12">
                <img src="1.png" alt="Logo" className="w-full h-full object-contain relative z-10" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ThesisConnect
              </h1>
            </Link>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: `${colors.text.muted}90` }} />
              <input
                type="text"
                placeholder="Search projects, people..."
                className="w-full border rounded-lg pl-10 pr-4 py-2 placeholder-opacity-50 focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: colors.background.glass,
                  borderColor: colors.border.light,
                  color: colors.text.primary,
                  '--placeholder-color': `${colors.text}80`,
                  '--tw-ring-color': `${colors.primary.blue[400]}80`
                }}
              />
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Quick Navigation */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: colors.text.muted }}>Quick Navigation</h3>
              <nav className="space-y-1">
                {quickNavItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      item.active ? 'border' : ''
                    }`}
                    style={{
                      backgroundColor: item.active ? `${colors.primary.blue[500]}33` : 'transparent',
                      borderColor: item.active ? `${colors.primary.blue[500]}4D` : 'transparent',
                      color: colors.text.muted
                    }}
                  >
                    <item.icon size={18} style={{ color: item.active ? colors.primary.blue[400] : colors.text.muted }} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Action Buttons */}
            <div>
              <button
                onClick={() => toggleSection('actions')}
                className="flex items-center justify-between w-full text-sm font-semibold mb-3"
                style={{ color: colors.text.muted }}
              >
                <span>Actions</span>
                {expandedSections.actions ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {expandedSections.actions && (
                <div className="space-y-2">
                  {actionButtons.map((action, idx) => (
                    <Link
                      key={idx}
                      to={action.path}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-200"
                      style={{
                        borderColor: `${action.color}33`,
                        backgroundColor: `${action.color}1A`,
                        color: colors.text.muted
                      }}
                    >
                      <action.icon size={18} style={{ color: action.color }} />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Project Status */}
            <div>
              <button
                onClick={() => toggleSection('status')}
                className="flex items-center justify-between w-full text-sm font-semibold mb-3"
                style={{ color: colors.text.muted }}
              >
                <span>Project Status</span>
                {expandedSections.status ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {expandedSections.status && (
                <div className="space-y-1">
                  {projectStatus.map((status, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200"
                      style={{ color: colors.text.muted }}
                    >
                      <div className="flex items-center gap-3">
                        <status.icon size={18} style={{ color: status.color }} />
                        <span className="text-sm font-medium">{status.label}</span>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${status.color}33`,
                          color: status.color
                        }}
                      >
                        {status.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Statistics */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: colors.text.muted }}>Overview</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: `${colors.primary.purple[500]}1A`,
                    borderColor: `${colors.primary.purple[500]}33`,
                    color: colors.text.muted
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Users size={18} style={{ color: colors.primary.purple[400] }} />
                    <span className="text-sm font-medium">Collaborators</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${colors.primary.purple[500]}33`,
                      color: colors.primary.purple[400]
                    }}
                  >
                    {userStats?.collaborators?.total || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: `${colors.accent.green[500]}1A`,
                    borderColor: `${colors.accent.green[500]}33`,
                    color: colors.text.muted
                  }}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} style={{ color: colors.accent.green[400] }} />
                    <span className="text-sm font-medium">Publications</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${colors.accent.green[500]}33`,
                      color: colors.accent.green[400]
                    }}
                  >
                    {userStats?.publications?.total || 0}
                  </span>
                </div>
                
                {userStats?.publications?.totalCitations > 0 && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: `${colors.accent.yellow[500]}1A`,
                      borderColor: `${colors.accent.yellow[500]}33`,
                      color: colors.text.muted
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Changed icon color here */}
                      <TrendingUp size={18} style={{ color: colors.text.primary }} />
                      <span className="text-sm font-medium">Citations</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${colors.accent.yellow[500]}33`,
                        color: colors.accent.yellow[800]
                      }}
                    >
                      {userStats?.publications?.totalCitations}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
