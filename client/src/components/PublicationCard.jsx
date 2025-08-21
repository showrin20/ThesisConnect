import React, { useState, useEffect } from 'react';
import { ExternalLink, Bookmark } from 'lucide-react';
import { colors } from '../styles/colors';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';

const PublicationCard = ({
  publication,
  title,
  authors,
  year,
  venue,
  tags,
  doi,
  abstract,
  isBookmarked: initialIsBookmarked = false,
  onBookmarkToggle,
  onEdit,
  onDelete
}) => {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const { user } = useAuth();
  
  // Get actual publication id
  const publicationId = publication?._id;
  
  // Format authors nicely if array, else string
  const formattedAuthors = Array.isArray(publication?.authors || authors)
    ? (publication?.authors || authors).join(', ')
    : (publication?.authors || authors);

  // Shorten abstract to ~100 chars for preview
  const shortAbstract =
    (publication?.abstract || abstract) && (publication?.abstract || abstract).length > 100
      ? (publication?.abstract || abstract).slice(0, 100) + '...'
      : (publication?.abstract || abstract);

  // Build DOI/Link url if available
  const trimmedDoi = (publication?.doi || doi)?.trim();
  const publicationLink = trimmedDoi
    ? trimmedDoi.startsWith('http')
      ? trimmedDoi
      : `https://doi.org/${trimmedDoi}`
    : null;
    
  // Check bookmark status on mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!publicationId || !user?.token) return;
      
      try {
        const response = await axios.get(`/api/bookmarks/check/${publicationId}`, {
          headers: { 'x-auth-token': user.token }
        });
        
        if (response.data.success) {
          setIsBookmarked(response.data.bookmarked);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };
    
    if (!initialIsBookmarked && publicationId) {
      checkBookmarkStatus();
    }
  }, [publicationId, user?.token, initialIsBookmarked]);
  
  // Handle bookmark toggle
  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();
    if (!user?.token || bookmarkLoading || !publicationId) return;
    
    setBookmarkLoading(true);
    
    try {
      if (isBookmarked) {
        // If already bookmarked, remove the bookmark
        await axios.delete(`/api/bookmarks/content/${publicationId}?type=publication`, {
          headers: { 'x-auth-token': user.token }
        });
      } else {
        // If not bookmarked, add a bookmark
        await axios.post('/api/bookmarks', {
          projectId: publicationId,
          type: 'publication'
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
        className="relative backdrop-blur-lg rounded-xl p-6 border hover:scale-[1.02] transition-all duration-300 overflow-hidden"
        style={{
          backgroundColor: colors.background.glass,
          borderColor: colors.border.secondary
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.background.glass}CC`}
        onMouseLeave={(e) => e.target.style.backgroundColor = colors.background.glass}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 
            className="font-semibold text-lg transition-colors duration-300"
            style={{ 
              color: colors.text.primary,
              overflowWrap: 'anywhere'
            }}
            onMouseEnter={(e) => e.target.style.color = colors.primary.blue[400]}
            onMouseLeave={(e) => e.target.style.color = colors.text.primary}
          >
            {publication?.title || title}
          </h3>
          
          {user && publicationId && (
            <button
              onClick={handleBookmarkToggle}
              disabled={bookmarkLoading}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ml-2"
              title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
            >
              <Bookmark 
                size={18} 
                fill={isBookmarked ? colors.primary.blue[400] : 'none'} 
                color={isBookmarked ? colors.primary.blue[400] : colors.text.secondary} 
              />
            </button>
          )}
        </div>
        <div 
          className="text-xs mb-2 italic" 
          style={{ 
            color: `${colors.text.secondary}99`,
            overflowWrap: 'anywhere'
          }}
        >
          {formattedAuthors} {year ? `| ${year}` : ''}
        </div>
        <div 
          className="text-xs mb-3" 
          style={{ 
            color: `${colors.text.secondary}80`,
            overflowWrap: 'anywhere'
          }}
        >
          {venue || 'Unknown Venue'}
        </div>
        {shortAbstract && (
          <p 
            className="text-sm mb-4 line-clamp-3" 
            style={{ 
              color: `${colors.text.secondary}B3`,
              overflowWrap: 'anywhere'
            }}
          >
            {shortAbstract}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {(publication?.tags || tags)?.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 rounded-md text-xs font-medium border"
              style={{
                backgroundColor: `${colors.accent.green[500]}33`,
                color: colors.text.primary,
                borderColor: `${colors.accent.green[500]}4D`,
                overflowWrap: 'anywhere'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-end mb-4">
          {publicationLink ? (
            <a
              href={publicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 border rounded-lg transition-all duration-200 text-xs font-medium"
              style={{
                backgroundColor: `${colors.accent.green[500]}33`,
                color: colors.text.primary,
                borderColor: `${colors.accent.green[500]}4D`
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.green[500]}4D`}
              onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.green[500]}33`}
            >
              <span>View Publication</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <span 
              className="text-xs italic" 
              style={{ 
                color: colors.text.disabled,
                overflowWrap: 'anywhere'
              }}
            >
              No link available
            </span>
          )}
        </div>
        
        {/* Edit and Delete Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-4 border-t" style={{ borderColor: colors.border.secondary }}>
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: `${colors.accent.green[500]}33`,
                  color: colors.text.primary,
                  border: `1px solid ${colors.accent.green[500]}4D`
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.green[500]}4D`}
                onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.green[500]}33`}
              >
                Edit Publication
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: `${colors.accent.red[500]}33`,
                  color: colors.text.primary,
                  border: `1px solid ${colors.accent.red[500]}4D`
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.accent.red[500]}4D`}
                onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.accent.red[500]}33`}
              >
                Delete Publication
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicationCard;