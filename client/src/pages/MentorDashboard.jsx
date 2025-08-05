import React from 'react';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { getCardStyles, getGradientTextStyles, getButtonStyles } from '../styles/styleUtils';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardTopbar from '../components/DashboardTopbar';

export default function MentorDashboard() {
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
                Welcome back, {user?.name}! 🎓
              </h1>
              <p className="text-lg" style={{ color: colors.text.secondary }}>
                Mentor Dashboard - Guide and inspire the next generation of researchers
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>Students Mentored</p>
                    <p className="text-2xl font-bold" style={{ color: colors.primary.blue[400] }}>12</p>
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
                    <p className="text-2xl font-bold" style={{ color: colors.accent.green[400] }}>8</p>
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
                    <p className="text-2xl font-bold" style={{ color: colors.primary.purple[400] }}>25</p>
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
                    <p className="text-sm" style={{ color: colors.text.secondary }}>Reviews Pending</p>
                    <p className="text-2xl font-bold" style={{ color: colors.status.warning.text }}>3</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                       style={{ background: colors.gradients.accent.orange }}>
                    <span className="text-xl">⏳</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Management */}
              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text.primary }}>
                  Student Management
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" 
                       style={{ backgroundColor: colors.surface.secondary }}>
                    <div>
                      <p className="font-medium" style={{ color: colors.text.primary }}>John Smith</p>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>Machine Learning Project</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-sm" style={getButtonStyles('outline')}>
                      Review
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" 
                       style={{ backgroundColor: colors.surface.secondary }}>
                    <div>
                      <p className="font-medium" style={{ color: colors.text.primary }}>Sarah Johnson</p>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>Data Analysis Thesis</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-sm" style={getButtonStyles('outline')}>
                      Review
                    </button>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 rounded-lg" style={getButtonStyles('primary')}>
                  View All Students
                </button>
              </div>

              {/* Recent Activities */}
              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text.primary }}>
                  Recent Activities
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: colors.primary.blue[400] }}></div>
                    <div>
                      <p className="text-sm" style={{ color: colors.text.primary }}>
                        Reviewed thesis proposal from Alex Chen
                      </p>
                      <p className="text-xs" style={{ color: colors.text.secondary }}>2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: colors.accent.green[400] }}></div>
                    <div>
                      <p className="text-sm" style={{ color: colors.text.primary }}>
                        Approved project milestone for Emma Davis
                      </p>
                      <p className="text-xs" style={{ color: colors.text.secondary }}>1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: colors.primary.purple[400] }}></div>
                    <div>
                      <p className="text-sm" style={{ color: colors.text.primary }}>
                        Published new research paper
                      </p>
                      <p className="text-xs" style={{ color: colors.text.secondary }}>3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Meetings */}
              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text.primary }}>
                  Upcoming Meetings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" 
                       style={{ backgroundColor: colors.surface.secondary }}>
                    <div>
                      <p className="font-medium" style={{ color: colors.text.primary }}>Project Review</p>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>With John Smith • Today 3:00 PM</p>
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.status.warning.text }}></div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" 
                       style={{ backgroundColor: colors.surface.secondary }}>
                    <div>
                      <p className="font-medium" style={{ color: colors.text.primary }}>Thesis Defense</p>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>With Sarah Johnson • Tomorrow 10:00 AM</p>
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary.blue[400] }}></div>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 rounded-lg" style={getButtonStyles('outline')}>
                  View Calendar
                </button>
              </div>

              {/* Quick Actions */}
              <div className="p-6 rounded-xl border" style={getCardStyles('glass')}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text.primary }}>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 rounded-lg text-center border border-opacity-20 hover:border-opacity-40 transition-all" 
                          style={{ borderColor: colors.primary.blue[400] }}>
                    <div className="text-2xl mb-2">📝</div>
                    <p className="text-sm" style={{ color: colors.text.primary }}>Create Review</p>
                  </button>
                  <button className="p-4 rounded-lg text-center border border-opacity-20 hover:border-opacity-40 transition-all" 
                          style={{ borderColor: colors.accent.green[400] }}>
                    <div className="text-2xl mb-2">📋</div>
                    <p className="text-sm" style={{ color: colors.text.primary }}>New Project</p>
                  </button>
                  <button className="p-4 rounded-lg text-center border border-opacity-20 hover:border-opacity-40 transition-all" 
                          style={{ borderColor: colors.primary.purple[400] }}>
                    <div className="text-2xl mb-2">📅</div>
                    <p className="text-sm" style={{ color: colors.text.primary }}>Schedule Meeting</p>
                  </button>
                  <button className="p-4 rounded-lg text-center border border-opacity-20 hover:border-opacity-40 transition-all" 
                          style={{ borderColor: colors.status.warning.text }}>
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-sm" style={{ color: colors.text.primary }}>View Reports</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
