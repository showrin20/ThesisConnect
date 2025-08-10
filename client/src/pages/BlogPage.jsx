import React, { useEffect, useState } from 'react';
import axios from '../axios';
import { useAlert } from '../context/AlertContext';
import { colors } from '../styles/colors';
import { useNavigate } from 'react-router-dom';




const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  const categories = ['Research', 'Technology', 'Academia', 'Tutorial', 'Opinion', 'News', 'Review', 'Personal'];

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      params.append('status', 'published');
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter.toLowerCase()); // normalized
      }

      const res = await axios.get(`/blogs?${params.toString()}`);

      if (res.data?.success && Array.isArray(res.data.data)) {
        setBlogs(res.data.data);
      } else {
        setBlogs([]);
      }

      if (!res.data?.data?.length) {
        showError('No published blogs found.');
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

  const handleView = async (id) => {
    try {
      await axios.patch(`/blogs/${id}/view`);
    } catch (err) {
      console.error('Error updating view count:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchBlogs();
  }, [categoryFilter]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
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
      <div style={{ textAlign: 'center', padding: '40px' }}>
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
        maxWidth: '1300px',
        margin: 'auto',
        padding: '20px',
        background: `linear-gradient(135deg, ${colors.gradients.background.main}, ${colors.gradients.background.hero})`,
        minHeight: '100vh'
      }}
    >
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ color: colors.text.primary, margin: 0 }}>Published Blogs</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              background: colors.background.glass,
              border: `1px solid ${colors.border.secondary}`,
              borderRadius: '6px',
              padding: '6px 12px',
              color: colors.text.primary,
              fontSize: '14px'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
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
      </div>

      {blogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: colors.text.secondary, fontSize: '18px', marginBottom: '16px' }}>
            No blogs found.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}
        >
          {blogs.map(blog => (
            <div
              key={blog._id}
              style={{
                background: colors.background.glass,
                border: `1px solid ${colors.border.secondary}`,
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => {
                handleView(blog._id);
                navigate(`/blog/${blog._id}`);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.1)';
              }}
            >
              {blog.featuredImage && (
                <div style={{ position: 'relative' }}>
                  <img
                    src={blog.featuredImage}
                    alt={blog.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0))'
                  }} />
                </div>
              )}

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h2 style={{ color: colors.text.primary, margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>
                  {blog.title}
                </h2>
                <p style={{
                  color: colors.text.muted,
                  flex: 1,
                  fontSize: '14px',
                  marginBottom: '12px',
                  lineHeight: '1.5'
                }}>
                  {blog.excerpt || (blog.content ? blog.content.replace(/<[^>]*>/g, '').slice(0, 140) + '...' : '')}
                </p>
                <small style={{ color: colors.text.secondary, marginBottom: '12px' }}>
                  {blog.category} • {formatDate(blog.createdAt)}
                </small>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: colors.text.secondary }}>
                    👀 {blog.views || 0} | 💖 {blog.likes || 0}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{
                        background: colors.accent.red[300],
                        color: colors.text.primary,
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      onClick={(e) => { e.stopPropagation(); handleLike(blog._id); }}
                    >
                      ❤️ Like
                    </button>
<button
  style={{
    background: colors.primary.blue[300],
    color: colors.text.primary[600],
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  }}
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/blog/${blog._id}`);
  }}
>
  📖 View Full Blog
</button>




                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;