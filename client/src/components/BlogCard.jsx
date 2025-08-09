import React from 'react';
import { Calendar, Clock, User, Eye, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { colors } from '../styles/colors';








const BlogCard = ({ 
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
  featuredImage
}) => {
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
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: `${getCategoryColor(category)}33`,
                  color: getCategoryColor(category)
                }}
              >
                {category}
              </span>
              {status && (
                <span 
                  className="px-2 py-1 text-xs font-medium rounded-full border"
                  style={getStatusColor(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: colors.text.primary }}>
              {title}
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
            className="flex items-center gap-2 text-sm font-medium transition-colors group"
            style={{ color: colors.primary.blue[400] }}
            onMouseEnter={(e) => e.target.style.color = colors.primary.blue[300]}
            onMouseLeave={(e) => e.target.style.color = colors.primary.blue[400]}
          >
            <span>Read More</span>
            <ExternalLink size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
