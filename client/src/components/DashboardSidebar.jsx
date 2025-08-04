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
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, projects = [], userStats = null }) => {
  const [activeCategory, setActiveCategory] = useState('Computer Science');
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    status: true,
  });

  // Use dynamic counts from userStats if available, otherwise fallback to local calculation
  const plannedCount = userStats?.projects?.planned ?? projects.filter(p => p.status === 'Planned').length;
  const inProgressCount = userStats?.projects?.inProgress ?? projects.filter(p => p.status === 'In Progress').length;
  const completedCount = userStats?.projects?.completed ?? projects.filter(p => p.status === 'Completed').length;
  const totalActiveCount = plannedCount + inProgressCount; // Active = Planned + In Progress
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
    { icon: BookOpen, label: 'My Publications', path: '/my-publications' },  // Changed here
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const categories = [
    { icon: BookOpen, label: 'Computer Science' },
    { icon: BookOpen, label: 'Data Science' },
    { icon: BookOpen, label: 'Engineering' },
    { icon: BookOpen, label: 'Mathematics' },
    { icon: BookOpen, label: 'Biology' },
  ];

  const projectStatus = [
    { 
      icon: Activity, 
      label: 'Total Projects', 
      count: totalProjects,
      color: 'text-sky-400'
    },
    { 
      icon: Activity, 
      label: 'Active Projects', 
      count: totalActiveCount,
      color: 'text-blue-400'
    },
    { 
      icon: Clock, 
      label: 'Planned', 
      count: plannedCount,
      color: 'text-yellow-400'
    },
    { 
      icon: Clock, 
      label: 'In Progress', 
      count: inProgressCount,
      color: 'text-purple-400'
    },
    { 
      icon: CheckCircle, 
      label: 'Completed', 
      count: completedCount,
      color: 'text-green-400'
    },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white/5 backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">

          <div className="p-6 border-b border-white/10">
            <Link to="/dashboard" className="flex items-center space-x-3 group mb-4">
              <div className="relative w-12 h-12">
                <img src="1.png" alt="Logo" className="w-full h-full object-contain relative z-10" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ThesisConnect
              </h1>
            </Link>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
              <input
                type="text"
                placeholder="Search projects, people..."
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-white/80 text-sm font-semibold mb-3">Quick Navigation</h3>
              <nav className="space-y-1">
                {quickNavItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      item.active 
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full text-white/80 text-sm font-semibold mb-3 hover:text-white transition-colors"
              >
                <span>Categories</span>
                {expandedSections.categories ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {expandedSections.categories && (
                <div className="space-y-1">
                  {categories.map((category, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveCategory(category.label)}
                      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                        activeCategory === category.label
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <category.icon size={18} />
                      <span className="text-sm font-medium">{category.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleSection('status')}
                className="flex items-center justify-between w-full text-white/80 text-sm font-semibold mb-3 hover:text-white transition-colors"
              >
                <span>Project Status</span>
                {expandedSections.status ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {expandedSections.status && (
                <div className="space-y-1">
                  {projectStatus.map((status, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <status.icon size={18} className={status.color || ''} />
                        <span className="text-sm font-medium">{status.label}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        status.color 
                          ? `bg-${status.color.split('-')[1]}-500/20 ${status.color}` 
                          : 'bg-white/20 text-white/80'
                      }`}>
                        {status.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Statistics Section */}
            <div>
              <h3 className="text-white/80 text-sm font-semibold mb-3">Overview</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-purple-400" />
                    <span className="text-sm font-medium text-white/80">Collaborators</span>
                  </div>
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                    {userStats?.collaborators?.total || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-green-400" />
                    <span className="text-sm font-medium text-white/80">Publications</span>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    {userStats?.publications?.total || 0}
                  </span>
                </div>
                
                {userStats?.publications?.totalCitations > 0 && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={18} className="text-yellow-400" />
                      <span className="text-sm font-medium text-white/80">Citations</span>
                    </div>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
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
