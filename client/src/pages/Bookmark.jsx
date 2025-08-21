import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { debounce } from 'lodash';
import ProjectCard from '../components/ProjectCard';
import PublicationCard from '../components/PublicationCard';
import BlogCard from '../components/BlogCard';
import CommunityPostCard from '../components/CommunityPostCard';
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';
import { colors } from '../styles/colors';

export default function Bookmark() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedType, setSelectedType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState({
    totalBookmarks: 0,
    bookmarksByType: [],
    recentBookmarks: 0,
    popularContent: []
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  
  const ITEMS_PER_PAGE = 6;
  
  const debouncedSetSearchTerm = debounce((value) => setSearchTerm(value), 300);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/bookmarks`, {
          params: {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            type: selectedType !== 'All' ? selectedType : undefined,
            search: searchTerm || undefined,
          },
          headers: {
            'x-auth-token': user.token,
          },
        });
        
        setBookmarks(response.data.data);
        setTotalPages(response.data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        if (error.response?.status === 401) {
          showError('Session expired. Please log in again.');
          navigate('/login');
        } else {
          setError('Failed to load bookmarks. Please try again later.');
          showError('Failed to load your bookmarks');
        }
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user, currentPage, selectedType, searchTerm, refreshTrigger, navigate, showError]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const response = await axios.get(`/bookmarks/stats/overview`, {
          headers: {
            'x-auth-token': user.token,
          },
        });
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching bookmark stats:', error);
      }
    };

    fetchStats();
  }, [user, refreshTrigger]);

  const handleRemoveBookmark = async (bookmarkId, projectId) => {
    const previousBookmarks = [...bookmarks];
    setBookmarks(prev => prev.filter(bookmark => bookmark._id !== bookmarkId));
    try {
      await axios.delete(`/bookmarks/${bookmarkId}`, {
        headers: {
          'x-auth-token': user.token,
        },
      });
      
      showSuccess('Bookmark removed successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error removing bookmark:', error);
      setBookmarks(previousBookmarks);
      showError('Failed to remove bookmark. Please try again.');
    }
  };

  const handleBookmarkClick = async (bookmarkId, contentId, type) => {
    try {
      await axios.put(`/bookmarks/visit/${bookmarkId}`, {}, {
        headers: {
          'x-auth-token': user.token,
        },
      });
    } catch (error) {
      console.error('Error updating last visited:', error);
    }
    navigate(`/${type}/${contentId}`);
  };

  const handleExport = async (format = 'csv') => {
    try {
      showSuccess('Preparing export...');
      
      const response = await axios.get('/bookmarks/export', {
        params: { format },
        headers: { 'x-auth-token': user.token },
        responseType: format === 'csv' ? 'blob' : 'json',
        timeout: 15000, // Increase timeout for large datasets
      });
      
      if (format === 'csv') {
        try {
          const blob = new Blob([response.data], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `bookmarks-${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
          }, 100);
          
          showSuccess('Bookmarks exported as CSV');
        } catch (blobError) {
          console.error('Error creating CSV blob:', blobError);
          showError('Failed to create CSV file');
        }
      } else {
        try {
          // For JSON format
          let jsonData = response.data;
          if (typeof jsonData !== 'string') {
            jsonData = JSON.stringify(jsonData, null, 2);
          }
          
          const blob = new Blob([jsonData], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `bookmarks-${new Date().toISOString().split('T')[0]}.json`);
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
          }, 100);
          
          showSuccess('Bookmarks exported as JSON');
        } catch (blobError) {
          console.error('Error creating JSON blob:', blobError);
          showError('Failed to create JSON file');
        }
      }
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
      showError(error.response?.data?.msg || 'Failed to export bookmarks. Please try again.');
    }
  };

  const renderBookmarkItem = (bookmark) => {
    // Safely extract content details, falling back to bookmark's own properties if needed
    let contentDetails = bookmark.contentDetails || bookmark.projectId || {};
    
    // Ensure we have minimum necessary properties for rendering
    if (!contentDetails || typeof contentDetails !== 'object') {
      contentDetails = {
        _id: bookmark.projectId || bookmark._id,
        title: bookmark.projectTitle || 'Untitled',
        description: bookmark.projectDescription || '',
        tags: bookmark.tags || [],
      };
    }
    
    const contentId = contentDetails._id || bookmark.projectId || '';
    
    // Safely ensure required properties exist on contentDetails
    contentDetails.title = contentDetails.title || bookmark.projectTitle || 'Untitled';
    contentDetails.description = contentDetails.description || bookmark.projectDescription || '';
    contentDetails.tags = contentDetails.tags || bookmark.tags || [];
    
    // Ensure we have valid date fields
    contentDetails.createdAt = contentDetails.createdAt || bookmark.createdAt || new Date();
    contentDetails.updatedAt = contentDetails.updatedAt || bookmark.updatedAt || new Date();
    
    switch (bookmark.type) {
      case 'project':
        return (
          <ProjectCard 
            key={bookmark._id}
            project={contentDetails} 
            isBookmarked={true}
            onBookmarkToggle={() => handleRemoveBookmark(bookmark._id, contentId)}
            onClick={() => handleBookmarkClick(bookmark._id, contentId, bookmark.type)}
          />
        );
      case 'publication':
        return (
          <PublicationCard 
            key={bookmark._id}
            publication={contentDetails} 
            isBookmarked={true}
            onBookmarkToggle={() => handleRemoveBookmark(bookmark._id, contentId)}
            onClick={() => handleBookmarkClick(bookmark._id, contentId, bookmark.type)}
          />
        );
      case 'blog':
        return (
          <BlogCard 
            key={bookmark._id}
            blog={contentDetails} 
            isBookmarked={true}
            onBookmarkToggle={() => handleRemoveBookmark(bookmark._id, contentId)}
            onClick={() => handleBookmarkClick(bookmark._id, contentId, bookmark.type)}
          />
        );
      case 'community':
        return (
          <CommunityPostCard 
            key={bookmark._id}
            post={contentDetails} 
            isBookmarked={true}
            onBookmarkToggle={() => handleRemoveBookmark(bookmark._id, contentId)}
            onClick={() => handleBookmarkClick(bookmark._id, contentId, 'community')}
          />
        );
      default:
        // Fallback card when type is unknown or component is missing
        return (
          <div 
            key={bookmark._id} 
            style={{
              padding: '1rem',
              border: `1px solid ${colors.border.primary}`,
              borderRadius: '0.5rem',
              backgroundColor: colors.background.card,
              boxShadow: colors.shadow.default,
              cursor: 'pointer',
            }}
            onClick={() => handleBookmarkClick(bookmark._id, contentId, bookmark.type)}
          >
            <div className="flex justify-between items-start">
              <h3 style={{ color: colors.text.primary, fontSize: '1.125rem', fontWeight: '500' }}>
                {bookmark.projectTitle || 'Untitled'}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveBookmark(bookmark._id, contentId);
                }}
                style={{
                  color: colors.text.error,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
              </button>
            </div>
            <p style={{ color: colors.text.muted, fontSize: '0.875rem', marginTop: '0.25rem', maxHeight: '3rem', overflow: 'hidden' }}>
              {bookmark.projectDescription || 'No description available'}
            </p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: colors.text.muted }}>
              Type: {bookmark.type.charAt(0).toUpperCase() + bookmark.type.slice(1)}
            </div>
          </div>
        );
    }
  };

  const typeOptions = ['All', 'project', 'publication', 'blog', 'community'];

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div 
      className="flex h-screen" 
      style={{ background: colors.gradients.background.main }}
    >
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
        
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto p-4"
          style={{ backgroundColor: colors.background.primary }}
        >
          <div className="container mx-auto px-4 py-8">
            <h1 
              style={{
                color: colors.text.primary,
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
              }}
            >
              My Bookmarks
            </h1>

            {/* Stats Overview */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div 
                style={{
                  padding: '1rem',
                  backgroundColor: colors.background.card,
                  borderRadius: '0.5rem',
                  boxShadow: colors.shadow.default,
                }}
              >
                <h3 style={{ color: colors.text.primary, fontWeight: '500' }}>Total Bookmarks</h3>
                <p style={{ color: colors.text.muted, fontSize: '1.5rem' }}>{stats.totalBookmarks}</p>
              </div>
              <div 
                style={{
                  padding: '1rem',
                  backgroundColor: colors.background.card,
                  borderRadius: '0.5rem',
                  boxShadow: colors.shadow.default,
                }}
              >
                <h3 style={{ color: colors.text.primary, fontWeight: '500' }}>Recent (7 days)</h3>
                <p style={{ color: colors.text.muted, fontSize: '1.5rem' }}>{stats.recentBookmarks}</p>
              </div>
              <div 
                style={{
                  padding: '1rem',
                  backgroundColor: colors.background.card,
                  borderRadius: '0.5rem',
                  boxShadow: colors.shadow.default,
                }}
              >
                <h3 style={{ color: colors.text.primary, fontWeight: '500' }}>By Type</h3>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {stats.bookmarksByType.map((item) => (
                    <li key={item._id} style={{ color: colors.text.muted }}>
                      {item._id.charAt(0).toUpperCase() + item._id.slice(1)}: {item.count}
                    </li>
                  ))}
                </ul>
              </div>
              <div 
                style={{
                  padding: '1rem',
                  backgroundColor: colors.background.card,
                  borderRadius: '0.5rem',
                  boxShadow: colors.shadow.default,
                }}
              >
                <h3 style={{ color: colors.text.primary, fontWeight: '500' }}>Popular</h3>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {stats.popularContent.map((item, index) => (
                    <li key={index} style={{ color: colors.text.muted }}>
                      {item.title} ({item.type}): {item.count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Filters and Export */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg 
                    style={{ width: '1rem', height: '1rem', color: colors.icon.muted }}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input 
                  type="search" 
                  style={{
                    padding: '0.625rem',
                    paddingLeft: '2.5rem',
                    width: '100%',
                    fontSize: '0.875rem',
                    backgroundColor: colors.input.background,
                    border: `1px solid ${colors.input.border}`,
                    borderRadius: '0.5rem',
                    color: colors.input.text,
                    outline: 'none',
                  }}
                  placeholder="Search bookmarks..." 
                  value={searchTerm}
                  onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = colors.input.borderFocus}
                  onBlur={(e) => e.target.style.borderColor = colors.input.border}
                />
              </div>
              
              <div className="w-full md:w-48">
                <select 
                  style={{
                    padding: '0.625rem',
                    width: '100%',
                    fontSize: '0.875rem',
                    backgroundColor: colors.input.background,
                    border: `1px solid ${colors.input.border}`,
                    borderRadius: '0.5rem',
                    color: colors.input.text,
                    outline: 'none',
                  }}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = colors.input.borderFocus}
                  onBlur={(e) => e.target.style.borderColor = colors.input.border}
                >
                  {typeOptions.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={() => handleExport('csv')} 
                style={{
                  padding: '0.625rem 1rem',
                  background: colors.button.primary.background,
                  color: colors.button.primary.text,
                  border: `1px solid ${colors.button.primary.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = colors.button.primary.backgroundHover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = colors.button.primary.background;
                }}
              >
                Export CSV
              </button>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div 
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderBottom: `2px solid ${colors.primary.blue[500]}`,
                    borderRadius: '50%',
                  }}
                  className="animate-spin"
                />
              </div>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-10">
                <p style={{ color: colors.text.error, fontSize: '1rem' }}>{error}</p>
                <button 
                  onClick={() => setRefreshTrigger(prev => prev + 1)} 
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: colors.button.secondary.background,
                    color: colors.button.secondary.text,
                    border: `1px solid ${colors.button.secondary.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.button.secondary.backgroundHover;
                    e.target.style.color = colors.button.secondary.textHover;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.button.secondary.background;
                    e.target.style.color = colors.button.secondary.text;
                  }}
                >
                  Try Again
                </button>
              </div>
            )}
            
            {/* No Bookmarks State */}
            {!loading && !error && bookmarks.length === 0 && (
              <div className="text-center py-10">
                <svg 
                  style={{ width: '3rem', height: '3rem', color: colors.icon.muted, margin: '0 auto' }}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                  />
                </svg>
                <h3 
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: colors.text.primary,
                  }}
                >
                  No bookmarks
                </h3>
                <p 
                  style={{
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    color: colors.text.muted,
                  }}
                >
                  You haven't bookmarked any items yet.
                </p>
                <div className="mt-6">
                  <button 
                    onClick={() => navigate('/explore')} 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.5rem 1rem',
                      background: colors.button.primary.background,
                      color: colors.button.primary.text,
                      border: `1px solid ${colors.button.primary.border}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      boxShadow: colors.shadow.default,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = colors.button.primary.backgroundHover;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = colors.button.primary.background;
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = `2px solid ${colors.primary.blue[500]}`;
                      e.target.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = 'none';
                    }}
                  >
                    Explore Projects
                  </button>
                </div>
              </div>
            )}
            
            {/* Bookmarks Grid */}
            {!loading && !error && bookmarks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map(bookmark => renderBookmarkItem(bookmark))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav aria-label="Page navigation">
                  <ul className="inline-flex items-center -space-x-px">
                    <li>
                      <button
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                          padding: '0.5rem 0.75rem',
                          border: `1px solid ${colors.border.primary}`,
                          borderRadius: '0.5rem 0 0 0.5rem',
                          backgroundColor: currentPage === 1 ? colors.button.disabled.background : colors.button.secondary.background,
                          color: currentPage === 1 ? colors.button.disabled.text : colors.button.secondary.text,
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== 1) {
                            e.target.style.backgroundColor = colors.button.secondary.backgroundHover;
                            e.target.style.color = colors.button.secondary.textHover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== 1) {
                            e.target.style.backgroundColor = colors.button.secondary.background;
                            e.target.style.color = colors.button.secondary.text;
                          }
                        }}
                      >
                        &laquo; Prev
                      </button>
                    </li>
                    
                    {[...Array(totalPages).keys()].map((page) => (
                      <li key={page + 1}>
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            border: `1px solid ${colors.border.primary}`,
                            backgroundColor: currentPage === page + 1 ? colors.primary.blue[50] : colors.button.secondary.background,
                            color: currentPage === page + 1 ? colors.primary.blue[600] : colors.button.secondary.text,
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== page + 1) {
                              e.target.style.backgroundColor = colors.button.secondary.backgroundHover;
                              e.target.style.color = colors.button.secondary.textHover;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== page + 1) {
                              e.target.style.backgroundColor = colors.button.secondary.background;
                              e.target.style.color = colors.button.secondary.text;
                            }
                          }}
                        >
                          {page + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li>
                      <button
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '0.5rem 0.75rem',
                          border: `1px solid ${colors.border.primary}`,
                          borderRadius: '0 0.5rem 0.5rem 0',
                          backgroundColor: currentPage === totalPages ? colors.button.disabled.background : colors.button.secondary.background,
                          color: currentPage === totalPages ? colors.button.disabled.text : colors.button.secondary.text,
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== totalPages) {
                            e.target.style.backgroundColor = colors.button.secondary.backgroundHover;
                            e.target.style.color = colors.button.secondary.textHover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== totalPages) {
                            e.target.style.backgroundColor = colors.button.secondary.background;
                            e.target.style.color = colors.button.secondary.text;
                          }
                        }}
                      >
                        Next &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}