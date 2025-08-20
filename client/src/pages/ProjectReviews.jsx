import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import axios from '../axios';
import { format } from 'date-fns';
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';
import { Trash2, AlertCircle, RefreshCw, UserCheck, Search, Edit, Star } from 'lucide-react';

const ProjectReviews = () => {
  const { colors } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user ,logout} = useAuth();
  const { showSuccess, showError, showWarning } = useAlert();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [sortType, setSortType] = useState('dateDesc'); // 'dateDesc', 'dateAsc', 'ratingDesc', 'ratingAsc'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);
  const navigate = useNavigate();
  
  // Fetch all projects with reviews
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get projects where user is a mentor
        const response = await axios.get('/projects/my-projects');
        if (response.data.success) {
          // For each project, fetch its reviews
          const projectsWithReviews = await Promise.all(
            response.data.data.map(async (project) => {
              try {
                const reviewsResponse = await axios.get(`/projects/${project._id}/reviews`);
                return {
                  ...project,
                  reviews: reviewsResponse.data.success ? reviewsResponse.data.data : []
                };
              } catch (err) {
                return { ...project, reviews: [] };
              }
            })
          );
          setProjects(projectsWithReviews);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
        showError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [refreshKey]);

  // Reset to first page when search term or sort type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortType]);

  // Apply sorting and filtering to projects
  const filteredProjects = projects
    .filter(project => {
      const searchLower = searchTerm.toLowerCase();
      return (
        project.title?.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower) ||
        project.creator?.name?.toLowerCase().includes(searchLower) ||
        // Also search in reviews
        project.reviews?.some(review => 
          review.comment?.toLowerCase().includes(searchLower) || 
          review.reviewer?.name?.toLowerCase().includes(searchLower)
        )
      );
    })
    .map(project => {
      // Create a new object with sorted reviews
      const sortedReviews = [...project.reviews];
      
      switch (sortType) {
        case 'dateDesc':
          sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'dateAsc':
          sortedReviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'ratingDesc':
          sortedReviews.sort((a, b) => b.rating - a.rating);
          break;
        case 'ratingAsc':
          sortedReviews.sort((a, b) => a.rating - b.rating);
          break;
        default:
          // Default to newest first
          sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      return {
        ...project,
        reviews: sortedReviews
      };
    });

  // Add a new review to a project
  const handleAddReview = async (projectId) => {
    if (!reviewText.trim()) {
      showWarning('Review text cannot be empty');
      return;
    }

    if (reviewText.trim().length < 10) {
      showWarning('Please write a more detailed review (at least 10 characters)');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/projects/${projectId}/reviews`, {
        comment: reviewText,
        rating: reviewRating
      });

      if (response.data.success) {
        showSuccess('Review added successfully');
        setReviewText('');
        setReviewRating(5);
        setRefreshKey(oldKey => oldKey + 1);
      }
    } catch (err) {
      console.error('Error adding review:', err);
      showError(err.response?.data?.msg || 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  // Delete a review
  const handleDeleteReview = async (projectId, reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await axios.delete(`/projects/${projectId}/reviews/${reviewId}`);
      if (response.data.success) {
        showSuccess('Review deleted successfully');
        setRefreshKey(oldKey => oldKey + 1);
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      showError(err.response?.data?.msg || 'Failed to delete review');
    }
  };

  // Start editing a review
  const startEditingReview = (project, review) => {
    setEditingReview({ projectId: project._id, review });
    setReviewText(review.comment);
    setReviewRating(review.rating);
  };

  // Update a review
  const handleUpdateReview = async () => {
    if (!editingReview || !reviewText.trim()) {
      showWarning('Review text cannot be empty');
      return;
    }

    if (reviewText.trim().length < 10) {
      showWarning('Please write a more detailed review (at least 10 characters)');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(`/projects/${editingReview.projectId}/reviews/${editingReview.review._id}`, {
        comment: reviewText,
        rating: reviewRating
      });

      if (response.data.success) {
        showSuccess('Review updated successfully');
        setEditingReview(null);
        setReviewText('');
        setReviewRating(5);
        setRefreshKey(oldKey => oldKey + 1);
      }
    } catch (err) {
      console.error('Error updating review:', err);
      showError(err.response?.data?.msg || 'Failed to update review');
    } finally {
      setLoading(false);
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

       
{/* all project reviews get,update,delete */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="container mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold" style={{ color: colors.text.primary }}>Project Reviews</h1>
              <div className="mt-4 flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded-md w-full"
                    style={{
                      backgroundColor: colors.background.input,
                      borderColor: colors.border.primary,
                      color: colors.text.primary
                    }}
                  />
                </div>
                <div className="flex space-x-2">
                  <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                    style={{
                      backgroundColor: colors.background.input,
                      borderColor: colors.border.primary,
                      color: colors.text.primary
                    }}
                  >
                    <option value="dateDesc">Latest Reviews First</option>
                    <option value="dateAsc">Oldest Reviews First</option>
                    <option value="ratingDesc">Highest Rating First</option>
                    <option value="ratingAsc">Lowest Rating First</option>
                  </select>
                  <button
                    onClick={() => setRefreshKey(oldKey => oldKey + 1)}
                    className="px-4 py-2 rounded-md flex items-center space-x-2"
                    style={{
                      backgroundColor: colors.primary.blue[500],
                      color: colors.text.inverse
                    }}
                  >
                    <RefreshCw size={16} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Stats Summary */}
            {!loading && !error && filteredProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="p-4 rounded-lg shadow-sm" style={{ backgroundColor: colors.background.card }}>
                  <h3 className="text-sm font-medium" style={{ color: colors.text.secondary }}>Total Projects</h3>
                  <p className="text-2xl font-bold" style={{ color: colors.primary.purple[500] }}>{projects.length}</p>
                </div>
                <div className="p-4 rounded-lg shadow-sm" style={{ backgroundColor: colors.background.card }}>
                  <h3 className="text-sm font-medium" style={{ color: colors.text.secondary }}>Total Reviews</h3>
                  <p className="text-2xl font-bold" style={{ color: colors.primary.blue[500] }}>
                    {projects.reduce((sum, project) => sum + (project.reviews?.length || 0), 0)}
                  </p>
                </div>
                <div className="p-4 rounded-lg shadow-sm" style={{ backgroundColor: colors.background.card }}>
                  <h3 className="text-sm font-medium" style={{ color: colors.text.secondary }}>Average Rating</h3>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold mr-2" style={{ color: colors.accent.yellow[500] }}>
                      {(() => {
                        const allRatings = projects.flatMap(p => p.reviews.map(r => r.rating)).filter(Boolean);
                        if (allRatings.length === 0) return '-';
                        const avg = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
                        return avg.toFixed(1);
                      })()}
                    </p>
                    <Star size={20} fill={colors.accent.yellow[400]} stroke={colors.accent.yellow[400]} />
                  </div>
                </div>
              </div>
            )}
   
            {loading && (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
                <div className="flex">
                  <div className="py-1">
                    <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
                  </div>
                  <div>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && filteredProjects.length === 0 && (
              <div className="mt-6 text-center p-8 border border-dashed rounded-lg" style={{ borderColor: colors.border.secondary }}>
                <p className="text-gray-600">No projects with reviews found.</p>
                {user?.role === 'mentor' && (
                  <p className="mt-2 text-sm text-gray-500">
                    As a mentor, you can add reviews to student projects.
                  </p>
                )}
              </div>
            )}

            {!loading && 
              filteredProjects
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(project => (
              <div 
                key={project._id} 
                className="mb-6 p-5 rounded-lg shadow-sm" 
                style={{ backgroundColor: colors.background.card, borderColor: colors.border.primary }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>{project.title}</h2>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>
                      Created by: {project.creator?.name || "Unknown"}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs" style={{ 
                    backgroundColor: project.status === 'Completed' 
                      ? `${colors.primary.blue[500]}33` 
                      : `${colors.accent.yellow[500]}33`,
                    color: project.status === 'Completed' 
                      ? colors.primary.blue[500]
                      : colors.accent.yellow[500]
                  }}>
                    {project.status}
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm line-clamp-2" style={{ color: colors.text.secondary }}>
                    {project.description}
                  </p>
                </div>

                {/* Reviews Section */}
                <div className="border-t pt-3 mt-3" style={{ borderColor: colors.border.secondary }}>
                  <h3 className="font-semibold mb-3" style={{ color: colors.text.primary }}>Reviews</h3>
                  
                  {project.reviews && project.reviews.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <div className="text-xs px-2 py-1 rounded-full" style={{ 
                          backgroundColor: colors.background.tertiary,
                          color: colors.text.secondary 
                        }}>
                          {project.reviews.length} {project.reviews.length === 1 ? 'Review' : 'Reviews'}
                        </div>
                        
                        <div className="text-xs px-2 py-1 rounded-full flex items-center" style={{ 
                          backgroundColor: colors.background.tertiary,
                          color: colors.accent.yellow[500] 
                        }}>
                          <Star size={12} className="mr-1" fill={colors.accent.yellow[400]} />
                          {(() => {
                            const ratings = project.reviews.map(r => r.rating).filter(Boolean);
                            if (!ratings.length) return '-';
                            return (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
                          })()}
                        </div>
                      </div>
                      
                      {project.reviews.map(review => (
                        <div 
                          key={review._id} 
                          className="p-4 rounded-lg border" 
                          style={{ 
                            backgroundColor: colors.background.tertiary,
                            borderColor: colors.border.secondary 
                          }}
                        >
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                              style={{ backgroundColor: colors.primary.purple[500] }}>
                              <span className="text-xs text-white">
                                {review.reviewer?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium" style={{ color: colors.text.primary }}>
                                {review.reviewer?.name || 'Unknown reviewer'}
                              </div>
                              <div className="text-xs" style={{ color: colors.text.muted }}>
                                {format(new Date(review.createdAt), 'MMM d, yyyy')}
                              </div>
                            </div>
                            
                            <div className="ml-auto flex items-center">
                              <div className="flex mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    size={16}
                                    fill={i < review.rating ? colors.accent.yellow[400] : 'none'}
                                    stroke={colors.accent.yellow[400]}
                                    className="mr-1"
                                  />
                                ))}
                              </div>
                              
                              {/* Only show edit/delete if current user is the reviewer */}
                              {user?.id === review.reviewer?._id && (
                                <div className="flex space-x-2 ml-2">
                                  <button 
                                    onClick={() => startEditingReview(project, review)}
                                    className="p-1 rounded hover:bg-gray-200"
                                    style={{ color: colors.primary.blue[500] }}
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteReview(project._id, review._id)}
                                    className="p-1 rounded hover:bg-gray-200"
                                    style={{ color: colors.accent.red[500] }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-2 p-3 rounded" style={{ 
                            backgroundColor: colors.background.secondary,
                            color: colors.text.primary
                          }}>
                            <p className="text-sm whitespace-pre-line">{review.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic" style={{ color: colors.text.muted }}>No reviews yet</p>
                  )}
                  
                  {/* Add Review Section (Only for mentors) */}
                  {user?.role === 'mentor' && (
                    <div className="mt-6 bg-white p-4 rounded-lg border shadow-sm" 
                      style={{ 
                        backgroundColor: editingReview && editingReview.projectId === project._id 
                          ? colors.background.secondary
                          : colors.background.card,
                        borderColor: colors.border.primary 
                      }}
                    >
                      <h4 className="text-base font-medium mb-3 flex items-center" style={{ color: colors.text.primary }}>
                        {editingReview && editingReview.projectId === project._id 
                          ? <Edit size={18} className="mr-2" style={{ color: colors.primary.blue[500] }} />
                          : <Star size={18} className="mr-2" style={{ color: colors.accent.yellow[500] }} />}
                        {editingReview && editingReview.projectId === project._id 
                          ? "Edit Your Review" 
                          : "Add Your Review"}
                      </h4>
                      
                      <div className="mb-4">
                        <label className="block text-sm mb-2" style={{ color: colors.text.secondary }}>
                          Rating
                        </label>
                        <div className="flex bg-gray-50 p-2 rounded-md">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none mr-1 p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Star 
                                size={24} 
                                fill={star <= reviewRating ? colors.accent.yellow[400] : 'none'} 
                                stroke={colors.accent.yellow[400]}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm mb-2" style={{ color: colors.text.secondary }}>
                          Your Review
                        </label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Write your detailed review about this project..."
                          className="w-full p-3 rounded-md border mb-2"
                          style={{
                            backgroundColor: colors.background.input,
                            borderColor: colors.border.primary,
                            color: colors.text.primary
                          }}
                          rows="4"
                        />
                        <p className="text-xs" style={{ color: colors.text.muted }}>
                          {reviewText.length === 0 ? 'Please write a review' : 
                            reviewText.length < 10 ? 'Please write a more detailed review' : 
                            'Your review looks good!'}
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        {editingReview && editingReview.projectId === project._id && (
                          <button
                            onClick={() => {
                              setEditingReview(null);
                              setReviewText('');
                              setReviewRating(5);
                            }}
                            className="px-4 py-2 text-sm rounded-md border"
                            style={{
                              backgroundColor: 'transparent',
                              borderColor: colors.border.primary,
                              color: colors.text.secondary
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            if (editingReview && editingReview.projectId === project._id) {
                              handleUpdateReview();
                            } else {
                              handleAddReview(project._id);
                            }
                          }}
                          disabled={reviewText.length < 10}
                          className="px-4 py-2 text-sm rounded-md flex items-center"
                          style={{
                            backgroundColor: reviewText.length < 10 ? colors.background.disabled : colors.primary.purple[500],
                            color: colors.text.inverse,
                            opacity: reviewText.length < 10 ? 0.7 : 1
                          }}
                        >
                          {editingReview && editingReview.projectId === project._id 
                            ? <>Update Review</>
                            : <>Add Review</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Pagination controls */}
            {!loading && filteredProjects.length > 0 && (
              <div className="mt-8 flex flex-col items-center space-y-2">
                <div className="text-sm" style={{ color: colors.text.secondary }}>
                  Page {currentPage} of {Math.ceil(filteredProjects.length / itemsPerPage)} • 
                  Showing {Math.min(itemsPerPage, filteredProjects.length - (currentPage - 1) * itemsPerPage)} of {filteredProjects.length} projects
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md border flex items-center transition-all"
                    style={{
                      backgroundColor: currentPage === 1 ? colors.background.disabled : colors.background.card,
                      borderColor: colors.border.primary,
                      color: currentPage === 1 ? colors.text.muted : colors.text.primary,
                      opacity: currentPage === 1 ? 0.7 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                    aria-label="Go to previous page"
                    tabIndex={currentPage === 1 ? -1 : 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {(() => {
                      const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
                      const pageNumbers = [];
                      
                      // Always show first page
                      if (totalPages > 0) {
                        pageNumbers.push(1);
                      }
                      
                      // Calculate range of pages to show around current page
                      let startPage = Math.max(2, currentPage - 1);
                      let endPage = Math.min(totalPages - 1, currentPage + 1);
                      
                      // Add ellipsis after first page if needed
                      if (startPage > 2) {
                        pageNumbers.push('...');
                      }
                      
                      // Add pages in the calculated range
                      for (let i = startPage; i <= endPage; i++) {
                        pageNumbers.push(i);
                      }
                      
                      // Add ellipsis before last page if needed
                      if (endPage < totalPages - 1 && totalPages > 1) {
                        pageNumbers.push('...');
                      }
                      
                      // Always show last page if there is more than one page
                      if (totalPages > 1) {
                        pageNumbers.push(totalPages);
                      }
                      
                      return pageNumbers.map((page, index) => {
                        if (page === '...') {
                          return (
                            <span 
                              key={`ellipsis-${index}`}
                              className="w-8 h-8 flex items-center justify-center"
                              style={{ color: colors.text.muted }}
                            >
                              ...
                            </span>
                          );
                        }
                        
                        return (
                          <button
                            key={`page-${page}`}
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 flex items-center justify-center rounded-md"
                            style={{
                              backgroundColor: currentPage === page ? colors.primary.purple[500] : colors.background.card,
                              color: currentPage === page ? colors.text.inverse : colors.text.primary,
                              border: currentPage === page ? 'none' : `1px solid ${colors.border.primary}`
                            }}
                          >
                            {page}
                          </button>
                        );
                      });
                    })()}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProjects.length / itemsPerPage)))}
                    onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProjects.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredProjects.length / itemsPerPage)}
                    className="px-4 py-2 rounded-md border flex items-center transition-all"
                    style={{
                      backgroundColor: currentPage === Math.ceil(filteredProjects.length / itemsPerPage) 
                        ? colors.background.disabled : colors.background.card,
                      borderColor: colors.border.primary,
                      color: currentPage === Math.ceil(filteredProjects.length / itemsPerPage) 
                        ? colors.text.muted : colors.text.primary,
                      opacity: currentPage === Math.ceil(filteredProjects.length / itemsPerPage) ? 0.7 : 1,
                      cursor: currentPage === Math.ceil(filteredProjects.length / itemsPerPage) ? 'not-allowed' : 'pointer'
                    }}
                    aria-label="Go to next page"
                    tabIndex={currentPage === Math.ceil(filteredProjects.length / itemsPerPage) ? -1 : 0}
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>





      </div>
    </div>
  );
};

export default ProjectReviews;
