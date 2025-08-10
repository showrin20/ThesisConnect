import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axios';
import { useAlert } from '../context/AlertContext';
import { colors } from '../styles/colors';
import { Calendar, User, Tag, ArrowLeft, Eye, Heart } from 'lucide-react';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlert();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/blogs/${id}`);
      if (response.data?.success) {
        setBlog(response.data.data);
      } else {
        setBlog(response.data);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      showError('Failed to load the blog.');
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await axios.patch(`/blogs/${id}/view`);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleLike = async () => {
    if (!blog) return;
    try {
      setLiking(true);
      const response = await axios.patch(`/blogs/${id}/like`);
      if (response.data?.success) {
        setBlog((prev) => ({
          ...prev,
          likes: response.data.data.likes,
          likedByUser: response.data.data.likedByUser,
        }));
        showSuccess('Blog liked successfully!');
      }
    } catch (error) {
      console.error('Error liking blog:', error);
      showError('Failed to update like.');
    } finally {
      setLiking(false);
    }
  };

  useEffect(() => {
    fetchBlog();
    incrementViewCount();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: colors.text.secondary }}>
        Loading blog...
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: colors.text.secondary }}>
        Blog not found.
      </div>
    );
  }

  return (
    <div 
      style={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.gradients.background.main}, ${colors.gradients.background.hero})`,
        padding: '20px'
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px',
            background: colors.background.glass,
            border: `1px solid ${colors.border.secondary}`,
            borderRadius: '8px',
            padding: '8px 16px',
            color: colors.primary.blue[500],
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = colors.primary.blue[500];
            e.target.style.color = colors.text.primary;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = colors.background.glass;
            e.target.style.color = colors.primary.blue[500];
          }}
        >
          <ArrowLeft size={16} /> Back to Blogs
        </button>

        {/* Main Content Card */}
        <div
          style={{
            background: colors.background.glass,
            border: `1px solid ${colors.border.secondary}`,
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Blog Title */}
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: colors.text.primary }}>
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', color: colors.text.secondary, fontSize: '14px' }}>
            <span><User size={14} style={{ marginRight: '4px' }} /> {blog.author?.name || blog.author || 'Unknown Author'}</span>
            <span><Calendar size={14} style={{ marginRight: '4px' }} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
            {blog.category && (
              <span><Tag size={14} style={{ marginRight: '4px' }} /> {blog.category}</span>
            )}
            <span><Eye size={14} style={{ marginRight: '4px' }} /> {blog.views || 0} views</span>
          </div>

          {/* Blog Image */}
          {blog.featuredImage && (
            <img
              src={blog.featuredImage}
              alt={blog.title}
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            />
          )}

          {/* Blog Content */}
          <div 
            style={{ 
              lineHeight: '1.8', 
              fontSize: '16px', 
              color: colors.text.primary, 
              marginBottom: '24px',
              wordWrap: 'break-word',
              overflow: 'hidden'
            }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Like Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleLike}
              disabled={liking}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: blog.likedByUser ? colors.accent.red[500] : colors.primary.blue[500],
                color: colors.text.primary,
                border: 'none',
                borderRadius: '8px',
                cursor: liking ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: liking ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              <Heart size={16} fill={blog.likedByUser ? 'white' : 'none'} /> 
              {liking ? 'Liking...' : `${blog.likes || 0} Likes`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
