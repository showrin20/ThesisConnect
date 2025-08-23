import React, { useState, useEffect } from 'react';
import { ExternalLink, Bookmark } from 'lucide-react';
import { colors } from '../styles/colors';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';

const CommunityPostCard = ({ 
  post,
  postId, 
  type, 
  content, 
  title, 
  skillsNeeded, 
  status, 
  createdAt, 
  tags, 
  author, 
  projectId,
  isBookmarked: initialIsBookmarked = false,
  onBookmarkToggle,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  
  // Get actual post id
  const communityPostId = post?._id || postId;
  
  // Check bookmark status on mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!communityPostId || !user?.token) return;
      
      try {
        const response = await axios.get(`/bookmarks/check/${communityPostId}`, {
          headers: { 'x-auth-token': user.token }
        });
        
        if (response.data.success) {
          setIsBookmarked(response.data.bookmarked);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };
    
    if (!initialIsBookmarked && communityPostId) {
      checkBookmarkStatus();
    }
  }, [communityPostId, user?.token, initialIsBookmarked]);
  
  // Handle bookmark toggle
  const handleBookmarkToggle = async (e) => {
    e.stopPropagation();
    if (!user?.token || bookmarkLoading || !communityPostId) return;
    
    setBookmarkLoading(true);
    
    try {
      if (isBookmarked) {
        // If already bookmarked, remove the bookmark
        await axios.delete(`/bookmarks/content/${communityPostId}?type=community`, {
          headers: { 'x-auth-token': user.token }
        });
      } else {
        // If not bookmarked, add a bookmark
        await axios.post('/bookmarks', {
          projectId: communityPostId,
          type: 'community'
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
    if (!status) return {};
    switch (status.toLowerCase()) {
      case 'open':
        return {
          backgroundColor: `${colors.accent.green[500]}33`,
          color: colors.accent.green[400],
          borderColor: `${colors.accent.green[500]}4D`,
        };
      case 'in-progress':
        return {
          backgroundColor: `${colors.accent.yellow[500]}33`,
          color: colors.accent.yellow[400],
          borderColor: `${colors.accent.yellow[500]}4D`,
        };
      case 'closed':
        return {
          backgroundColor: `${colors.primary.blue[500]}33`,
          color: colors.primary.blue[400],
          borderColor: `${colors.primary.blue[500]}4D`,
        };
      default:
        return {
          backgroundColor: `${colors.text.disabled}33`,
          color: colors.text.disabled,
          borderColor: `${colors.text.disabled}4D`,
        };
    }
  };

  const truncateText = (text, maxLength = 50) =>
    text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

  return (
    <div className="relative group">
      <div
        className="absolute inset-0 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${colors.primary.purple[600]}1A, ${colors.primary.blue[600]}1A)`,
        }}
      ></div>

      <div
        className="relative backdrop-blur-lg rounded-xl p-6 border hover:scale-[1.02] transition-all duration-300"
        style={{ backgroundColor: colors.background.glass, borderColor: colors.border.secondary }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3
                className="font-semibold text-lg transition-colors duration-300 hover:text-blue-400"
                style={{ color: colors.text.primary }}
              >
                {(post?.type || type) === 'collab' ? (post?.title || title) : truncateText(post?.content || content)}
              </h3>
              {(post?.projectId || projectId) && (
                <span
                  className="text-xs px-2 py-1 rounded-full border"
                  style={{
                    backgroundColor: `${colors.primary.purple[500]}33`,
                    borderColor: `${colors.primary.purple[500]}4D`,
                    color: colors.text.primary,
                  }}
                  title="Linked to project"
                >
                  📎
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

            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 rounded-md text-xs font-medium border"
                style={{
                  backgroundColor: type === 'collab' ? `${colors.primary.purple[500]}33` : `${colors.accent.green[500]}33`,
                  color: type === 'collab' ? colors.primary.purple[400] : colors.text.primary,
                  borderColor: type === 'collab' ? `${colors.primary.purple[500]}4D` : `${colors.accent.green[500]}4D`,
                }}
              >
                {type === 'collab' ? 'Collaboration' : 'General'}
              </span>

              {type === 'collab' && status && (
                <span className="px-3 py-1 rounded-full text-xs font-medium border" style={getStatusColor(status)}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm mb-4 line-clamp-2" style={{ color: `${colors.text.secondary}B3` }}>
          {post?.content || content}
        </p>

        {type === 'collab' && skillsNeeded?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: colors.text.muted }}>
              Skills Needed:
            </p>
            <div className="flex flex-wrap gap-2">
              {skillsNeeded.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-md text-xs font-medium border"
                  style={{
                    backgroundColor: `${colors.primary.blue[500]}33`,
                    color: colors.text.primary,
                    borderColor: `${colors.primary.blue[500]}4D`,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {tags?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs mb-2" style={{ color: colors.text.muted }}>
              Tags:
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-md text-xs font-medium border"
                  style={{
                    backgroundColor: `${colors.accent.orange[500]}33`,
                    color: colors.text.primary,
                    borderColor: `${colors.accent.orange[500]}4D`,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs" style={{ color: `${colors.text.secondary}80` }}>
            <div>Posted on: {new Date(createdAt).toLocaleDateString()}</div>
            {user.name && <div className="mt-1">By: {user.name}</div>}
          </div>

        
        </div>
      </div>
    </div>
  );
};

export default CommunityPostCard;
