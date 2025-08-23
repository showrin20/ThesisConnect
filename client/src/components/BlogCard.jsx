import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Eye, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { colors } from '../styles/colors';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';

const BlogCard = ({ 
  blog,
  _id, 
  title, 
  excerpt, 
  content,
  author, 
  category, 
  tags = [], 
  readTime,
  status,
  createdAt,
  views = 0,
  likes = 0,
  comments = 0,
  featuredImage,
  isBookmarked: initialIsBookmarked = false,
  onBookmarkToggle,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [readMoreHover, setReadMoreHover] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const { user } = useAuth();
  
  // Get actual blog id - it might be in blog._id or directly in _id
  const blogId = blog?._id || _id;
  
  // Check bookmark status on mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!blogId || !user?.token) return;
      
      try {
        const response = await axios.get(`/bookmarks/check/${blogId}`, {
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
  }, [blogId, user?.token, initialIsBookmarked]);
  
  // Handle bookmark toggle
  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();
    if (!user?.token || bookmarkLoading) return;
    
    setBookmarkLoading(true);
    
    try {
      if (isBookmarked) {
        // If already bookmarked, remove the bookmark
        await axios.delete(`/bookmarks/content/${blogId}?type=blog`, {
          headers: { 'x-auth-token': user.token }
        });
      } else {
        // If not bookmarked, add a bookmark
        await axios.post('/bookmarks', {
          projectId: blogId,
          type: 'blog'
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return {
          backgroundColor: `${colors.accent.green[500]}33`,
          color: colors.text.primary,
          borderColor: `${colors.accent.green[500]}4D`
        };
      case 'draft':
        return {
          backgroundColor: `${colors.accent.yellow[500]}33`,
          color: colors.text.primary,
          borderColor: `${colors.accent.yellow[500]}4D`
        };
      case 'archived':
        return {
          backgroundColor: `${colors.text.disabled}33`,
          color: colors.text.disabled,
          borderColor: `${colors.text.disabled}4D`
        };
      default:
        return {
          backgroundColor: `${colors.primary.blue[500]}33`,
          color: colors.text.primary,
          borderColor: `${colors.primary.blue[500]}4D`
        };
    }
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      'Research': colors.primary.purple[400],
      'Technology': colors.primary.blue[400],
      'Academia': colors.accent.green[400],
      'Tutorial': colors.accent.orange[400],
      'Opinion': colors.accent.yellow[400],
      'News': colors.accent.red[400],
      'Review': colors.primary.pink[400],
      'Personal': colors.text.secondary
    };
    return categoryColors[category] || colors.text.secondary;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.3s ease'
      }}
    >
      <div 
        className="absolute inset-0 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${colors.primary.purple[600]}1A, ${colors.primary.blue[600]}1A)`
        }}
      ></div>

      <div 
        className="relative backdrop-blur-lg rounded-xl p-6 border"
        style={{
          backgroundColor: colors.background.glass,
          borderColor: colors.border.secondary
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: `${getCategoryColor(blog?.category || category)}33`,
                  color: getCategoryColor(blog?.category || category)
                }}
              >
                {blog?.category || category}
              </span>
              {(blog?.status || status) && (
                <span 
                  className="px-2 py-1 text-xs font-medium rounded-full border"
                  style={getStatusColor(blog?.status || status)}
                >
                  {(blog?.status || status).charAt(0).toUpperCase() + (blog?.status || status).slice(1)}
                </span>
              )}
              
              {user && (
                <button
                  onClick={handleBookmarkToggle}
                  disabled={bookmarkLoading}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ml-auto"
                  title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                >
                  <Bookmark 
                    size={16} 
                    fill={isBookmarked ? colors.primary.blue[400] : 'none'} 
                    color={isBookmarked ? colors.primary.blue[400] : colors.text.secondary} 
                  />
                </button>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: colors.text.primary }}>
              {blog?.title || title}
            </h3>
            
            <p className="text-sm line-clamp-3 mb-3" style={{ color: colors.text.secondary }}>
              {truncateText(excerpt || content)}
            </p>
          </div>
        </div>

        {/* Featured Image */}
        {featuredImage && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={featuredImage} 
              alt={title}
              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: `${colors.primary.blue[400]}20`,
                  color: colors.primary.blue[400]
                }}
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span
                className="px-2 py-1 text-xs rounded-full"
                style={{
                  backgroundColor: `${colors.text.muted}20`,
                  color: colors.text.muted
                }}
              >
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs" style={{ color: colors.text.muted }}>
          <div className="flex items-center gap-4">
            {author && (
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>{author}</span>
              </div>
            )}
            
            {createdAt && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{formatDate(createdAt)}</span>
              </div>
            )}
            
            {readTime && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{readTime} min read</span>
              </div>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center gap-3">
            {views > 0 && (
              <div className="flex items-center gap-1">
                <Eye size={12} />
                <span>{views}</span>
              </div>
            )}
            
            {likes > 0 && (
              <div className="flex items-center gap-1" style={{ color: colors.accent.red[400] }}>
                <Heart size={12} />
                <span>{likes}</span>
              </div>
            )}
            
            {comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle size={12} />
                <span>{comments}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border.light }}>
          <button
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: readMoreHover ? colors.primary.blue[300] : colors.primary.blue[400] }}
            onClick={(e) => { e.stopPropagation(); navigate(`/blog/${_id}`); }}
            onMouseEnter={() => setReadMoreHover(true)}
            onMouseLeave={() => setReadMoreHover(false)}
          >
            <span>Read More</span>
          </button>
        </div>
        
        {/* Edit and Delete Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: colors.border.secondary }}>
            {onEdit && (
              <button
                onClick={onEdit}
                title="Edit Blog"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: `${colors.accent.yellow[500]}33`,
                  color: colors.text.primary,
                  borderColor: `${colors.accent.yellow[500]}4D`
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.yellow[500]}4D`}
                onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.yellow[500]}33`}
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
                title="Delete Blog"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: `${colors.accent.red[500]}33`,
                  color: colors.text.primary,
                  borderColor: `${colors.accent.red[500]}4D`
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.red[500]}4D`}
                onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.red[500]}33`}
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
    </div>
  );
};

export default BlogCard;
