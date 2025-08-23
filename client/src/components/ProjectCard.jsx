import React, { useState, useEffect } from 'react';
import { ExternalLink, MessageCircle, ChevronDown, ChevronUp, Star, Trash2, Bookmark, BookmarkX } from 'lucide-react';
import { colors } from '../styles/colors';
import axios from '../axios';
import { formatDistanceToNow } from 'date-fns';
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../context/AuthContext';

const ProjectCard = ({ 
  project,
  _id,
  title, 
  description, 
  link, 
  tags, 
  status, 
  category, 
  creator, 
  collaborators, 
  currentUserId, 
  userRole,
  reviews = [],
  isBookmarked: initialIsBookmarked = false,
  onBookmarkToggle,
  onEdit, 
  onDelete,
  onReviewAdded,
  onReviewDeleted
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    reviewId: null,
  });
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const { user } = useAuth();
  
  // Get actual project id - it might be in project._id or directly in _id
  const projectId = project?._id || _id;
  
  // Check bookmark status on mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!projectId || !user?.token) return;
      
      try {
        const response = await axios.get(`/bookmarks/check/${projectId}`, {
          headers: { 'x-auth-token': user.token }
        });
        
        if (response.data.success) {
          setIsBookmarked(response.data.bookmarked);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };
    
    if (!initialIsBookmarked) {
      checkBookmarkStatus();
    }
  }, [projectId, user?.token, initialIsBookmarked]);

  // Sort reviews by date, newest first
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  const latestReview = sortedReviews.length > 0 ? sortedReviews[0] : null;
  const olderReviews = sortedReviews.slice(1);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return {
          backgroundColor: `${colors.accent.green[500]}33`,
          color: colors.accent.green[400],
          borderColor: `${colors.accent.green[500]}4D`
        };
      case 'Review':
        return {
          backgroundColor: `${colors.accent.yellow[500]}33`,
          color: colors.accent.yellow[400],
          borderColor: `${colors.accent.yellow[500]}4D`
        };
      case 'Completed':
        return {
          backgroundColor: `${colors.primary.blue[500]}33`,
          color: colors.primary.blue[400],
          borderColor: `${colors.primary.blue[500]}4D`
        };
      default:
        return {
          backgroundColor: `${colors.text.disabled}33`,
          color: colors.text.disabled,
          borderColor: `${colors.text.disabled}4D`
        };
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    
    setIsSubmittingReview(true);
    try {
      const response = await axios.post(`/projects/${_id}/reviews`, {
        comment: reviewComment,
        rating: reviewRating
      });
      
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
      
      if (onReviewAdded) {
        onReviewAdded(response.data.data);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  const openDeleteConfirmModal = (reviewId) => {
    setConfirmModal({
      isOpen: true,
      reviewId: reviewId,
    });
  };
  
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      reviewId: null,
    });
  };
  
  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await axios.delete(`/projects/${_id}/reviews/${reviewId}`);
      
      if (response.data.success && onReviewDeleted) {
        onReviewDeleted(response.data.data);
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < rating ? colors.accent.yellow[400] : 'transparent'} 
        stroke={colors.accent.yellow[400]}
      />
    ));
  };

  const trimmedLink = link?.trim();

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!user?.token || bookmarkLoading) return;
    
    setBookmarkLoading(true);
    
    try {
      if (isBookmarked) {
        // If already bookmarked, remove the bookmark
        await axios.delete(`/bookmarks/content/${projectId}?type=project`, {
          headers: { 'x-auth-token': user.token }
        });
      } else {
        // If not bookmarked, add a bookmark
        await axios.post('/bookmarks', {
          projectId: projectId,
          type: 'project'  // You can adjust this based on the content type
        }, {
          headers: { 'x-auth-token': user.token }
        });
      }
      
      // Toggle bookmark state
      setIsBookmarked(!isBookmarked);
      
      // Call parent callback if provided
      if (onBookmarkToggle) {
        onBookmarkToggle();
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <div className="relative group">
      <div 
        className="absolute inset-0 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${colors.primary.purple[600]}1A, ${colors.primary.blue[600]}1A)`
        }}
      ></div>
      <div 
        className="relative backdrop-blur-lg rounded-xl p-6 border hover:scale-[1.02] transition-all duration-300"
        style={{
          backgroundColor: colors.background.glass,
          borderColor: colors.border.secondary
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.background.glass}CC`}
        onMouseLeave={(e) => e.target.style.backgroundColor = colors.background.glass}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-2">
            <h3 
              className="font-semibold text-lg transition-colors duration-300"
              style={{ 
                color: colors.text.primary,
                overflowWrap: 'anywhere' // Ensure long titles wrap
              }}
              onMouseEnter={(e) => e.target.style.color = colors.primary.blue[400]}
              onMouseLeave={(e) => e.target.style.color = colors.text.primary}
            >
              {project?.title || title}
            </h3>
            {user && (
              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
              >
                {isBookmarked ? (
                  <Bookmark size={18} fill={colors.primary.blue[400]} color={colors.primary.blue[400]} />
                ) : (
                  <Bookmark size={18} color={colors.text.secondary} />
                )}
              </button>
            )}
          </div>
          <span 
            className="px-3 py-1 rounded-full text-xs font-medium border"
            style={getStatusColor(project?.status || status)}
          >
            {project?.status || status}
          </span>
        </div>
        
        <p className="text-sm mb-4 line-clamp-2" style={{ color: `${colors.text.secondary}B3` }}>
          {project?.description || description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {(project?.tags || tags)?.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 rounded-md text-xs font-medium border"
              style={{
                backgroundColor: `${colors.primary.blue[500]}33`,
                color: colors.text.primary,
                borderColor: `${colors.primary.blue[500]}4D`
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Reviews Section */}
        {latestReview && (
          <div className="mt-4 mb-4 p-3 rounded-lg border" style={{ borderColor: colors.border.secondary, backgroundColor: `${colors.background.card}80` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: colors.text.primary }}>
                  Latest Review
                </span>
                <div className="flex items-center">
                  {renderStars(latestReview.rating)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: colors.text.muted }}>
                  {formatDistanceToNow(new Date(latestReview.createdAt), { addSuffix: true })}
                </span>
                {(userRole === 'admin' || latestReview.reviewer?._id === currentUserId) && (
                  <button
                    onClick={() => openDeleteConfirmModal(latestReview._id)}
                    className="p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                    title="Delete review"
                    style={{ color: colors.accent.red[500] }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs" style={{ color: colors.text.secondary }}>
              {latestReview.comment}
            </p>
            <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
              By: {latestReview.reviewer?.name || 'A mentor'}
            </p>
            
            {olderReviews.length > 0 && (
              <div className="mt-2 pt-2 border-t" style={{ borderColor: colors.border.secondary }}>
                <button 
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: colors.primary.blue[400] }}
                >
                  {showAllReviews ? (
                    <>Hide {olderReviews.length} older reviews <ChevronUp size={14} /></>
                  ) : (
                    <>Show {olderReviews.length} older reviews <ChevronDown size={14} /></>
                  )}
                </button>
                
                {showAllReviews && (
                  <div className="mt-2 space-y-3 max-h-40 overflow-y-auto scrollbar-thin">
                    {olderReviews.map((review, index) => (
                      <div key={index} className="p-2 rounded" style={{ backgroundColor: colors.background.subtle }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: colors.text.muted }}>
                              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                            </span>
                            {(userRole === 'admin' || review.reviewer?._id === currentUserId) && (
                              <button
                                onClick={() => openDeleteConfirmModal(review._id)}
                                className="p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
                                title="Delete review"
                                style={{ color: colors.accent.red[500] }}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: colors.text.secondary }}>
                          {review.comment}
                        </p>
                        <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
                          By: {review.reviewer?.name || 'A mentor'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-xs" style={{ color: `${colors.text.secondary}80` }}>
            Category: {category || 'Research'}
          </div>
          {trimmedLink ? (
            <a
              href={trimmedLink.startsWith('http') ? trimmedLink : `https://${trimmedLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 border rounded-lg transition-all duration-200 text-xs font-medium"
              style={{
                backgroundColor: `${colors.primary.blue[500]}33`,
                color: colors.text.primary,
                borderColor: `${colors.primary.blue[500]}4D`
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.primary.blue[500]}4D`}
              onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.primary.blue[500]}33`}
            >
              <span>View Project</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: colors.text.disabled }}>No project link available</span>
          )}
        </div>

        {/* Review Form for Mentors */}
        {userRole === 'mentor' && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border.secondary }}>
            {showReviewForm ? (
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.text.secondary }}>
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star 
                          size={18} 
                          fill={star <= reviewRating ? colors.accent.yellow[400] : 'transparent'} 
                          stroke={colors.accent.yellow[400]}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.text.secondary }}>
                    Review Comment
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full p-2 rounded-lg text-sm border"
                    style={{
                      backgroundColor: colors.background.input,
                      color: colors.text.primary,
                      borderColor: colors.border.primary,
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-3 py-1 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: 'transparent',
                      color: colors.text.secondary,
                      border: `1px solid ${colors.border.secondary}`
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{
                      backgroundColor: colors.primary.purple[500],
                      color: colors.text.inverse,
                      opacity: isSubmittingReview ? 0.7 : 1
                    }}
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg w-full justify-center text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: `${colors.primary.purple[500]}33`,
                  color: colors.text.primary,
                  borderColor: `${colors.primary.purple[500]}4D`
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.primary.purple[500]}4D`}
                onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.primary.purple[500]}33`}
              >
                <MessageCircle size={14} />
                <span>Add Review</span>
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: colors.border.secondary }}>
            {onEdit && (
              <button
                onClick={onEdit}
                title="Edit Project"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: colors.status.warning.background,
                  color: colors.text.primary,
                  borderColor: colors.status.warning.border
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = colors.status.warning.backgroundHover || colors.status.warning.background}
                onMouseLeave={(e) => e.target.style.backgroundColor = colors.status.warning.background}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={onDelete}
                title={creator === currentUserId ? "Delete Project" : "You can't delete this project because you are a collaborator, not the owner."}
                disabled={creator !== currentUserId}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  creator === currentUserId ? '' : 'cursor-not-allowed opacity-50'
                }`}
                style={{
                  backgroundColor: creator === currentUserId ? colors.status.error.background : colors.text.disabled,
                  color: colors.text.primary,
                  borderColor: creator === currentUserId ? colors.status.error.border : colors.text.disabled
                }}
                onMouseEnter={(e) => {
                  if (creator === currentUserId) {
                    e.target.style.backgroundColor = colors.status.error.backgroundHover || colors.status.error.background;
                  }
                }}
                onMouseLeave={(e) => {
                  if (creator === currentUserId) {
                    e.target.style.backgroundColor = colors.status.error.background;
                  }
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Confirmation Modal for Review Deletion */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={() => {
          if (confirmModal.reviewId) {
            handleDeleteReview(confirmModal.reviewId);
          }
          closeConfirmModal();
        }}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        colors={colors}
      />
    </div>
  );
};

export default ProjectCard;