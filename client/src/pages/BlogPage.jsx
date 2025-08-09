import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { useAlert } from '../context/AlertContext';
import { colors } from '../styles/colors';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useAlert();

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/blogs'); // Goes to http://localhost:1085/api/blogs

      if (res.data?.success && Array.isArray(res.data.data)) {
        setBlogs(res.data.data);
      } else {
        setBlogs([]);
      }

      if (!res.data?.data?.length) {
        showError('No blogs found. Create your first blog post!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load blogs';
      setError(errorMessage);
      if (err.code === 'ERR_NETWORK') {
        showError('Cannot connect to server. Please make sure the backend server is running.');
      } else {
        showError(`Failed to load blogs: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Like blog
  const handleLike = async (id) => {
    try {
      const res = await axios.patch(`/blogs/${id}/like`);
      if (res.data?.success) {
        const updatedBlog = res.data.data;
        setBlogs(prev => prev.map(blog => (blog._id === id ? updatedBlog : blog)));
        showSuccess('Blog liked successfully!');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to like blog';
      showError(`Failed to like blog: ${errorMessage}`);
    }
  };

  // Increment view count
  const handleView = async (id) => {
    try {
      const res = await axios.patch(`/blogs/${id}/view`);
      if (res.data?.success) {
        const updatedBlog = res.data.data;
        setBlogs(prev => prev.map(blog => (blog._id === id ? updatedBlog : blog)));
      }
    } catch (err) {
      console.error('Error updating view count:', err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
        <div 
          className="w-6 h-6 border-2 rounded-full animate-spin mx-auto mb-4"
          style={{
            borderColor: `${colors.primary.blue[400]}4D`,
            borderTopColor: colors.primary.blue[400]
          }}
        ></div>
        <p style={{ color: colors.text.muted }}>Loading blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', textAlign: 'center' }}>
        <p style={{ color: colors.status.error, marginBottom: '20px' }}>{error}</p>
        <button
          onClick={fetchBlogs}
          style={{
            background: colors.primary.blue[500],
            color: colors.text.primary,
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Retry Loading Blogs
        </button>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        maxWidth: '800px', 
        margin: 'auto', 
        padding: '20px',
        background: `linear-gradient(135deg, ${colors.gradients.background.main}, ${colors.gradients.background.hero})`,
        minHeight: '100vh'
      }}
    >
      <div 
        style={{
          backgroundColor: colors.background.glass,
          borderRadius: '12px',
          padding: '24px',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.border.secondary}`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ color: colors.text.primary, margin: 0 }}>Latest Blogs</h1>
          <button
            onClick={fetchBlogs}
            style={{
              background: colors.primary.blue[500],
              color: colors.text.primary,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Refresh
          </button>
        </div>
        
        {blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: colors.text.secondary, fontSize: '18px', marginBottom: '16px' }}>
              No blogs found.
            </p>
            <p style={{ color: colors.text.muted }}>
              Be the first to create a blog post!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {blogs.map(blog => (
              <div
                key={blog._id}
                style={{
                  background: colors.background.glass,
                  border: `1px solid ${colors.border.secondary}`,
                  borderRadius: '8px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(5px)'
                }}
                onClick={() => handleView(blog._id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary.blue[400];
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.secondary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h2 style={{ 
                  color: colors.text.primary, 
                  margin: '0 0 12px 0',
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  {blog.title}
                </h2>
                
                <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                  <p style={{ color: colors.text.secondary, margin: 0 }}>
                    <strong>Category:</strong> {blog.category}
                  </p>
                  <p style={{ color: colors.text.secondary, margin: 0 }}>
                    <strong>Author:</strong> {blog.author || 'Unknown'}
                  </p>
                </div>
                
                <p style={{ 
                  color: colors.text.muted, 
                  margin: '0 0 16px 0',
                  lineHeight: '1.6'
                }}>
                  {blog.excerpt || (blog.content ? blog.content.slice(0, 200) + '...' : '')}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <small style={{ color: colors.text.secondary }}>
                      👀 Views: {blog.views || 0}
                    </small>
                    <small style={{ color: colors.text.secondary }}>
                      💖 Likes: {blog.likes || 0}
                    </small>
                  </div>
                  
                  <button
                    style={{
                      background: colors.accent.red[500],
                      color: colors.text.primary,
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleLike(blog._id); 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.accent.red[400];
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.accent.red[500];
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ❤️ Like
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
