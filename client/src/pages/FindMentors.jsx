import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import CollaboratorsCard from '../components/CollaboratorsCard'; // Reused as MentorCard
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';
import { useAlert } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Filter, Users } from 'lucide-react';

const FindMentors = () => {
  const { colors } = useTheme();
  const { user: currentUser, logout } = useAuth();
  const { showError } = useAlert();
  const navigate = useNavigate();

  const [mentors, setMentors] = useState([]);
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

  // Fetch mentors
  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/users?role=mentor&limit=50');
      const data = res.data.data || res.data || [];

      const filteredList = data
        .filter(u => u._id !== currentUser?._id)
        .map(user => ({
          ...user,
          skills: user.skills || ['React', 'Node.js', 'Python', 'Machine Learning'],
          bio: user.bio || 'Experienced mentor passionate about guiding students in research and technology.',
          rating: user.rating || (4.0 + Math.random()).toFixed(1),
          reviewCount: user.reviewCount || Math.floor(Math.random() * 20) + 5,
          collaborations: user.collaborations || Math.floor(Math.random() * 10),
          location: user.location || 'Location not specified',
          department: user.department || 'Computer Science',
          university: user.university || 'University'
        }));

      setMentors(filteredList);
      setFiltered(filteredList);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      try {
        const fallbackRes = await axios.get('/users/mentors?limit=50');
        const fallbackData = fallbackRes.data.data || fallbackRes.data || [];
        setMentors(fallbackData);
        setFiltered(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback request failed:', fallbackError);
        showError && showError('Failed to load mentors');
      }
    } finally {
      setLoading(false);
    }
  };

  // Search and filter logic
  useEffect(() => {
    let result = mentors;

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
  }, [searchQuery, mentors, filters]);

  const handleRequestSent = (mentorId) => {
    setMentors(prev =>
      prev.map(user =>
        user._id === mentorId
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
                    Find Mentors
                  </h1>
                  <p style={{ color: colors.text.secondary }}>
                    Connect with experienced mentors for guidance in your projects
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
                  {filtered.length} Mentors
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
                {filtered.length === mentors.length
                  ? `Showing all ${filtered.length} mentors`
                  : `Showing ${filtered.length} of ${mentors.length} mentors`}
              </p>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2
                  className="animate-spin mb-4"
                  size={48}
                  style={{ color: colors.primary?.blue?.[500] || '#3b82f6' }}
                />
                <p style={{ color: colors.text.secondary }}>Loading mentors...</p>
              </div>
            ) : paginatedData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedData.map((mentor) => (
                    <CollaboratorsCard
                      key={mentor._id}
                      student={mentor} // Reusing CollaboratorsCard, passing mentor as 'student' prop
                      showProjects={true}
                      showPublications={false}
                      compact={false}
                      onRequestSent={handleRequestSent}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center mt-8 space-x-2">
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        currentPage === idx + 1
                          ? "bg-blue-500 text-white"
                          : "bg-transparent text-gray-600"
                      }`}
                      style={{
                        borderColor: colors.border.secondary
                      }}
                    >
                      {idx + 1}
                    </button>
                  ))}
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
                  No mentors found
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

export default FindMentors;