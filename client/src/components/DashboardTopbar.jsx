import React, { useState } from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '../styles/colors';
import ThemeToggle from './ThemeToggle';

const Topbar = ({ onMenuToggle, user, onLogout, isLoggingOut }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header 
      className="backdrop-blur-xl border-b sticky top-0 z-30"
      style={{
        backgroundColor: colors.background.glass,
        borderColor: colors.border.secondary
      }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg transition-all duration-200"
              style={{ 
                color: `${colors.text.secondary}B3`
              }}
              onMouseEnter={(e) => {
                e.target.style.color = colors.text.primary;
                e.target.style.backgroundColor = colors.background.glass;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = `${colors.text.secondary}B3`;
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Menu size={20} />
            </button>

            {/* Welcome Message */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome back, {user?.name || 'Dr. Rahman'}!
              </h1>
              <p className="text-sm" style={{ color: `${colors.text.muted}99` }}>
                Track your research progress and discover new collaboration opportunities.
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button 
              className="relative p-2 rounded-lg transition-all duration-200"
              style={{ 
                color: `${colors.text.secondary}B3`
              }}
              onMouseEnter={(e) => {
                e.target.style.color = colors.text.primary;
                e.target.style.backgroundColor = colors.background.glass;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = `${colors.text.secondary}B3`;
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Bell size={20} />
              <span 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: colors.accent.red[500],
                  color: colors.surface.primary
                }}
              >
                3
              </span>
            </button>

            {/* View Profile Icon in Topbar */}
            <Link
              to="/profile"
              className="p-2 rounded-lg transition-all duration-200"
              style={{ 
                color: `${colors.text.secondary}B3`
              }}
              onMouseEnter={(e) => {
                e.target.style.color = colors.text.primary;
                e.target.style.backgroundColor = colors.background.glass;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = `${colors.text.secondary}B3`;
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <User size={20} />
            </Link>

            {/* Profile Dropdown for Logout Only */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 rounded-lg transition-all duration-200"
                style={{ 
                  color: `${colors.text.secondary}B3`
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = colors.text.primary;
                  e.target.style.backgroundColor = colors.background.glass;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = `${colors.text.secondary}B3`;
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    background: `linear-gradient(45deg, ${colors.primary.blue[300]}, ${colors.primary.purple[300]})`,
                    color: colors.surface.primary
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                </div>
              </button>

              {/* Dropdown Menu - Only Logout */}
              {isProfileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl border shadow-xl z-50"
                  style={{
                    backgroundColor: `${colors.background.gray[600]}99`,
                    borderColor: colors.border.light
                  }}
                >
                  <div className="p-2">
                    <button
                      onClick={handleLogoutClick}
                      disabled={isLoggingOut}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 ${
                        isLoggingOut ? 'cursor-not-allowed' : ''
                      }`}
                      style={isLoggingOut ? {
                        color: `${colors.text.primary}80`
                      } : {
                        color: colors.accent.red[400]
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoggingOut) {
                          e.target.style.color = colors.accent.red[300];
                          e.target.style.backgroundColor = `${colors.accent.red[500]}1A`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoggingOut) {
                          e.target.style.color = colors.accent.red[400];
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
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
