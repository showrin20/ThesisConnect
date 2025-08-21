import {
  BookOpen,
  Tag,
  Users,
  Clock,
  Search,
  Filter,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Bookmark,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { colors } from '../styles/colors';
import { getButtonStyles } from '../styles/styleUtils';

export default function MyProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);
  const [bookmarkedProjects, setBookmarkedProjects] = useState({}); // Track bookmarked projects
  const [bookmarkLoading, setBookmarkLoading] = useState({});  // Track bookmark operations by projectId

  // Get auth context and alerts
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // default for desktop

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      setProjectsError(null);
      try {
        const response = await axios.get('/projects');
        const fetchedProjects = response.data?.data || [];
        console.log('Fetched Projects:', fetchedProjects);
        setProjects(fetchedProjects);
        
        // Check bookmark status for each project if user is logged in
        if (user?.token) {
          checkBookmarkStatus(fetchedProjects);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setProjectsError('Failed to load projects');
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [user]);
  
  // Function to check bookmark status for projects
  const checkBookmarkStatus = async (projectsList) => {
    if (!user?.token || !projectsList?.length) return;
    
    try {
      // Create a new bookmark status object
      const bookmarkStatus = {};
      
      // Check each project's bookmark status
      for (const project of projectsList) {
        try {
          const response = await axios.get(`/bookmarks/check/${project._id}`, {
            params: { type: 'project' },
            headers: { 'x-auth-token': user.token }
          });
          
          if (response.data.success) {
            bookmarkStatus[project._id] = {
              isBookmarked: response.data.bookmarked,
              bookmarkId: response.data.bookmarkId
            };
          }
        } catch (err) {
          console.error(`Error checking bookmark for project ${project._id}:`, err);
        }
      }
      
      // Update the bookmark status state
      setBookmarkedProjects(bookmarkStatus);
      
    } catch (error) {
      console.error('Error checking bookmark statuses:', error);
    }
  };
  
  // Handle bookmark toggle
  const handleBookmarkToggle = async (projectId) => {
    // Don't proceed if user not logged in or operation in progress
    if (!user?.token || bookmarkLoading[projectId]) return;
    
    // Mark this project's bookmark operation as loading
    setBookmarkLoading(prev => ({ ...prev, [projectId]: true }));
    
    try {
      const isCurrentlyBookmarked = bookmarkedProjects[projectId]?.isBookmarked;
      
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const bookmarkId = bookmarkedProjects[projectId].bookmarkId;
        await axios.delete(`/bookmarks/${bookmarkId}`, {
          headers: { 'x-auth-token': user.token }
        });
        
        // Update state
        setBookmarkedProjects(prev => ({
          ...prev,
          [projectId]: { isBookmarked: false, bookmarkId: null }
        }));
        
        showSuccess('Project removed from bookmarks');
      } else {
        // Add bookmark
        const response = await axios.post('/bookmarks', {
          projectId: projectId,
          type: 'project'
        }, {
          headers: { 'x-auth-token': user.token }
        });
        
        // Update state with new bookmark info
        if (response.data.success) {
          setBookmarkedProjects(prev => ({
            ...prev,
            [projectId]: { 
              isBookmarked: true, 
              bookmarkId: response.data.data._id 
            }
          }));
          
          showSuccess('Project added to bookmarks');
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showError(error.response?.data?.msg || 'Failed to update bookmark');
    } finally {
      // Clear loading state for this project
      setBookmarkLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  // Adjust items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(2); // 1 col × 2 rows
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(4); // 2 cols × 2 rows
      } else {
        setItemsPerPage(6); // 3 cols × 2 rows
      }
    };
    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const statuses = ['All', 'Personal'];

  const allKeywords = useMemo(
    () => [...new Set(projects.flatMap((p) => p.tags || []))].sort(),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.tags || []).some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        selectedStatus === 'All' || selectedStatus === 'Personal'; // placeholder logic

      const matchesKeywords =
        selectedKeywords.length === 0 ||
        selectedKeywords.every((keyword) =>
          project.tags?.includes(keyword)
        );

      return matchesSearch && matchesStatus && matchesKeywords;
    });
  }, [projects, searchTerm, selectedStatus, selectedKeywords]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleKeywordToggle = (keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
    setCurrentPage(1); // reset page when filter changes
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedKeywords([]);
    setCurrentPage(1); // reset page when clearing filters
  };

  const getStatusBadgeColor = (status) => {
    return {
      backgroundColor: colors.surface.secondary,
      color: colors.text.secondary,
      borderColor: colors.border.primary
    };
  };

  const handleThesisClick = (thesisDraft) => {
    if (thesisDraft.pdfUrl) {
      const link = document.createElement('a');
      link.href = thesisDraft.pdfUrl;
      link.download = thesisDraft.pdfFileName || 'thesis.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (thesisDraft.externalLink) {
      const url = thesisDraft.externalLink.startsWith('http') ? thesisDraft.externalLink : `https://${thesisDraft.externalLink}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Pagination navigation
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${colors.gradients.background.main}, ${colors.gradients.background.hero})`
      }}
    >
      {/* Header */}
      <div 
        className="backdrop-blur-sm border-b shadow-sm"
        style={{ borderColor: `${colors.border.primary}99` }}
      >
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  background: colors.gradients.brand.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Research Projects
              </span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.text.primary }}>
              Exploring real-world problems with tech innovation
            </p>
          </div>

          {/* Search and Filters */}
          <div 
            className="backdrop-blur-sm rounded-2xl p-6 border shadow-lg"
            style={{
              backgroundColor: `${colors.background.glass}B3`,
              borderColor: `${colors.border.primary}99`
            }}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                  style={{ color: colors.text.muted }}
                />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: `${colors.input.background}CC`,
                    borderColor: colors.input.border,
                    color: colors.input.text
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.input.borderFocus;
                    e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.input.border;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 border rounded-lg transition-all duration-200 shadow-sm"
                  style={getButtonStyles('outline')}
                  onMouseEnter={(e) => {
                    Object.assign(e.target.style, getButtonStyles('outline'));
                    e.target.style.backgroundColor = colors.button.outline.backgroundHover;
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.target.style, getButtonStyles('outline'));
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {(selectedStatus !== 'All' || selectedKeywords.length > 0) && (
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.primary.blue[400] }}
                    ></span>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div 
                className="border-t pt-4 animate-in slide-in-from-top-2 duration-200"
                style={{ borderColor: `${colors.border.primary}99` }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: `${colors.input.background}CC`,
                        borderColor: colors.input.border,
                        color: colors.input.text
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colors.input.borderFocus;
                        e.target.style.boxShadow = `0 0 0 2px ${colors.primary.blue[400]}33`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colors.input.border;
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>Tags</label>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {allKeywords.map((keyword) => (
                        <button
                          key={keyword}
                          onClick={() => handleKeywordToggle(keyword)}
                          className="px-3 py-1 rounded-full text-xs border transition-all duration-200 shadow-sm"
                          style={
                            selectedKeywords.includes(keyword)
                              ? {
                                  backgroundColor: colors.primary.blue[500],
                                  color: colors.button.primary.text,
                                  borderColor: colors.primary.blue[400]
                                }
                              : {
                                  backgroundColor: `${colors.background.card}CC`,
                                  color: colors.text.secondary,
                                  borderColor: colors.border.primary
                                }
                          }
                          onMouseEnter={(e) => {
                            if (!selectedKeywords.includes(keyword)) {
                              e.target.style.backgroundColor = colors.surface.muted;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedKeywords.includes(keyword)) {
                              e.target.style.backgroundColor = `${colors.background.card}CC`;
                            }
                          }}
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {(searchTerm || selectedStatus !== 'All' || selectedKeywords.length > 0) && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2 transition-colors duration-200"
                      style={{
                        color: colors.text.muted,
                        backgroundColor: 'transparent',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = colors.text.secondary;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = colors.text.muted;
                      }}
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Result Summary */}
            <div 
              className="mt-4 pt-4 border-t"
              style={{ borderColor: `${colors.border.primary}99` }}
            >
              <p className="text-sm" style={{ color: colors.text.muted }}>
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Grid */}
      <div className="container mx-auto px-4 py-8">
        {loadingProjects ? (
          <div className="text-center py-12" style={{ color: colors.text.muted }}>Loading projects...</div>
        ) : projectsError ? (
          <div className="text-center py-12" style={{ color: colors.accent.red[400] }}>{projectsError}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div 
              className="rounded-xl p-8 max-w-md mx-auto shadow-lg border"
              style={{
                backgroundColor: `${colors.background.glass}B3`,
                borderColor: `${colors.border.primary}99`
              }}
            >
              <Search className="w-12 h-12 mx-auto mb-4" style={{ color: colors.text.muted }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.secondary }}>No projects found</h3>
              <p style={{ color: colors.text.muted }}>Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedProjects.map((project) => (
                <article
                  key={project._id}
                  className="group backdrop-blur-sm rounded-2xl p-6 border hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${colors.background.glass}CC, ${colors.primary.blue[50]}CC)`,
                    borderColor: `${colors.border.primary}99`
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = `${colors.border.primary}CC`;
                    e.target.style.boxShadow = `0 20px 25px -5px ${colors.primary.blue[400]}26, 0 10px 10px -5px ${colors.primary.blue[400]}1A`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = `${colors.border.primary}99`;
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold mb-3 leading-tight">
                        <span 
                          className="bg-clip-text text-transparent"
                          style={{
                            background: colors.gradients.brand.primary,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            overflowWrap: 'anywhere'
                          }}
                        >
                          {project.title}
                        </span>
                      </h2>
                      
                      {/* Bookmark Button */}
                      {user && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkToggle(project._id);
                          }}
                          disabled={bookmarkLoading[project._id]}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 transform hover:scale-110"
                          title={bookmarkedProjects[project._id]?.isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                          style={{ 
                            marginTop: '4px',
                            opacity: bookmarkLoading[project._id] ? 0.7 : 1 
                          }}
                        >
                          <Bookmark 
                            size={18} 
                            fill={bookmarkedProjects[project._id]?.isBookmarked ? '#FFD700' : 'transparent'} 
                            color={bookmarkedProjects[project._id]?.isBookmarked ? '#FFD700' : colors.text.secondary} 
                          />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium"
                        style={getStatusBadgeColor()}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{new Date(project.createdAt).toDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: colors.text.secondary }}>
                    {project.description}
                  </p>

                  {project.tags?.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1 mb-2">
                        <Tag className="w-4 h-4" style={{ color: colors.primary.blue[500] }} />
                        <span className="text-xs font-medium" style={{ color: colors.text.muted }}>Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded-md border transition-all duration-200 shadow-sm"
                            style={{
                              backgroundColor: colors.surface.secondary,
                              color: colors.text.secondary,
                              borderColor: colors.border.primary
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = `${colors.primary.blue[100]}`;
                              e.target.style.borderColor = `${colors.primary.blue[300]}`;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = colors.surface.secondary;
                              e.target.style.borderColor = colors.border.primary;
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span 
                            className="px-2 py-1 text-xs rounded-md border shadow-sm"
                            style={{
                              backgroundColor: colors.surface.secondary,
                              color: colors.text.muted,
                              borderColor: colors.border.primary
                            }}
                          >
                            +{project.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {project.creator?.name && (
                    <div className="mb-6">
                      <div className="flex items-center gap-1 mb-2">
                        <Users className="w-4 h-4" style={{ color: colors.primary.purple[500] }} />
                        <span className="text-xs font-medium" style={{ color: colors.text.muted }}>Created by</span>
                      </div>
                      <div className="text-sm" style={{ color: colors.text.secondary }}>{project.creator.name}</div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {project.link && (
                      <button
                        onClick={() => {
                          const url = project.link.startsWith('http') ? project.link : `https://${project.link}`;
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-sm font-medium"
                        style={{
                          background: colors.gradients.brand.primary,
                          color: colors.text.primary,
                          boxShadow: `0 4px 12px ${colors.primary.blue[500]}33`
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.boxShadow = `0 6px 20px ${colors.primary.blue[500]}44`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.boxShadow = `0 4px 12px ${colors.primary.blue[500]}33`;
                        }}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Project Link</span>
                      </button>
                    )}
                    {project.thesisDraft && (project.thesisDraft.pdfUrl || project.thesisDraft.externalLink) && (
                      <button
                        onClick={() => handleThesisClick(project.thesisDraft)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-sm font-medium"
                        style={{
                          background: colors.gradients.brand.secondary || colors.gradients.brand.primary,
                          color: colors.text.primary,
                          boxShadow: `0 4px 12px ${colors.primary.blue[500]}33`
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.boxShadow = `0 6px 20px ${colors.primary.blue[500]}44`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.boxShadow = `0 4px 12px ${colors.primary.blue[500]}33`;
                        }}
                      >
                        <Download className="w-4 h-4" />
                        <span style={{ color: colors.text.primary }}>View Project Report</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50"
                  style={{
                    backgroundColor: currentPage === 1 ? colors.background.glass : colors.button.primary.background,
                    color: colors.button.primary.text,
                    border: `1px solid ${colors.border.primary}`
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.backgroundColor = colors.button.primary.backgroundHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.target.style.backgroundColor = colors.button.primary.background;
                    }
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className="px-3 py-2 rounded-lg transition-all duration-200 shadow-sm"
                      style={{
                        backgroundColor: currentPage === page ? colors.primary.blue[500] : colors.background.card,
                        color: currentPage === page ? colors.button.primary.text : colors.text.secondary,
                        border: `1px solid ${colors.border.primary}`
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== page) {
                          e.target.style.backgroundColor = colors.surface.muted;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== page) {
                          e.target.style.backgroundColor = colors.background.card;
                        }
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50"
                  style={{
                    backgroundColor: currentPage === totalPages ? colors.background.glass : colors.button.primary.background,
                    color: colors.button.primary.text,
                    border: `1px solid ${colors.border.primary}`
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.target.style.backgroundColor = colors.button.primary.backgroundHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages) {
                      e.target.style.backgroundColor = colors.button.primary.background;
                    }
                  }}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}