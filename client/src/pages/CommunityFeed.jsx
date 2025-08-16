import React, { useEffect, useState } from "react";
import axios from "../axios";
import { motion } from "framer-motion";
import colors from "../styles/colors";
import { ThumbsUp, MessageSquare, Share2, Calendar, UserCircle2, Heart } from "lucide-react";
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const funEmojis = ['🌟', '✨', '🎨', '🚀', '💡', '🎉', '🌈', '⚡', '🔥', '💫', '🎪', '🎭'];
const funShapes = ['🔸', '🔹', '🟡', '🟢', '🟣', '🟠', '🔴', '⭐'];

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [expanded, setExpanded] = useState(false);

  const POSTS_PER_PAGE = 8;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout
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

  // Attach token to axios requests
  useEffect(() => {
    if (!user?.token) return;
    
    const interceptor = axios.interceptors.request.use(
      (config) => {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${user.token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    return () => axios.interceptors.request.eject(interceptor);
  }, [user?.token]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get("/community-posts");
        let fetchedPosts = [];
        if (data?.data?.posts && Array.isArray(data.data.posts)) {
          fetchedPosts = data.data.posts;
        } else if (Array.isArray(data)) {
          fetchedPosts = data;
        } else if (typeof data === "object" && data !== null) {
          fetchedPosts = [data];
        }
        
        const currentUserId = user?.id;
        const postsWithLike = fetchedPosts.map((p) => ({
          ...p,
          likedByUser: Array.isArray(p.likedBy) && currentUserId
            ? p.likedBy.map(id => id.toString()).includes(currentUserId.toString())
            : false,
          likesCount: typeof p.likes === "number" ? p.likes : 0,
        }));
        setPosts(postsWithLike);

        // Initialize comments state with backend data
        const commentsData = {};
        postsWithLike.forEach(post => {
          if (post.comments && Array.isArray(post.comments)) {
            commentsData[post.postId] = post.comments.map(comment => ({
              id: comment.commentId,
              text: comment.text,
              author: comment.authorName,
              authorId: comment.authorId,
              timestamp: comment.createdAt,
              likes: comment.likes || 0,
              likedBy: comment.likedBy || []
            }));
          }
        });
        setComments(commentsData);

      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [user?.id]);

  const handleLike = async (postId, likedByUser) => {
    if (!postId) return;
    
    // Optimistic update
    setPosts(prev => prev.map(post => 
      post.postId === postId
        ? { 
            ...post, 
            likedByUser: !likedByUser,
            likes: likedByUser ? Math.max(0, (post.likes || 0) - 1) : (post.likes || 0) + 1
          }
        : post
    ));

    try {
      await axios.post(`/community-posts/${postId}/like`);
      // Refetch posts to get accurate data
      const { data } = await axios.get("/community-posts");
      let fetchedPosts = [];
      if (data?.data?.posts && Array.isArray(data.data.posts)) {
        fetchedPosts = data.data.posts;
      } else if (Array.isArray(data)) {
        fetchedPosts = data;
      } else if (typeof data === "object" && data !== null) {
        fetchedPosts = [data];
      }
      
      const currentUserId = user?.id;
      const postsWithLike = fetchedPosts.map((p) => ({
        ...p,
        likedByUser: Array.isArray(p.likedBy) && currentUserId
          ? p.likedBy.map(id => id.toString()).includes(currentUserId.toString())
          : false,
        likesCount: typeof p.likes === "number" ? p.likes : 0,
      }));
      setPosts(postsWithLike);
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert optimistic update on error
      setPosts(prev => prev.map(post => 
        post.postId === postId
          ? { 
              ...post, 
              likedByUser: likedByUser,
              likes: likedByUser ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 0) - 1)
            }
          : post
      ));
    }
  };

  const handleCommentToggle = (postId) => {
    setOpenCommentPostId(openCommentPostId === postId ? null : postId);
  };

  const handleAddComment = async (postId) => {
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;
    
    try {
      const commentData = {
        text: commentText,
        commentId: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const response = await axios.post(`/community-posts/${postId}/comments`, commentData);
      
      if (response.data.success && response.data.data.comments) {
        // Update comments state with fresh backend data
        const updatedComments = response.data.data.comments.map(comment => ({
          id: comment.commentId,
          text: comment.text,
          author: comment.authorName,
          authorId: comment.authorId,
          timestamp: comment.createdAt,
          likes: comment.likes || 0,
          likedBy: comment.likedBy || []
        }));
        
        setComments(prev => ({
          ...prev,
          [postId]: updatedComments
        }));

        // Clear the input
        setNewComment(prev => ({
          ...prev,
          [postId]: ""
        }));

        // Update the post's comment count
        setPosts(prev => prev.map(post => 
          post.postId === postId
            ? { ...post, commentsCount: updatedComments.length }
            : post
        ));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      // You could show an error message to the user here
    }
  };

  const handleCommentLike = async (postId, commentId) => {
    if (!user?.id) return;
    
    try {
      const response = await axios.post(`/community-posts/${postId}/comments/${commentId}/like`);
      
      if (response.data.success && response.data.data.comments) {
        // Update comments state with fresh backend data
        const updatedComments = response.data.data.comments.map(comment => ({
          id: comment.commentId,
          text: comment.text,
          author: comment.authorName,
          authorId: comment.authorId,
          timestamp: comment.createdAt,
          likes: comment.likes || 0,
          likedBy: comment.likedBy || []
        }));
        
        setComments(prev => ({
          ...prev,
          [postId]: updatedComments
        }));
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      // You could show an error message to the user here
    }
  };

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleShare = (post) => {
    const shareData = {
      title: post.title || 'Community Post',
      text: post.content?.substring(0, 100) + '...' || '',
      url: window.location.origin + `/community-posts/${post.postId}`,
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('🎉 Post link copied to clipboard!');
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return colors.primary?.blue?.[500] || '#0ea5e9';
      case 'in-progress': return colors.accent?.yellow?.[500] || '#f59e0b';
      case 'closed': return colors.text?.muted || '#94a3b8';
      default: return colors.text?.muted || '#94a3b8';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'collab' ? '🤝' : '💡';
  };

  const getRandomEmoji = (index) => {
    return funEmojis[index % funEmojis.length];
  };

  const getRandomShape = (index) => {
    return funShapes[index % funShapes.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Today ✨';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today ✨';
    if (diffDays === 1) return 'Yesterday 🌅';
    if (diffDays < 7) return `${diffDays} days ago 📅`;
    return date.toLocaleDateString() + ' 📆';
  };

  const getCardLayout = (index) => {
    const layouts = [
      { rotation: '2deg', skew: '1deg', scale: 1.02 },
      { rotation: '-1deg', skew: '-0.5deg', scale: 1.01 },
      { rotation: '1.5deg', skew: '0.8deg', scale: 1.03 },
      { rotation: '-2deg', skew: '-1.2deg', scale: 1.01 },
    ];
    return layouts[index % layouts.length];
  };

  if (loading) {
    return (
      <div className="flex min-h-screen" 
           style={{
             background: colors.gradients?.background?.main || `linear-gradient(135deg, #667eea, #764ba2)`
           }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <Topbar 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
          <div className="flex-1 flex items-center justify-center relative">
            {Array.from({length: 6}).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-3xl opacity-20"
                style={{
                  left: `${20 + (i * 12)}%`,
                  top: `${20 + (i * 10)}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 180, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {getRandomEmoji(i)}
              </motion.div>
            ))}
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1], rotate: [0, 360] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="text-8xl mb-6"
            >
              🎪
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold absolute mt-20"
              style={{ color: colors.text?.primary || '#ffffff' }}
            >
              Loading the magic... ✨
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div className="flex min-h-screen relative overflow-hidden" 
         style={{
           background: colors.gradients?.background?.main || `linear-gradient(135deg, #667eea, #764ba2)`
         }}>
      {Array.from({length: 8}).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-10 pointer-events-none"
          style={{
            left二十世紀の残り物: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            rotate: [0, 360],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 1,
          }}
        >
          {getRandomShape(i)}
        </motion.div>
      ))}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col relative z-10">
        <Topbar 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          user={user}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
        <main className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="relative inline-block">
                <motion.h1 
                  className="text-4xl md:text-5xl font-black mb-3 relative"
                  style={{ 
                    color: colors.text?.primary || '#ffffff',
                    textShadow: `3px 3px 0px ${colors.primary?.blue?.[500] || '#0ea5e9'}, 6px 6px 0px ${colors.primary?.purple?.[500] || '#d946ef'}`
                  }}
                  animate={{ 
                    textShadow: [
                      `3px 3px 0px ${colors.primary?.blue?.[500] || '#0ea5e9'}, 6px 6px 0px ${colors.primary?.purple?.[500] || '#d946ef'}`,
                      `4px 4px 0px ${colors.primary?.purple?.[500] || '#d946ef'}, 7px 7px 0px ${colors.primary?.blue?.[500] || '#0ea5e9'}`,
                      `3px 3px 0px ${colors.primary?.blue?.[500] || '#0ea5e9'}, 6px 6px 0px ${colors.primary?.purple?.[500] || '#d946ef'}`
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🤝💡 Community Vibes 🎪
                </motion.h1>
                <motion.div 
                  className="absolute -top-2 -left-6 text-2xl"
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎨
                </motion.div>
                <motion.div 
                  className="absolute -top-1 -right-4 text-xl"
                  animate={{ y: [0, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✨
                </motion.div>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-medium"
                style={{ color: colors.text?.secondary || '#e2e8f0' }}
              >
                Where creativity meets collaboration! 🚀✨
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.isArray(paginatedPosts) && paginatedPosts.length > 0 ? (
                paginatedPosts.map((post, index) => {
                  const layout = getCardLayout(index);
                  const cardRotation = [-1, 1, -0.5, 1.5][index % 4];
                  
                  return (
                    <motion.article
                      key={post.postId}
                      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                      animate={{ 
                        opacity: 1, 
                        scale: layout.scale, 
                        rotate: cardRotation 
                      }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 200,
                        damping: 20
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        rotate: 0,
                        y: -5,
                        boxShadow: `0 20px 40px rgba(0,0,0,0.3)`
                      }}
                      className="relative group cursor-pointer"
                    >
                      <div 
                        className="relative overflow-hidden shadow-xl border-2 border-opacity-30 p-4"
                        style={{
                          background: colors.background?.card || 'rgba(255, 255, 255, 0.95)',
                          borderColor: colors.primary?.blue?.[500] || '#0ea5e9',
                          borderRadius: '1.5rem',
                          backdropFilter: 'blur(10px)',
                          minHeight: '280px'
                        }}
                      >
                        <motion.div 
                          className="absolute top-2 left-2 text-2xl opacity-20"
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            delay: index * 0.5
                          }}
                        >
                          {getRandomShape(index)}
                        </motion.div>

                        <div className="flex items-center space-x-3 mb-3">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="relative"
                          >
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-md font-bold text-white shadow-lg border-2 border-white"
                              style={{ 
                                background: colors.gradients?.brand?.primary || 'linear-gradient(135deg, #0ea5e9, #d946ef)'
                              }}
                            >
                              {post.authorId?.name?.[0]?.toUpperCase() || '🎭'}
                            </div>
                          </motion.div>
                          
                          <div className="flex-1 min-w-0">
                            <div 
                              className="font-semibold text-md truncate"
                              style={{ color: colors.text?.primary || '#1f2937' }}
                            >
                              {post.authorId?.name || "Creative Soul"} 
                              <span className="ml-1">🎭</span>
                            </div>
                            <div 
                              className="text-xs flex items-center space-x-1"
                              style={{ color: colors.text?.muted || '#6b7280' }}
                            >
                              <Calendar size={10} />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>

                          {post.status && (
                            <motion.span 
                              whileHover={{ scale: 1.05 }}
                              className="px-2 py-1 rounded-full text-xs font-bold shadow-sm"
                              style={{ 
                                backgroundColor: `${getStatusColor(post.status)}20`,
                                color: getStatusColor(post.status),
                                border: `1px solid ${getStatusColor(post.status)}50`
                              }}
                            >
                              ⚡ {post.status.toUpperCase()}
                            </motion.span>
                          )}
                        </div>

                        {post.projectId && (
                          <div className="mb-2">
                            <span 
                              className="text-xs font-medium"
                              style={{ color: colors.text?.muted || '#6b7280' }}
                            >
                              Project: {post.projectId?.title || post.projectId?.name}
                            </span>
                          </div>
                        )}

                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <motion.span 
                              className="text-xl"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              {getTypeIcon(post.type)}
                            </motion.span>
                            <h3 
                              className="font-bold text-sm leading-tight flex-1"
                              style={{ color: colors.primary?.purple?.[500] || '#9333ea' }}
                            >
                              {post.title || (post.type === 'collab' ? 'Collaboration Opportunity! 🤝' : 'Hello Researchers! 💡')}
                            </h3>
                          </div>
                          
<p 
  className="text-md leading-relaxed mb-3"
  style={{ color: colors.text?.secondary || '#4b5563' }}
>
  {expanded ? (post.content || "Something amazing is brewing... ✨") 
            : (post.content || "Something amazing is brewing... ✨").slice(0, 150)}

  {(post.content && post.content.length > 150) && (
    <span
      onClick={() => setExpanded(!expanded)}
      className="ml-2 cursor-pointer text-blue-600 hover:underline text-sm font-medium"
    >
      {expanded ? "📖 See Less" : "📕 See More"}
    </span>
  )}
</p>

                        </div>

                        {post.skillsNeeded && Array.isArray(post.skillsNeeded) && post.skillsNeeded.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {post.skillsNeeded.slice(0, 3).map((skill) => (
                                <motion.span
                                  key={skill}
                                  whileHover={{ scale: 1.05 }}
                                  className="px-2 py-1 rounded-full text-sm font-medium"
                                  style={{ 
                                    backgroundColor: `${colors.primary?.blue?.[500] || '#0ea5e9'}20`,
                                    color: colors.primary?.blue?.[500] || '#0ea5e9',
                                    border: `1px solid ${colors.primary?.blue?.[500] || '#0ea5e9'}40`
                                  }}
                                >
                                  🔥 {skill}
                                </motion.span>
                              ))}
                              {post.skillsNeeded.length > 3 && (
                                <span 
                                  className="px-2 py-1 rounded-full text-md "
                                  style={{ color: colors.text?.muted || '#6b7280' }}
                                >
                                  +{post.skillsNeeded.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 rounded text-sm"
                                  style={{ 
                                    backgroundColor: `${colors.text?.muted || '#6b7280'}15`,
                                    color: colors.text?.muted || '#6b7280'
                                  }}
                                >
                                  #{tag}
                                </span>
                              ))}
                              {post.tags.length > 2 && (
                                <span 
                                  className="text-xs"
                                  style={{ color: colors.text?.muted || '#6b7280' }}
                                >
                                  +{post.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleLike(post.postId, post.likedByUser)}
                              className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all"
                              style={{ 
                                backgroundColor: post.likedByUser ? `${colors.accent?.red?.[500] || '#ef4444'}20` : `${colors.text?.muted || '#6b7280'}10`,
                                color: post.likedByUser ? colors.accent?.red?.[500] || '#ef4444' : colors.text?.secondary || '#4b5563'
                              }}
                            >
                              {post.likedByUser ? (
                                <Heart size={12} fill="currentColor" />
                              ) : (
                                <ThumbsUp size={12} />
                              )}
                              <span>{post.likes || 0}</span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleCommentToggle(post.postId)}
                              className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all"
                              style={{ 
                                backgroundColor: openCommentPostId === post.postId ? `${colors.primary?.blue?.[500] || '#0ea5e9'}20` : `${colors.text?.muted || '#6b7280'}10`,
                                color: openCommentPostId === post.postId ? colors.primary?.blue?.[500] || '#0ea5e9' : colors.text?.secondary || '#4b5563'
                              }}
                            >
                              <MessageSquare size={12} />
                              <span>{(comments[post.postId]?.length || 0)}</span>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleShare(post)}
                              className="flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all"
                              style={{ 
                                backgroundColor: `${colors.text?.muted || '#6b7280'}10`,
                                color: colors.text?.secondary || '#4b5563'
                              }}
                            >
                              <Share2 size={12} />
                            </motion.button>
                          </div>

                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="text-md opacity-60"
                          >
                            {getRandomEmoji(index + 3)}
                          </motion.div>
                        </div>

                        {openCommentPostId === post.postId && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 border-t pt-3"
                            style={{ 
                              borderColor: `${colors.text?.muted || '#6b7280'}20`
                            }}
                          >
                            {/* Comments List */}
                            <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
                              {(comments[post.postId] || []).map((comment) => (
                                <motion.div 
                                  key={comment.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex space-x-2 group"
                                >
                                  <div 
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                    style={{ 
                                      background: colors.gradients?.brand?.primary || 'linear-gradient(135deg, #0ea5e9, #d946ef)'
                                    }}
                                  >
                                    {comment.author[0]?.toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span 
                                        className="text-xs font-semibold truncate"
                                        style={{ color: colors.text?.primary || '#1f2937' }}
                                      >
                                        {comment.author}
                                      </span>
                                      <span 
                                        className="text-xs opacity-60"
                                        style={{ color: colors.text?.muted || '#6b7280' }}
                                      >
                                        {formatCommentDate(comment.timestamp)}
                                      </span>
                                    </div>
                                    <p 
                                      className="text-xs leading-relaxed mb-2"
                                      style={{ color: colors.text?.secondary || '#4b5563' }}
                                    >
                                      {comment.text}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleCommentLike(post.postId, comment.id)}
                                        className="flex items-center space-x-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
                                        style={{ 
                                          color: comment.likedBy?.includes(user?.id) 
                                            ? colors.accent?.red?.[500] || '#ef4444' 
                                            : colors.text?.muted || '#6b7280'
                                        }}
                                      >
                                        <Heart size={10} fill={comment.likedBy?.includes(user?.id) ? 'currentColor' : 'none'} />
                                        <span>{comment.likes || 0}</span>
                                      </motion.button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                              
                              {(!comments[post.postId] || comments[post.postId].length === 0) && (
                                <div 
                                  className="text-center py-4 text-xs opacity-60"
                                  style={{ color: colors.text?.muted || '#6b7280' }}
                                >
                                  💭 No comments yet. Be the first to share your thoughts!
                                </div>
                              )}
                            </div>
                            
                            {/* Add Comment Input */}
                            <div className="flex space-x-2">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ 
                                  background: colors.gradients?.brand?.primary || 'linear-gradient(135deg, #0ea5e9, #d946ef)'
                                }}
                              >
                                {user?.name?.[0]?.toUpperCase() || '👤'}
                              </div>
                              <div className="flex-1 flex space-x-2">
                                <input
                                  type="text"
                                  value={newComment[post.postId] || ""}
                                  onChange={(e) => setNewComment(prev => ({
                                    ...prev,
                                    [post.postId]: e.target.value
                                  }))}
                                  placeholder="Add a thoughtful comment... 💭"
                                  className="flex-1 px-3 py-2 text-xs rounded-full border focus:outline-none focus:ring-2 transition-all"
                                  style={{ 
                                    borderColor: colors.text?.muted || '#6b7280',
                                    backgroundColor: colors.background?.card || '#ffffff',
                                    focusRingColor: colors.primary?.blue?.[500] || '#0ea5e9',
                                    color: colors.text.primary 
                                  }}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleAddComment(post.postId);
                                    }
                                  }}
                                />
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleAddComment(post.postId)}
                                  disabled={!newComment[post.postId]?.trim()}
                                  className="px-3 py-2 text-xs font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ 
                                    backgroundColor: colors.primary?.blue?.[500] || '#0ea5e9',
                                    color: 'white'
                                  }}
                                >
                                  💬 Post
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.article>
                  );
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-16"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -20, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-8xl mb-6"
                  >
                    🎨
                  </motion.div>
                  <h2 
                    className="text-3xl font-bold mb-4 text-center"
                    style={{ color: colors.text?.primary || '#ffffff' }}
                  >
                    Ready to Create Magic? ✨
                  </h2>
                  <p 
                    className="text-lg mb-8 text-center max-w-md"
                    style={{ color: colors.text?.secondary || '#e2e8f0' }}
                  >
                    Be the first creative soul to spark an amazing conversation! 🚀
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-full font-bold text-white shadow-xl border-4 border-white"
                    style={{ 
                      background: colors.gradients?.brand?.primary || 'linear-gradient(135deg, #0ea5e9, #d946ef)'
                    }}
                  >
                    🎪 Start the Fun! 🎪
                  </motion.button>
                </motion.div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-full font-bold shadow border-2 transition-all duration-150 ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                  aria-label="Previous Page"
                >
                  Previous
                </button>
                <span className="font-bold text-lg" style={{ color: colors.text.primary }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-full font-bold shadow border-2 transition-all duration-150 ${page === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                  aria-label="Next Page"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}