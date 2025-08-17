import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors } from '../styles/colors';
import ThemeToggle from './ThemeToggle';
import AdminNotifications from './AdminNotifications';

const Topbar = ({ onMenuToggle, user, onLogout, isLoggingOut, notificationData }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  // Debug: Log props to verify they are passed correctly
  console.log('Topbar Props:', { user, isLoggingOut, notificationData, onMenuToggle });

  return (
    <header
      className="backdrop-blur-xl border-b sticky top-0 z-30"
      style={{
        backgroundColor: colors.background.glass,
        borderColor: colors.border.secondary,
      }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                console.log('Menu button clicked'); // Debug
                onMenuToggle();
              }}
              className="lg:hidden p-2 rounded-lg transition-all duration-200"
              style={{ color: `${colors.text.secondary}B3` }}
              onMouseEnter={(e) => {
                e.target.style.color = colors.text.primary;
                e.target.style.backgroundColor = colors.background.glass;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = `${colors.text.secondary}B3`;
                e.target.style.backgroundColor = 'transparent';
              }}
              aria-label="Toggle sidebar"
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
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => {
                  console.log('Notifications button clicked'); // Debug
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className="relative p-2 rounded-lg transition-all duration-200"
                style={{ color: `${colors.text.secondary}B3` }}
                onMouseEnter={(e) => {
                  e.target.style.color = colors.text.primary;
                  e.target.style.backgroundColor = colors.background.glass;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = `${colors.text.secondary}B3`;
                  e.target.style.backgroundColor = 'transparent';
                }}
                aria-label="Toggle notifications"
                aria-expanded={isNotificationsOpen}
              >
                <Bell size={20} />
                {notificationData?.systemEvents?.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: colors.accent.red[500],
                      color: colors.surface.primary,
                    }}
                  >
                    {notificationData.systemEvents.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationsOpen && notificationData?.systemEvents?.length > 0 && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl border shadow-xl z-50"
                  style={{
                    backgroundColor: `${colors.background.gray[600]}99`,
                    borderColor: colors.border.light,
                  }}
                >
                  <AdminNotifications
                    systemEvents={notificationData.systemEvents}
                    formatTimeAgo={notificationData.formatTimeAgo}
                    getEventIcon={notificationData.getEventIcon}
                    getEventColor={notificationData.getEventColor}
                    colors={notificationData.colors}
                  />
                </div>
              )}
            </div>

            {/* View Profile Icon */}
            <Link
              to="/profile"
              className="p-2 rounded-lg transition-all duration-200"
              style={{ color: `${colors.text.secondary}B3` }}
              onMouseEnter={(e) => {
                e.target.style.color = colors.text.primary;
                e.target.style.backgroundColor = colors.background.glass;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = `${colors.text.secondary}B3`;
                e.target.style.backgroundColor = 'transparent';
              }}
              aria-label="View profile"
            >
              <User size={20} />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  console.log('Profile button clicked'); // Debug
                  setIsProfileOpen(!isProfileOpen);
                }}
                className="flex items-center gap-2 p-2 rounded-lg transition-all duration-200"
                style={{ color: `${colors.text.secondary}B3` }}
                onMouseEnter={(e) => {
                  e.target.style.color = colors.text.primary;
                  e.target.style.backgroundColor = colors.background.glass;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = `${colors.text.secondary}B3`;
                  e.target.style.backgroundColor = 'transparent';
                }}
                aria-label="Toggle profile menu"
                aria-expanded={isProfileOpen}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    background: `linear-gradient(45deg, ${colors.primary.blue[300]}, ${colors.primary.purple[300]})`,
                    color: colors.surface.primary,
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
                    borderColor: colors.border.light,
                  }}
                >
                  <div className="p-2">
                    <button
                      onClick={handleLogoutClick}
                      disabled={isLoggingOut}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 ${
                        isLoggingOut ? 'cursor-not-allowed' : ''
                      }`}
                      style={
                        isLoggingOut
                          ? { color: `${colors.text.primary}80` }
                          : { color: colors.accent.red[400] }
                      }
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

// PropTypes for type checking
import PropTypes from 'prop-types';

Topbar.propTypes = {
  onMenuToggle: PropTypes.func.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
  }),
  onLogout: PropTypes.func,
  isLoggingOut: PropTypes.bool,
  notificationData: PropTypes.shape({
    systemEvents: PropTypes.array,
    formatTimeAgo: PropTypes.func,
    getEventIcon: PropTypes.func,
    getEventColor: PropTypes.func,
    colors: PropTypes.object,
  }),
};

export default Topbar;