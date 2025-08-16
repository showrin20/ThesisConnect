import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import axios from "../axios";
import { Trash2, PlusCircle } from "lucide-react";
import Sidebar from "../components/DashboardSidebar";
import Topbar from "../components/DashboardTopbar";
import {
  getButtonStyles,
  getCardStyles,
  getGradientTextStyles,
  getInputStyles,
} from "../styles/styleUtils";
import { colors } from "../styles/colors";

export default function BlogManagement() {
  const { user, logout, token } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  

  const [creatingBlog, setCreatingBlog] = useState(false);
  const [deletingBlog, setDeletingBlog] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "Research",
    tags: "",
    status: "draft",
    featuredImage: null,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 10;
  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

   const authHeader = { Authorization: `Bearer ${token}` };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      showAlert("success", "Logged out successfully");
    } catch {
      showAlert("error", "Logout failed");
    } finally {
      navigate("/login");
      setIsLoggingOut(false);
    }
  };



  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/blogs", { headers: authHeader });
      setBlogs(res.data?.data || []);
      setCurrentPage(1);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load blogs";
      setError(msg);
      showAlert("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !['image/jpeg','image/png','image/gif','image/webp'].includes(file.type)) {
      showAlert("error", "Invalid file type. Only JPEG, PNG, GIF, or WebP allowed.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      showAlert("error", "File size exceeds 5MB limit.");
      return;
    }
    setFormData((prev) => ({ ...prev, featuredImage: file }));
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val) data.append(key, val);
      });
      data.append("author", user?._id);

      await axios.post("/blogs", data, { headers: { ...authHeader, "Content-Type": "multipart/form-data" } });
      showAlert("success", "Blog created successfully");
      setCreatingBlog(false);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "Research",
        tags: "",
        status: "draft",
        featuredImage: null,
      });
      fetchBlogs();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create blog";
      showAlert("error", msg);
    }
  };

  const confirmDelete = (blog) => setDeletingBlog(blog);
  const cancelDelete = () => setDeletingBlog(null);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/blogs/${id}`, { headers: authHeader });
      setDeletingBlog(null);
      showAlert("success", "Blog deleted successfully");
      fetchBlogs();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete blog";
      showAlert("error", msg);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: colors.background.radial }}>
      <div className="absolute inset-0" style={{ opacity: 0.3, pointerEvents: "none" }}>
        <div className="h-full w-full" style={{ background: colors.gradients.background.radial, color: colors.text.primary }}></div>
      </div>

      <div className="relative flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col lg:ml-0">
      <Topbar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">
                  <span style={getGradientTextStyles("secondary")}>Blog Management</span>
                </h1>
                <button
                  onClick={() => setCreatingBlog(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={getButtonStyles("primary")}
                >
                  <PlusCircle size={20} /> Create Blog
                </button>
              </div>

              {/* Create Blog Form */}
              {creatingBlog && (
                <form
                  onSubmit={handleCreateBlog}
                  className="max-w-2xl mx-auto rounded-xl p-8 mb-8 shadow-lg"
                  style={getCardStyles("glass")}
                  encType="multipart/form-data"
                >
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="title"
                      placeholder="Blog Title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    />
                    <textarea
                      name="content"
                      placeholder="Content (min 20 chars)"
                      value={formData.content}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full p-3 rounded-lg resize-none"
                      style={getInputStyles()}
                    />
                    <textarea
                      name="excerpt"
                      placeholder="Excerpt (optional, max 300 chars)"
                      value={formData.excerpt}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-3 rounded-lg resize-none"
                      style={getInputStyles()}
                      maxLength={300}
                    />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    >
                      {["Research", "Technology", "Academia", "Tutorial", "Opinion", "News", "Review", "Personal"].map(
                        (cat) => <option key={cat} value={cat}>{cat}</option>
                      )}
                    </select>
                    <input
                      type="text"
                      name="tags"
                      placeholder="Tags (comma separated)"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    />
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    >
                      {["draft", "published", "archived"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <input
                      type="file"
                      name="featuredImage"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileChange}
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setCreatingBlog(false)}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={getButtonStyles("secondary")}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={getButtonStyles("primary")}
                    >
                      Create
                    </button>
                  </div>
                </form>
              )}

              {/* Delete Confirmation */}
              {deletingBlog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <div className="w-full max-w-md rounded-xl p-6 shadow-2xl flex flex-col gap-4" style={getCardStyles("glass")}>
                    <h3 className="text-lg font-medium mb-2" style={{ color: colors.text.primary }}>
                      Delete Blog
                    </h3>
                    <p style={{ color: colors.text.secondary }}>
                      Are you sure you want to delete <strong>{deletingBlog.title}</strong>?
                    </p>
                    <div className="flex justify-center gap-3">
                      <button className="px-3 py-1 rounded-full text-sm font-medium" onClick={cancelDelete} style={getButtonStyles("secondary")}>Cancel</button>
                      <button className="px-3 py-1 rounded-full text-sm font-medium" onClick={() => handleDelete(deletingBlog._id)} style={getButtonStyles("danger")}>Delete</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Blogs Table */}
              {loading ? (
                <p className="text-center" style={{ color: colors.text.primary }}>Loading...</p>
              ) : error ? (
                <p className="text-center" style={{ color: colors.status.error.text }}>{error}</p>
              ) : blogs.length === 0 ? (
                <p className="text-center" style={{ color: colors.text.primary }}>No blogs found.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full rounded-lg overflow-hidden shadow-lg" style={{ backgroundColor: colors.background.secondary, color: colors.text.primary }}>
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left">Title</th>
                          <th className="px-6 py-3 text-left">Category</th>
                          <th className="px-6 py-3 text-left">Status</th>
                          <th className="px-6 py-3 text-right">Views</th>
                          <th className="px-6 py-3 text-right">Likes</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentBlogs.map((b) => (
                          <tr key={b._id} style={{ borderBottom: `1px solid ${colors.border.muted}` }}>
                            <td className="px-6 py-4">{b.title}</td>
                            <td className="px-6 py-4">{b.category}</td>
                            <td className="px-6 py-4">{b.status}</td>
                            <td className="px-6 py-4 text-right">{b.views || 0}</td>
                            <td className="px-6 py-4 text-right">{b.likes || 0}</td>
                            <td className="px-6 py-4 text-right">
                              <button className="px-3 py-1 rounded-full text-sm font-medium" onClick={() => confirmDelete(b)} style={getButtonStyles("danger")}>
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center mt-4 gap-2">
                    <button className="px-3 py-1 rounded-full text-sm font-medium" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} style={getButtonStyles("secondary")}>Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)} className="px-3 py-1 rounded-full text-sm font-medium" style={getButtonStyles(currentPage === i + 1 ? "primary" : "secondary")}>
                        {i + 1}
                      </button>
                    ))}
                    <button className="px-3 py-1 rounded-full text-sm font-medium" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} style={getButtonStyles("secondary")}>Next</button>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
