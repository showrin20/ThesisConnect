import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../axios";
import { Trash2, PlusCircle, Heart, MessageCircle } from "lucide-react";
import { colors } from "../styles/colors";
import {
  getButtonStyles,
  getCardStyles,
  getGradientTextStyles,
  getInputStyles,
  getStatusStyles,
  getStatusMessage,
} from "../styles/styleUtils";
import { useAlert } from "../context/AlertContext";

import Sidebar from "../components/DashboardSidebar";
import Topbar from "../components/DashboardTopbar";

export default function CommunityPostManagement() {
  const { user, logout, token } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [deletingPost, setDeletingPost] = useState(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [commentingPost, setCommentingPost] = useState(null);
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    type: "general",
    content: "",
    title: "",
    skillsNeeded: "",
    status: "open",
    tags: "",
    projectId: "",
  });

  const [commentData, setCommentData] = useState({ text: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const authHeader = { Authorization: `Bearer ${token}` };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      const message = getStatusMessage('auth', 'auth').logout;
      showAlert("success", message);
    } catch {
      const message = getStatusMessage('auth', 'auth').error;
      showAlert("error", message);
    } finally {
      navigate("/login");
      setIsLoggingOut(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/community-posts", {
        headers: authHeader,
        params: { page: currentPage, limit: postsPerPage },
      });
      setPosts(res.data?.data?.posts || []);
    } catch (err) {
      const msg = err.response?.data?.message || getStatusMessage('data', 'data').error;
      setError(msg);
      showAlert("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/projects/my-projects", { headers: authHeader });
      setProjects(res.data?.data || []);
    } catch (err) {
      const message = getStatusMessage('data', 'data').error;
      showAlert("error", message);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchProjects();
  }, [currentPage]); // refetch when page changes

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCommentChange = (e) => {
    setCommentData({ ...commentData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const postData = {
        ...formData,
        skillsNeeded: formData.skillsNeeded
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      };

      await axios.post("/community-posts", postData, { headers: authHeader });
      const message = getStatusMessage('create', 'create').success;
      showAlert("success", message);
      setCreatingPost(false);
      setFormData({
        type: "general",
        content: "",
        title: "",
        skillsNeeded: "",
        status: "open",
        tags: "",
        projectId: "",
      });
      setCurrentPage(1); // reset to first page after new post
      fetchPosts();
    } catch (err) {
      const msg = err.response?.data?.message || getStatusMessage('create', 'create').error;
      showAlert("error", msg);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`/community-posts/${postId}`, { headers: authHeader });
      setDeletingPost(null);
      const message = getStatusMessage('delete', 'data').success;
      showAlert("success", message);
      fetchPosts();
    } catch (err) {
      const msg = err.response?.data?.message || getStatusMessage('delete', 'data').error;
      showAlert("error", msg);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`/community-posts/${postId}/like`, {}, { headers: authHeader });
      fetchPosts();
    } catch (err) {
      const msg = err.response?.data?.message || getStatusMessage('general', 'general').error;
      showAlert("error", msg);
    }
  };

  const handleAddComment = async (postId) => {
    try {
      await axios.post(
        `/community-posts/${postId}/comments`,
        { text: commentData.text, commentId: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` },
        { headers: authHeader }
      );
      const message = getStatusMessage('create', 'create').success;
      showAlert("success", message);
      setCommentData({ text: "" });
      setCommentingPost(null);
      fetchPosts();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add comment";
      showAlert("error", msg);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: colors.background.radial }}>
      <div
        className="absolute inset-0"
        style={{ opacity: 0.3, pointerEvents: "none" }}
      >
        <div
          className="h-full w-full"
          style={{
            background: colors.gradients.background.radial,
            color: colors.text.primary,
          }}
        ></div>
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
                  <span style={getGradientTextStyles("secondary")}>
                    Community Post Management
                  </span>
                </h1>
                <button
                  onClick={() => setCreatingPost(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={getButtonStyles("primary")}
                >
                  <PlusCircle size={20} /> Create Post
                </button>
              </div>

              {/* Create Post Form */}
              {creatingPost && (
                <form
                  onSubmit={handleCreate}
                  className="max-w-2xl mx-auto rounded-xl p-6 mb-8 shadow-lg max-h-[80vh] overflow-y-auto"
                  style={getCardStyles("glass")}
                >
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Post Title"
                      className="w-full p-3 rounded-lg break-all"
                      style={getInputStyles()}
                    />

                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Content (max 300 characters)"
                      required
                      className="w-full p-3 rounded-lg resize-none"
                      rows={4}
                      style={getInputStyles()}
                    />

                    <input
                      type="text"
                      name="skillsNeeded"
                      value={formData.skillsNeeded}
                      onChange={handleChange}
                      placeholder="Skills Needed (comma separated)"
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    />

                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    >
                      <option value="general">General</option>
                      <option value="collab">Collaboration</option>
                    </select>

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>

                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="Tags (comma separated)"
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    />

                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    >
                      <option value="">No Project</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      onClick={() => setCreatingPost(false)}
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
              {deletingPost && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  <div
                    className="w-full max-w-md rounded-xl p-6 shadow-2xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
                    style={getCardStyles("glass")}
                  >
                    <h3 className="text-lg font-medium mb-2" style={{ color: colors.text.primary }}>
                      {user?.role === 'admin' && deletingPost?.authorId !== user?.id ? 'Delete Post (Admin)' : 'Delete Post'}
                    </h3>
                    <p style={{ color: colors.text.secondary }}>
                      {user?.role === 'admin' && deletingPost?.authorId !== user?.id ? (
                        <>
                          As an admin, you are about to delete a post by another user. 
                          Are you sure you want to delete <strong>{deletingPost.title || "this post"}</strong>?
                        </>
                      ) : (
                        <>
                          Are you sure you want to delete <strong>{deletingPost.title || "this post"}</strong>?
                        </>
                      )}
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        onClick={() => setDeletingPost(null)}
                        style={getButtonStyles("secondary")}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        onClick={() => handleDelete(deletingPost.postId)}
                        style={getButtonStyles("danger")}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comment Form */}
              {commentingPost && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  <div
                    className="w-full max-w-md rounded-xl p-6 shadow-2xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
                    style={getCardStyles("glass")}
                  >
                    <h3 className="text-lg font-medium mb-2" style={{ color: colors.text.primary }}>
                      Add Comment
                    </h3>
                    <textarea
                      name="text"
                      value={commentData.text}
                      onChange={handleCommentChange}
                      placeholder="Comment (max 500 characters)"
                      className="w-full p-3 rounded-lg resize-none"
                      rows={4}
                      style={getInputStyles()}
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        onClick={() => setCommentingPost(null)}
                        style={getButtonStyles("secondary")}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        onClick={() => handleAddComment(commentingPost.postId)}
                        style={getButtonStyles("primary")}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Posts Table */}
              {loading ? (
                <p className="text-center" style={{ color: colors.text.primary }}>Loading...</p>
              ) : error ? (
                <p className="text-center" style={{ color: colors.status.error.text }}>{error}</p>
              ) : posts.length === 0 ? (
                <p className="text-center" style={{ color: colors.text.primary }}>No posts found.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table
                      className="min-w-full rounded-lg overflow-hidden shadow-lg"
                      style={{
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary,
                      }}
                    >
                      <thead style={{ backgroundColor: colors.background.secondary }}>
                        <tr>
                          <th className="px-6 py-3 text-left">Community Post</th>
                          <th className="px-6 py-3 text-left">Type</th>
                          <th className="px-6 py-3 text-left">Likes</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPosts.map((p) => (
                          <tr
                            key={p.postId}
                            style={{
                              borderBottom: `1px solid ${colors.border.muted}`,
                            }}
                          >
                            <td className="px-6 py-4">
                              {(() => {
                                const content = p.content || "";
                                const words = content.split(" ");
                                const lines = [];
                                for (let i = 0; i < words.length; i += 10) {
                                  lines.push(words.slice(i, i + 10).join(" "));
                                }
                                return lines.map((line, idx) => (
                                  <span
                                    key={idx}
                                    style={{ display: "block", wordBreak: "break-word" }}
                                  >
                                    {line}
                                  </span>
                                ));
                              })()}
                            </td>
                            <td className="px-6 py-4">{p.type}</td>
                            <td className="px-6 py-4">{p.likes || 0}</td>
                            <td className="px-6 py-4 text-right flex gap-2 justify-end">
                              <button
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                onClick={() => handleLike(p.postId)}
                                style={getButtonStyles("secondary")}
                              >
                                <Heart size={16} />
                              </button>
                              <button
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                onClick={() => setCommentingPost(p)}
                                style={getButtonStyles("secondary")}
                              >
                                <MessageCircle size={16} />
                              </button>
                              {/* Show delete button only for post author or admin */}
                              {(p.authorId === user?.id || user?.role === 'admin') && (
                                <button
                                  className="px-3 py-1 rounded-full text-sm font-medium"
                                  onClick={() => setDeletingPost(p)}
                                  style={getButtonStyles("danger")}
                                  title={user?.role === 'admin' ? 'Delete post (Admin)' : 'Delete your post'}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center mt-4 gap-2">
                    <button
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      style={getButtonStyles("secondary")}
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={getButtonStyles(
                          currentPage === i + 1 ? "primary" : "secondary"
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      style={getButtonStyles("secondary")}
                    >
                      Next
                    </button>
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