import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import axios from '../axios';
import CollaboratorsCard from '../components/CollaboratorsCard';
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';
import { Trash2, AlertCircle, RefreshCw, UserCheck, Search } from 'lucide-react';

const MyMentees = () => {
  const { colors } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user ,logout} = useAuth();
  const { showSuccess, showError, showWarning } = useAlert();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user && user.role === 'mentor') {
      fetchMentees();
    } else {
      showWarning('This page is only accessible to mentors');
    }
  }, [user, refreshKey]);

  const fetchMentees = async () => {
    try {
      setLoading(true);
      // Fetch all collaborations where the current user (mentor) is either the sender or recipient
      // and the status is 'accepted'
      const response = await axios.get('/collaborations/requests?type=all');
      
      // Filter for only accepted collaborations
      const acceptedCollaborations = response.data.data.filter(
        collab => collab.status === 'accepted'
      );
      
      if (acceptedCollaborations.length > 0) {
        // Map the collaborations to include mentee data
        const menteesData = acceptedCollaborations.map(collab => {
          // If the current user is the requester, then the recipient is the mentee
          // If the current user is the recipient, then the requester is the mentee
          const isMentorRequester = collab.requester?._id === user?.id;
          return {
            _id: collab._id,
            mentee: isMentorRequester ? collab.recipient : collab.requester,
            project: collab.projectId,
            createdAt: collab.createdAt
          };
        });
        
        setMentees(menteesData || []);
      } else {
        setMentees([]);
        showWarning('No mentees found');
      }
    } catch (err) {
      console.error('Error fetching mentees:', err);
      showError('Failed to load mentees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeCollaboration = async (collaborationId) => {
    if (!window.confirm('Are you sure you want to remove this mentee?')) {
      return;
    }

    try {
      const response = await axios.delete(`/collaborations/cancel/${collaborationId}`);
      
      if (response.data.success) {
        showSuccess('Mentee removed successfully');
        // Refresh the list
        setRefreshKey(oldKey => oldKey + 1);
      }
    } catch (err) {
      console.error('Error removing mentee:', err);
      showError('Failed to remove mentee. Please try again.');
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      showSuccess('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to logout';
      showError(`Logout failed: ${errorMessage}`);
      // Still navigate to login page even if logout fails
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };








  const filteredMentees = mentees.filter(item => 
    item.mentee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mentee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mentee?.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100" style={{ backgroundColor: colors.background.primary }}>
      {/* Sidebar */}
  <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
         <Topbar 
                   onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
                   user={user}
                   onLogout={handleLogout}
                   isLoggingOut={isLoggingOut}
                 />

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="container mx-auto">
            <div className="mb-8">
              <h1 
                className="text-3xl font-bold mb-2" 
                style={{ color: colors.text.primary }}
              >
                My Mentees
              </h1>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Students you are currently mentoring and collaborating with
              </p>
            </div>

            {/* Search and refresh controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div 
                className="relative flex-1 max-w-md"
                style={{ color: colors.text.secondary }}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search mentees by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.primary,
                    color: colors.text.primary
                  }}
                />
              </div>
              
              <button
                onClick={() => setRefreshKey(oldKey => oldKey + 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: colors.background.secondary,
                  color: colors.primary?.blue?.[500] || '#3b82f6',
                  border: `1px solid ${colors.border.primary}`
                }}
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
                  style={{ borderColor: colors.primary?.blue?.[500] || '#3b82f6' }}></div>
              </div>
            ) : filteredMentees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentees.map((collaboration) => {
                  const mentee = collaboration.mentee || {};
                  
                  return (
                    <div key={collaboration._id} className="relative">
                      <CollaboratorsCard 
                        student={mentee} 
                        showProjects={true}
                        showPublications={true}
                        compact={false}
                      />
                      
                      {/* Remove collaboration button */}
                      <button
                        onClick={() => removeCollaboration(collaboration._id)}
                        className="absolute top-4 right-4 p-2 rounded-full transition-colors"
                        style={{
                          backgroundColor: `${colors.accent?.red?.[500] || '#ef4444'}20`,
                          color: colors.accent?.red?.[500] || '#ef4444'
                        }}
                        title="Remove mentee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div 
                className="text-center py-12 rounded-lg border"
                style={{
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.primary
                }}
              >
                <div className="flex justify-center mb-4">
                  <UserCheck 
                    size={48} 
                    style={{ color: colors.text.muted }}
                  />
                </div>
                <h3 
                  className="text-xl font-bold mb-2" 
                  style={{ color: colors.text.primary }}
                >
                  No mentees found
                </h3>
                <p className="max-w-md mx-auto" style={{ color: colors.text.secondary }}>
                  You don't have any active mentees yet. Send collaboration requests to students or accept incoming requests to start mentoring.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyMentees;
