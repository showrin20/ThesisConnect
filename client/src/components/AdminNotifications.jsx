import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminNotifications = () => {
  const { theme, colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notification data - in real app this would come from API
  const generateNotifications = () => {
    const notificationTypes = [
      {
        type: 'warning',
        icon: AlertTriangle,
        messages: [
          'Server load is at 85% capacity',
          'Storage approaching 80% limit',
          'Unusual login pattern detected',
          '5 mentor applications awaiting approval',
          'API rate limit reached for 3 users'
        ]
      },
      {
        type: 'success',
        icon: CheckCircle,
        messages: [
          'Daily backup completed successfully',
          'Security scan passed with no issues',
          '15 new user registrations today',
          'System performance optimized',
          'New collaboration request approved'
        ]
      },
      {
        type: 'info',
        icon: Info,
        messages: [
          'Scheduled maintenance in 2 hours',
          'New feature deployment completed',
          'Weekly report generated',
          'Database optimization running',
          'User feedback summary available'
        ]
      },
      {
        type: 'error',
        icon: AlertCircle,
        messages: [
          'Failed login attempts from unknown IP',
          '2 publications flagged for review',
          'Email service experiencing delays',
          'Payment gateway connection unstable'
        ]
      }
    ];

    const allNotifications = [];
    notificationTypes.forEach(category => {
      category.messages.slice(0, 2).forEach((message, index) => {
        allNotifications.push({
          id: `${category.type}_${index}_${Date.now()}`,
          type: category.type,
          message,
          timestamp: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // Within last 2 hours
          icon: category.icon,
          read: Math.random() > 0.6 // 40% chance of being read
        });
      });
    });

    return allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  useEffect(() => {
    const mockNotifications = generateNotifications();
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification = {
        id: `realtime_${Date.now()}`,
        type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)],
        message: [
          'New user registration',
          'Project collaboration request',
          'System health check completed',
          'Storage optimization running'
        ][Math.floor(Math.random() * 4)],
        timestamp: new Date(),
        icon: Info,
        read: false
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
      setUnreadCount(prev => prev + 1);
    }, 30000); // New notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return colors.accent?.green?.[500] || '#22c55e';
      case 'warning': return colors.accent?.yellow?.[500] || '#f59e0b';
      case 'error': return colors.accent?.red?.[500] || '#ef4444';
      default: return colors.primary?.blue?.[500] || '#3b82f6';
    }
  };

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
                Notifications
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
                notifications.slice(0, 10).map((notification) => {
                  const IconComponent = notification.icon;
                  return (
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
                          style={{ backgroundColor: `${getNotificationColor(notification.type)}20` }}
                        >
                          <IconComponent 
                            size={16} 
                            style={{ color: getNotificationColor(notification.type) }}
                          />
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
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Bell size={32} style={{ color: colors.text?.secondary }} className="mx-auto mb-2 opacity-50" />
                  <p style={{ color: colors.text?.secondary }}>No notifications</p>
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
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminNotifications;
