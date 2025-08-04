import React, { useState } from 'react';
import { Menu, X, Bell, User, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Topbar = ({ onMenuToggle, user, onLogout, isLoggingOut }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);



  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <Menu size={20} />
            </button>

            {/* Welcome Message */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome back, {user?.name || 'Dr. Rahman'}!
              </h1>
              <p className="text-white/60 text-sm">
                Track your research progress and discover new collaboration opportunities.
              </p>
            </div>
          </div>

          {/* Center - Navigation (Desktop) */}
     

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.name || 'Profile'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900/70 rounded-xl border border-white/20 shadow-xl z-50">
                  <div className="p-2">
                    <Link 
                      to="/profile" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
                    >
                      <User size={14} />
                      View Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Settings size={14} />
                      Settings
                    </Link>
                    <hr className="my-2 border-white/10" />
                    <button
                      onClick={handleLogoutClick}
                      disabled={isLoggingOut}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 ${
                        isLoggingOut 
                          ? 'text-white/50 cursor-not-allowed' 
                          : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                      }`}
                    >
                      <LogOut size={14} />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
