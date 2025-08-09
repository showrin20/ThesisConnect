import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../axios'; // your axios instance configured with baseURL
import BlogCard from '../components/BlogCard';
import BlogForm from '../components/BlogForm';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getStatusStyles, getCardStyles, getGradientTextStyles } from '../styles/styleUtils';

// Import Dashboard components
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';

export default function MyBlogs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deletingBlog, setDeletingBlog] = useState(null);
  const [showBlogForm, setShowBlogForm] = useState(false);
  
  // Alert/Notification states
  const [alert, setAlert] = useState({ show: false, type: '', title: '', message: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // User statistics state
  const [userStats, setUserStats] = useState({
    projects: { total: 0, planned: 0, inProgress: 0, completed: 0 },
    publications: { total: 0, byType: {}, totalCitations: 0 },
    collaborators: { total: 0 },
    blogs: { total: 0, published: 0, draft: 0, archived: 0 }
  });
  const [loadingStats, setLoadingStats] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'Technology',
    tags: '',
    status: 'draft',
    featuredImage: null,
  });

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

const fetchMyBlogs = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await axios.get('/blogs/my-blogs');
    console.log('API Response:', res.data); // Log the response
    setBlogs(res.data.data || []);
    
    // Update blog stats
    const blogStats = {
      total: res.data.data?.length || 0,
      published: res.data.data?.filter(b => b.status === 'published').length || 0,
      draft: res.data.data?.filter(b => b.status === 'draft').length || 0,
      archived: res.data.data?.filter(b => b.status === 'archived').length || 0
    };
    
    setUserStats(prev => ({ ...prev, blogs: blogStats }));
  } catch (err) {
    console.error('Fetch blogs error:', err);
    const errorMessage = err.response?.data?.msg || err.response?.data?.message || 'Failed to load your blogs';
    setError(errorMessage);
    
    // Show alert for fetch errors
    if (err.response?.status === 401) {
      showAlert('error', 'Authentication Error', 'Please log in again to view your blogs');
    } else if (err.response?.status >= 500) {
      showAlert('error', 'Server Error', 'Server is temporarily unavailable. Please try again later.');
    } else {
      showAlert('error', 'Loading Failed', errorMessage);
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchMyBlogs();
    
  }, []);






  
  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ show: false, type: '', title: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  // Show alert helper function
  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  // Handle escape key for modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (deletingBlog) {
          setDeletingBlog(null);
        } else if (editingBlog) {
          cancelForm();
        } else if (showBlogForm) {
          setShowBlogForm(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [deletingBlog, editingBlog, showBlogForm]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const parseCSV = (str) =>
    str.split(',').map(s => s.trim()).filter(Boolean);

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitLoading(true);
  
  try {
    console.log('🚀 Starting form submission...');
    
    // Validate required fields
    if (!formData.title.trim()) {
      showAlert('error', 'Validation Error', 'Blog title is required');
      return;
    }
    if (!formData.content.trim()) {
      showAlert('error', 'Validation Error', 'Blog content is required');
      return;
    }
    if (!formData.excerpt.trim()) {
      showAlert('error', 'Validation Error', 'Blog excerpt is required');
      return;
    }

    // Check server connectivity first
    console.log('🔍 Checking server connectivity...');
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title.trim());
    formDataToSend.append('content', formData.content.trim());
    formDataToSend.append('excerpt', formData.excerpt.trim());
    formDataToSend.append('category', formData.category);
    formDataToSend.append('status', formData.status);
    formDataToSend.append('tags', JSON.stringify(parseCSV(formData.tags)));
    
    if (formData.featuredImage) {
      // Validate file size (5MB limit)
      if (formData.featuredImage.size > 5 * 1024 * 1024) {
        showAlert('error', 'File Size Error', 'Featured image must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(formData.featuredImage.type)) {
        showAlert('error', 'File Type Error', 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      formDataToSend.append('featuredImage', formData.featuredImage);
    }

    // Log FormData contents
    console.log('📝 Sending FormData:');
    for (let [key, value] of formDataToSend.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const res = await axios.post('/blogs', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📤 Upload Progress: ${percentCompleted}%`);
      }
    });

    console.log('✅ Blog Created Successfully:', res.data);
    showAlert('success', 'Success!', 'Blog post created successfully');
    setShowBlogForm(false);
    resetForm();
    await fetchMyBlogs();
    
  } catch (err) {
    console.error('❌ Submit Error Details:', {
      message: err.message,
      code: err.code,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        baseURL: err.config?.baseURL
      }
    });

    // Handle different types of errors
    if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
      showAlert('error', 'Network Error', 'Cannot connect to server. Please check if the server is running and try again.');
    } else if (err.code === 'ECONNABORTED') {
      showAlert('error', 'Timeout Error', 'Request timed out. Please try again with a smaller file or check your connection.');
    } else if (err.response) {
      // Server responded with error
      const errorData = err.response.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        showAlert('error', 'Validation Error', errorData.errors.join('\n'));
      } else if (errorData?.message) {
        showAlert('error', 'Server Error', errorData.message);
      } else {
        showAlert('error', 'Server Error', `Server returned ${err.response.status}: ${err.response.statusText}`);
      }
    } else if (err.request) {
      showAlert('error', 'Network Error', 'No response from server. Please check your internet connection.');
    } else {
      showAlert('error', 'Request Error', `Failed to send request: ${err.message}`);
    }
  } finally {
    setSubmitLoading(false);
  }
};

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        showAlert('error', 'Validation Error', 'Blog title is required');
        return;
      }
      if (!formData.content.trim()) {
        showAlert('error', 'Validation Error', 'Blog content is required');
        return;
      }
      if (!formData.excerpt.trim()) {
        showAlert('error', 'Validation Error', 'Blog excerpt is required');
        return;
      }

      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim(),
        category: formData.category,
        status: formData.status,
        tags: parseCSV(formData.tags),
      };

      const res = await axios.put(`/blogs/${editingBlog._id}`, payload);
      console.log('Updated:', res.data);

      showAlert('success', 'Success!', 'Blog post updated successfully');
      setEditingBlog(null);
      resetForm();
      fetchMyBlogs();
    } catch (err) {
      console.error('Update Error:', err);
      const errorMessage = err.response?.data?.msg || err.response?.data?.message || 'Failed to update blog post';
      const errorDetails = err.response?.data?.details || '';
      
      showAlert('error', 'Update Failed', `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/blogs/${id}`);
      showAlert('success', 'Deleted!', 'Blog post deleted successfully');
      setDeletingBlog(null);
      fetchMyBlogs();
    } catch (err) {
      console.error('Delete Error:', err);
      const errorMessage = err.response?.data?.msg || err.response?.data?.message || 'Failed to delete blog post';
      showAlert('error', 'Delete Failed', errorMessage);
    }
  };

  const confirmDelete = (blog) => {
    setDeletingBlog(blog);
  };

  const cancelDelete = () => {
    setDeletingBlog(null);
  };

  const startEditing = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      category: blog.category || 'Technology',
      tags: (blog.tags || []).join(', '),
      status: blog.status || 'draft',
      featuredImage: null, // Don't prefill file input
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'Technology',
      tags: '',
      status: 'draft',
      featuredImage: null,
    });
    // Clear file input if it exists
    const fileInput = document.getElementById('featuredImage');
    if (fileInput) fileInput.value = '';
  };

  const cancelForm = () => {
    setEditingBlog(null);
    setDeletingBlog(null);
    setShowBlogForm(false);
    setSubmitLoading(false);
    setUpdateLoading(false);
    resetForm();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return colors.accent.green[400];
      case 'draft':
        return colors.accent.yellow[400];
      case 'archived':
        return colors.text.disabled;
      default:
        return colors.primary.blue[400];
    }
  };

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.background.page }}>
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
      
      {/* Background Pattern */}
      <div className="absolute inset-0" style={{ opacity: 0.3 }}>
        <div className="h-full w-full" style={{ background: colors.gradients.background.radial }}></div>
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} projects={[]} userStats={userStats} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Topbar */}
          <Topbar 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />

          {/* MyBlogs Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
              {/* Header with Add Blog Button */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">
                  <span style={getGradientTextStyles('secondary')}>
                    My Blogs
                  </span>
                </h1>
                
                <button
                  onClick={() => setShowBlogForm(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  style={getButtonStyles('primary')}
                  onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' })}
                  onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' })}
                >
                  <Plus size={20} />
                  Add New Blog
                </button>
              </div>

              {/* Custom Alert Component */}
              {alert.show && (
                <div 
                  className="fixed top-4 right-4 z-50 w-96 rounded-xl shadow-2xl border-l-4 transition-all duration-300 transform"
                  style={{
                    backgroundColor: colors.background.card,
                    borderLeftColor: alert.type === 'success' 
                      ? colors.accent.green[400] 
                      : alert.type === 'error' 
                      ? colors.status.error.background 
                      : colors.accent.yellow[400],
                    animation: 'slideInRight 0.3s ease-out'
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {alert.type === 'success' && (
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: colors.accent.green[400] }}
                          >
                            <svg className="w-4 h-4" style={{ color: colors.background.primary }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {alert.type === 'error' && (
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: colors.status.error.background }}
                          >
                            <svg className="w-4 h-4" style={{ color: colors.background.primary }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {alert.type === 'warning' && (
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: colors.accent.yellow[400] }}
                          >
                            <svg className="w-4 h-4" style={{ color: colors.background.primary }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold mb-1" style={{ color: colors.text.primary }}>
                          {alert.title}
                        </h4>
                        <p className="text-sm" style={{ color: colors.text.secondary }}>
                          {alert.message}
                        </p>
                      </div>
                      <button
                        onClick={() => setAlert({ show: false, type: '', title: '', message: '' })}
                        className="flex-shrink-0 ml-2 p-1 rounded-lg transition-colors"
                        style={{ color: colors.text.muted }}
                        onMouseEnter={(e) => e.target.style.color = colors.text.primary}
                        onMouseLeave={(e) => e.target.style.color = colors.text.muted}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Blog Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Blogs', count: userStats.blogs.total, color: colors.primary.blue[400] },
                  { label: 'Published', count: userStats.blogs.published, color: colors.accent.green[400] },
                  { label: 'Drafts', count: userStats.blogs.draft, color: colors.accent.yellow[400] },
                  { label: 'Archived', count: userStats.blogs.archived, color: colors.text.disabled },
                ].map((stat, index) => (
                  <div key={index} className="rounded-xl p-4" style={getCardStyles('glass')}>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
                        {stat.count}
                      </div>
                      <div className="text-sm" style={{ color: colors.text.secondary }}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blog Form Modal */}
              {showBlogForm && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center p-4" 
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowBlogForm(false);
                    }
                  }}
                >
                  <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl" style={getCardStyles('glass')}>
                    <div className="sticky top-0 flex items-center justify-between p-6 border-b" style={{ 
                      backgroundColor: colors.background.glass, 
                      borderColor: colors.border.light,
                      backdropFilter: 'blur(20px)'
                    }}>
                      <h2 className="text-2xl font-semibold" style={{ color: colors.text.primary }}>Create New Blog</h2>
                      <button 
                        onClick={() => setShowBlogForm(false)} 
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: colors.text.muted }}
                        onMouseEnter={(e) => e.target.style.color = colors.text.primary}
                        onMouseLeave={(e) => e.target.style.color = colors.text.muted}
                      >
                        <X size={24} />
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <BlogForm 
                        formData={formData}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onCancel={() => setShowBlogForm(false)}
                        isEditing={false}
                        loading={submitLoading}
                        error={null}
                        success={false}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Blog Form */}
              {editingBlog && (
                <form onSubmit={handleUpdate} className="max-w-4xl mx-auto rounded-xl p-8 mb-8 shadow-lg" style={getCardStyles('glass')}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold" style={{ color: colors.text.primary }}>Edit Blog</h2>
                    <button type="button" onClick={cancelForm} className="text-2xl transition-colors" style={{ color: colors.text.muted }}
                      onMouseEnter={(e) => e.target.style.color = colors.text.primary}
                      onMouseLeave={(e) => e.target.style.color = colors.text.muted}>
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                        placeholder="Blog Title" 
                        className="w-full p-3 rounded-lg transition-all duration-200"
                        style={getInputStyles()}
                        onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                        onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <textarea 
                        name="excerpt" 
                        value={formData.excerpt} 
                        onChange={handleChange} 
                        rows={3} 
                        placeholder="Brief excerpt or summary" 
                        className="w-full p-3 rounded-lg transition-all duration-200"
                        style={getInputStyles()}
                        onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                        onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                      />
                    </div>

                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange} 
                      className="p-3 rounded-lg transition-all duration-200"
                      style={getInputStyles()}
                      onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                      onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                    >
                      <option value="Research">Research</option>
                      <option value="Technology">Technology</option>
                      <option value="Academia">Academia</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Opinion">Opinion</option>
                      <option value="News">News</option>
                      <option value="Review">Review</option>
                      <option value="Personal">Personal</option>
                    </select>

                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange} 
                      className="p-3 rounded-lg transition-all duration-200"
                      style={getInputStyles()}
                      onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                      onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>

                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        name="tags" 
                        value={formData.tags} 
                        onChange={handleChange} 
                        placeholder="Tags (comma separated)" 
                        className="w-full p-3 rounded-lg transition-all duration-200"
                        style={getInputStyles()}
                        onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                        onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <textarea 
                        name="content" 
                        value={formData.content} 
                        onChange={handleChange} 
                        required 
                        rows={12} 
                        placeholder="Write your blog content here..." 
                        className="w-full p-3 rounded-lg transition-all duration-200"
                        style={getInputStyles()}
                        onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                        onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button 
                      type="submit" 
                      disabled={updateLoading}
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                      style={updateLoading ? getButtonStyles('primary', true) : getButtonStyles('primary')}
                      onMouseEnter={!updateLoading ? (e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' }) : undefined}
                      onMouseLeave={!updateLoading ? (e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' }) : undefined}
                    >
                      {updateLoading ? (
                        <>
                          <div 
                            className="w-4 h-4 border-2 rounded-full animate-spin"
                            style={{
                              borderColor: `${colors.button.primary.text}4D`,
                              borderTopColor: colors.button.primary.text,
                            }}
                          />
                          Updating...
                        </>
                      ) : (
                        'Update Blog'
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={cancelForm} 
                      disabled={updateLoading}
                      className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                      style={updateLoading ? getButtonStyles('outline', true) : getButtonStyles('outline')}
                      onMouseEnter={!updateLoading ? (e) => Object.assign(e.target.style, getButtonStyles('outline'), { backgroundColor: colors.button.outline.backgroundHover }) : undefined}
                      onMouseLeave={!updateLoading ? (e) => Object.assign(e.target.style, getButtonStyles('outline')) : undefined}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Delete Confirmation Modal */}
              {deletingBlog && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center p-4" 
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      cancelDelete();
                    }
                  }}
                >
                  <div className="relative w-full max-w-md rounded-xl p-6 shadow-2xl" style={getCardStyles('glass')}>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4" style={{ backgroundColor: colors.status.error.background }}>
                        <Trash2 size={24} style={{ color: colors.status.error.text }} />
                      </div>
                      
                      <h3 className="text-lg font-medium mb-2" style={{ color: colors.text.primary }}>
                        Delete Blog
                      </h3>
                      
                      <p className="text-sm mb-6" style={{ color: colors.text.secondary }}>
                        Are you sure you want to delete "<span style={{ color: colors.text.primary, fontWeight: '500' }}>{deletingBlog.title}</span>"? This action cannot be undone.
                      </p>
                      
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={cancelDelete}
                          className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                          style={getButtonStyles('outline')}
                          onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('outline'), { backgroundColor: colors.button.outline.backgroundHover })}
                          onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('outline'))}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(deletingBlog._id)}
                          className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                          style={getButtonStyles('danger')}
                          onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('danger'), { transform: 'scale(1.02)' })}
                          onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('danger'), { transform: 'scale(1)' })}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Blogs Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary.blue[400] }}></div>
                  <p className="mt-4" style={{ color: colors.text.primary }}>Loading your blogs...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p style={{ color: colors.status.error.text }}>{error}</p>
                </div>
              ) : blogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Plus size={48} style={{ color: colors.text.muted, margin: '0 auto' }} />
                  </div>
                  <p className="text-lg mb-4" style={{ color: colors.text.primary }}>No blogs found</p>
                  <p className="mb-6" style={{ color: colors.text.secondary }}>Create your first blog post to get started!</p>
                  <button
                    onClick={() => setShowBlogForm(true)}
                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                    style={getButtonStyles('primary')}
                    onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' })}
                    onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' })}
                  >
                    Create Your First Blog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((blog) => (
                    <div key={blog._id} className="relative group">
                      <BlogCard 
                        {...blog} 
                        author={blog.author?.name || 'Unknown'}
                        createdAt={blog.createdAt}
                      />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEditing(blog)} 
                          title="Edit" 
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: `${colors.status.warning.background}`, color: colors.status.warning.text }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = colors.primary.blue[600]}
                          onMouseLeave={(e) => e.target.style.backgroundColor = colors.status.warning.background}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(blog)} 
                          title="Delete" 
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: `${colors.status.error.background}`, color: colors.status.error.text }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = colors.button.danger.background}
                          onMouseLeave={(e) => e.target.style.backgroundColor = colors.status.error.background}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
