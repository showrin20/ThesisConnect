import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminNotifications = ({ systemEvents, formatTimeAgo, getEventIcon, getEventColor, colors }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync notifications with systemEvents and add read status
  useEffect(() => {
    const updatedNotifications = systemEvents.map(event => ({
      id: event.id,
      type: event.type,
      message: event.message,
      timestamp: event.timestamp,
      icon: event.icon, // Will be used with getEventIcon
      read: event.read ?? false // Default to unread if no read status
    }));
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  }, [systemEvents]);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Bell size={20} style={{ color: colors.text?.primary }} />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 w-5 h-5 text-xs text-white rounded-full flex items-center justify-center animate-pulse"
            style={{ backgroundColor: colors.accent?.red?.[500] || '#ef4444' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Panel */}
          <div 
            className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto rounded-xl shadow-2xl border z-50"
            style={{ 
              backgroundColor: colors.background?.primary,
              borderColor: colors.border?.primary 
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: colors.border?.secondary }}
            >
              <h3 className="font-semibold" style={{ color: colors.text?.primary }}>
                Recent System Events
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{ 
                      color: colors.primary?.blue?.[500],
                      backgroundColor: `${colors.primary?.blue?.[500]}20`
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={16} style={{ color: colors.text?.secondary }} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="p-2">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg mb-2 border transition-all hover:shadow-md ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    style={{ borderColor: colors.border?.secondary }}
                  >
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                        style={{ backgroundColor: `${getEventColor(notification.type)}20` }}
                      >
                        {getEventIcon(notification.type, notification.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p 
                          className={`text-sm ${!notification.read ? 'font-medium' : ''}`}
                          style={{ color: colors.text?.primary }}
                        >
                          {notification.message}
                        </p>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: colors.text?.secondary }}
                        >
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: colors.primary?.blue?.[500] }}
                            title="Mark as read"
                          />
                        )}
                        <button
                          onClick={() => clearNotification(notification.id)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Remove"
                        >
                          <X size={12} style={{ color: colors.text?.secondary }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell size={32} style={{ color: colors.text?.secondary }} className="mx-auto mb-2 opacity-50" />
                  <p style={{ color: colors.text?.secondary }}>No recent system events</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div 
              className="p-3 border-t text-center"
              style={{ borderColor: colors.border?.secondary }}
            >
              <button 
                className="text-sm hover:underline"
                style={{ color: colors.primary?.blue?.[500] }}
              >
                View all system events
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminNotifications;