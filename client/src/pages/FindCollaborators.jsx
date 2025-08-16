import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import CollaboratorsCard from '../components/CollaboratorsCard';
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';
import { useAlert } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Filter, Users } from 'lucide-react';

const FindCollaborators = () => {
  const { colors } = useTheme();
  const { user: currentUser, logout } = useAuth();
  const { showError } = useAlert();
  const navigate = useNavigate();

  const [collaborators, setCollaborators] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    university: '',
    skills: [],
    location: ''
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 1; // 1 row per page
  const cardsPerRow = 3; // 3 cards per row
  const cardsPerPage = rowsPerPage * cardsPerRow;
  const totalPages = Math.ceil(filtered.length / cardsPerPage);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fetch collaborators
  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/users?role=student&limit=50');
      const data = res.data.data || res.data || [];

      const filteredList = data
        .filter(u => u._id !== currentUser?._id)
        .map(user => ({
          ...user,
          skills: user.skills || ['React', 'Node.js', 'Python', 'Machine Learning'],
          bio: user.bio || 'Passionate about technology and research. Looking for collaboration opportunities.',
          rating: user.rating || (4.0 + Math.random()).toFixed(1),
          reviewCount: user.reviewCount || Math.floor(Math.random() * 20) + 5,
          collaborations: user.collaborations || Math.floor(Math.random() * 10),
          location: user.location || 'Location not specified',
          department: user.department || 'Computer Science',
          university: user.university || 'University'
        }));

      setCollaborators(filteredList);
      setFiltered(filteredList);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      try {
        const fallbackRes = await axios.get('/users/students?limit=50');
        const fallbackData = fallbackRes.data.data || fallbackRes.data || [];
        setCollaborators(fallbackData);
        setFiltered(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback request failed:', fallbackError);
        showError && showError('Failed to load collaborators');
      }
    } finally {
      setLoading(false);
    }
  };

  // Search and filter logic
  useEffect(() => {
    let result = collaborators;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user =>
        user.name?.toLowerCase().includes(query) ||
        user.skills?.some(skill => skill.toLowerCase().includes(query)) ||
        user.department?.toLowerCase().includes(query) ||
        user.university?.toLowerCase().includes(query) ||
        user.bio?.toLowerCase().includes(query)
      );
    }

    if (filters.department) {
      result = result.filter(user =>
        user.department?.toLowerCase().includes(filters.department.toLowerCase())
      );
    }
    if (filters.university) {
      result = result.filter(user =>
        user.university?.toLowerCase().includes(filters.university.toLowerCase())
      );
    }
    if (filters.location) {
      result = result.filter(user =>
        user.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.skills.length > 0) {
      result = result.filter(user =>
        filters.skills.some(skill =>
          user.skills?.some(userSkill =>
            userSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    setFiltered(result);
    setCurrentPage(1); // reset to first page when filters/search change
  }, [searchQuery, collaborators, filters]);

  const handleRequestSent = (studentId) => {
    setCollaborators(prev =>
      prev.map(user =>
        user._id === studentId
          ? { ...user, collaborationStatus: 'sent' }
          : user
      )
    );
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      university: '',
      skills: [],
      location: ''
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(val =>
    Array.isArray(val) ? val.length > 0 : val !== ''
  ) || searchQuery.trim() !== '';

  // Pagination slice
  const paginatedData = filtered.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: colors.background.primary }}>
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar
          onMenuToggle={() => {}}
          user={currentUser}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
                    Find Collaborators
                  </h1>
                  <p style={{ color: colors.text.secondary }}>
                    Connect with fellow students and researchers for your projects
                  </p>
                </div>
                <div
                  className="px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}10`,
                    borderColor: `${colors.primary?.blue?.[400] || '#60a5fa'}40`,
                    color: colors.text.primary
                  }}
                >
                  <Users size={16} className="inline mr-2" />
                  {filtered.length} Students
                </div>
              </div>

              {/* Search & Filters */}
              <div
                className="backdrop-blur-lg rounded-xl p-6 border"
                style={{
                  backgroundColor: colors.background.glass,
                  borderColor: colors.border.secondary
                }}
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      size={16}
                      style={{ color: colors.text.secondary }}
                    />
                    <input
                      type="text"
                      placeholder="Search by name, skills, department, university..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition-all"
                      style={{
                        backgroundColor: `${colors.background.glass}CC`,
                        color: colors.text.primary,
                        borderColor: colors.border.secondary
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border transition-all"
                    style={{
                      backgroundColor: showFilters
                        ? `${colors.primary?.blue?.[500] || '#3b82f6'}20`
                        : 'transparent',
                      color: colors.text.primary,
                      borderColor: colors.border.secondary
                    }}
                  >
                    <Filter size={16} />
                    Filters
                    {hasActiveFilters && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors.primary?.blue?.[500] || '#3b82f6' }}
                      ></span>
                    )}
                  </button>
                </div>

                {showFilters && (
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: colors.border.secondary }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm mb-2" style={{ color: colors.text.secondary }}>
                          Department
                        </label>
                        <input
                          type="text"
                          value={filters.department}
                          onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border outline-none"
                          style={{
                            backgroundColor: `${colors.background.glass}CC`,
                            color: colors.text.primary,
                            borderColor: colors.border.secondary
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{ color: colors.text.secondary }}>
                          University
                        </label>
                        <input
                          type="text"
                          value={filters.university}
                          onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border outline-none"
                          style={{
                            backgroundColor: `${colors.background.glass}CC`,
                            color: colors.text.primary,
                            borderColor: colors.border.secondary
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{ color: colors.text.secondary }}>
                          Location
                        </label>
                        <input
                          type="text"
                          value={filters.location}
                          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border outline-none"
                          style={{
                            backgroundColor: `${colors.background.glass}CC`,
                            color: colors.text.primary,
                            borderColor: colors.border.secondary
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{ color: colors.text.secondary }}>
                          Skills
                        </label>
                        <input
                          type="text"
                          value={filters.skills.join(', ')}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          }))}
                          className="w-full px-3 py-2 rounded-lg border outline-none"
                          style={{
                            backgroundColor: `${colors.background.glass}CC`,
                            color: colors.text.primary,
                            borderColor: colors.border.secondary
                          }}
                        />
                      </div>
                    </div>
                    {hasActiveFilters && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={clearFilters}
                          className="text-sm px-4 py-2 rounded-lg transition-colors"
                          style={{
                            color: colors.text.secondary,
                            backgroundColor: `${colors.text.secondary}10`
                          }}
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            {!loading && (
              <p style={{ color: colors.text.secondary }} className="mb-6">
                {filtered.length === collaborators.length
                  ? `Showing all ${filtered.length} students`
                  : `Showing ${filtered.length} of ${collaborators.length} students`}
              </p>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2
                  className="animate-spin mb-4"
                  size={48}
                  style={{ color: colors.primary?.blue?.[500] || '#3b82f6' }}
                />
                <p style={{ color: colors.text.secondary }}>Loading collaborators...</p>
              </div>
            ) : paginatedData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedData.map((student) => (
                    <CollaboratorsCard
                      key={student._id}
                      student={student}
                      showProjects={true}
                      showPublications={false}
                      compact={false}
                      onRequestSent={handleRequestSent}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-full font-bold shadow border-2 transition-all duration-150 ${
                      currentPage === 1 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border-blue-200 hover:bg-blue-50'
                    }`}
                    style={{
                      color: currentPage === 1 ? '#9ca3af' : colors.primary?.blue?.[500] || '#3b82f6',
                      borderColor: currentPage === 1 ? '#d1d5db' : colors.primary?.blue?.[200] || '#93c5fd'
                    }}
                    aria-label="Previous Page"
                  >
                    Previous
                  </button>
                  
                  <span className="font-bold text-lg" style={{ color: colors.text.primary }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-full font-bold shadow border-2 transition-all duration-150 ${
                      currentPage === totalPages 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border-blue-200 hover:bg-blue-50'
                    }`}
                    style={{
                      color: currentPage === totalPages ? '#9ca3af' : colors.primary?.blue?.[500] || '#3b82f6',
                      borderColor: currentPage === totalPages ? '#d1d5db' : colors.primary?.blue?.[200] || '#93c5fd'
                    }}
                    aria-label="Next Page"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div
                className="text-center py-20 backdrop-blur-lg rounded-xl border"
                style={{
                  backgroundColor: colors.background.glass,
                  borderColor: colors.border.secondary
                }}
              >
                <Users size={48} style={{ color: colors.text.secondary }} className="mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                  No collaborators found
                </h3>
                <p style={{ color: colors.text.secondary }}>
                  Try adjusting your search criteria or filters
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: colors.primary?.blue?.[500] || '#3b82f6',
                      color: 'white'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindCollaborators;