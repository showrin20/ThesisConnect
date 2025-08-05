import React from 'react';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { getCardStyles, getGradientTextStyles, getButtonStyles } from '../styles/styleUtils';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardTopbar from '../components/DashboardTopbar';

export default function AdminDashboard() {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <div className="flex h-screen" style={{ background: colors.gradients.background.page }}>
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col">

            <DashboardTopbar 
            user={user}
            onLogout={logout}
            isLoggingOut={isLoggingOut}
            onMenuToggle={() => {}} // Optional: implement if needed
          />

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2" style={getGradientTextStyles('primary')}>
                Admin Dashboard 👑
              </h1>
              <p className="text-lg" style={{ color: colors.text.secondary }}>
                System Administration & Platform Management
              </p>
            </div>

            {/* System Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>Total Users</p>
                    <p className="text-2xl font-bold" style={{ color: colors.primary.blue[400] }}>1,247</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                       style={{ background: colors.gradients.accent.blue }}>
                    <span className="text-xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>Active Projects</p>
                    <p className="text-2xl font-bold" style={{ color: colors.accent.green[400] }}>342</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                       style={{ background: colors.gradients.accent.green }}>
                    <span className="text-xl">📋</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>Publications</p>
                    <p className="text-2xl font-bold" style={{ color: colors.primary.purple[400] }}>856</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                       style={{ background: colors.gradients.accent.purple }}>
                    <span className="text-xl">📚</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>Server Health</p>
                    <p className="text-2xl font-bold" style={{ color: colors.accent.green[400] }}>99.8%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                       style={{ background: colors.gradients.accent.green }}>
                    <span className="text-xl">⚡</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Management */}
              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text.primary }}>
                  User Management
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" 
                       style={{ backgroundColor: colors.surface.secondary }}>
                    <div>
                      <p className="font-medium" style={{ color: colors.text.primary }}>Recent Registrations</p>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>12 new users today</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-sm" style={getButtonStyles('outline')}>
                      View
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" 
                       style={{ backgroundColor: colors.surface.secondary }}>
                    <div>
                      <p className="font-medium" style={{ color: colors.text.primary }}>Pending Approvals</p>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>5 mentor applications</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-sm" style={getButtonStyles('primary')}>
                      Review
                    </button>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 rounded-lg" style={getButtonStyles('outline')}>
                  Manage All Users
                </button>
              </div>

              {/* System Analytics */}
              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text.primary }}>
                  System Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: colors.text.secondary }}>Daily Active Users</span>
                    <span className="font-medium" style={{ color: colors.accent.green[400] }}>+15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ 
                      width: '75%', 
                      background: colors.gradients.accent.green 
                    }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: colors.text.secondary }}>Storage Usage</span>
                    <span className="font-medium" style={{ color: colors.primary.blue[400] }}>68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ 
                      width: '68%', 
                      background: colors.gradients.accent.blue 
                    }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: colors.text.secondary }}>API Response Time</span>
                    <span className="font-medium" style={{ color: colors.accent.green[400] }}>120ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ 
                      width: '90%', 
                      background: colors.gradients.accent.green 
                    }}></div>
                  </div>
                </div>
              </div>

              {/* Content Moderation */}
              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text.primary }}>
                  Content Moderation
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" 
                       style={{ backgroundColor: colors.surface.secondary }}>
                    <div>
                      <p className="font-medium" style={{ color: colors.text.primary }}>Flagged Content</p>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>3 reports pending</p>
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.status.warning.text }}></div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" 
                       style={{ backgroundColor: colors.surface.secondary }}>
                    <div>
                      <p className="font-medium" style={{ color: colors.text.primary }}>Publication Reviews</p>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>8 awaiting approval</p>
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary.blue[400] }}></div>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 rounded-lg" style={getButtonStyles('primary')}>
                  Review Content
                </button>
              </div>

              {/* System Controls */}
              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text.primary }}>
                  System Controls
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 rounded-lg text-center border border-opacity-20 hover:border-opacity-40 transition-all" 
                          style={{ borderColor: colors.primary.blue[400] }}>
                    <div className="text-2xl mb-2">🛠️</div>
                    <p className="text-sm" style={{ color: colors.text.primary }}>System Settings</p>
                  </button>
                  <button className="p-4 rounded-lg text-center border border-opacity-20 hover:border-opacity-40 transition-all" 
                          style={{ borderColor: colors.accent.green[400] }}>
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-sm" style={{ color: colors.text.primary }}>Analytics</p>
                  </button>
                  <button className="p-4 rounded-lg text-center border border-opacity-20 hover:border-opacity-40 transition-all" 
                          style={{ borderColor: colors.primary.purple[400] }}>
                    <div className="text-2xl mb-2">🔒</div>
                    <p className="text-sm" style={{ color: colors.text.primary }}>Security</p>
                  </button>
                  <button className="p-4 rounded-lg text-center border border-opacity-20 hover:border-opacity-40 transition-all" 
                          style={{ borderColor: colors.status.warning.text }}>
                    <div className="text-2xl mb-2">💾</div>
                    <p className="text-sm" style={{ color: colors.text.primary }}>Backup</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent System Events */}
            <div className="mt-6 p-6 rounded-xl border" style={getCardStyles('glass')}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text.primary }}>
                Recent System Events
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: colors.accent.green[400] }}></div>
                  <div>
                    <p className="text-sm" style={{ color: colors.text.primary }}>
                      Database backup completed successfully
                    </p>
                    <p className="text-xs" style={{ color: colors.text.secondary }}>30 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: colors.primary.blue[400] }}></div>
                  <div>
                    <p className="text-sm" style={{ color: colors.text.primary }}>
                      New mentor application from Dr. Sarah Wilson
                    </p>
                    <p className="text-xs" style={{ color: colors.text.secondary }}>1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: colors.status.warning.text }}></div>
                  <div>
                    <p className="text-sm" style={{ color: colors.text.primary }}>
                      Server maintenance scheduled for tonight
                    </p>
                    <p className="text-xs" style={{ color: colors.text.secondary }}>2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
