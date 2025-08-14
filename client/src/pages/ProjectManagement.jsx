import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../axios";
import { Trash2, PlusCircle } from "lucide-react";
import { colors } from "../styles/colors";
import {
  getButtonStyles,
  getCardStyles,
  getGradientTextStyles,
  getInputStyles,
} from "../styles/styleUtils";
import { useAlert } from "../context/AlertContext";

import Sidebar from "../components/DashboardSidebar";
import Topbar from "../components/DashboardTopbar";

export default function ProjectManagement() {
  const { user, logout, token } = useAuth(); // assuming your AuthContext exposes token
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [deletingProject, setDeletingProject] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);

  const [formData, setFormData] = useState({ title: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 10;
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);

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

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/projects", { headers: authHeader });
      setProjects(res.data?.data || []);
      setCurrentPage(1);
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to load projects";
      setError(msg);
      showAlert("error", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ title: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Attach creator ID
      const projectData = {
        ...formData,
        creator: user?._id,
      };

      await axios.post("/projects", projectData, { headers: authHeader });
      showAlert("success", "Project created successfully");
      setCreatingProject(false);
      setFormData({ title: "" });
      fetchProjects();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to create project";
      showAlert("error", msg);
    }
  };

  const confirmDelete = (project) => setDeletingProject(project);
  const cancelDelete = () => setDeletingProject(null);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/projects/${id}`, { headers: authHeader });
      setDeletingProject(null);
      showAlert("success", "Project deleted successfully");
      fetchProjects();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to delete project";
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
                  <span style={getGradientTextStyles("secondary")}>
                    Project Management
                  </span>
                </h1>
                <button
                  onClick={() => setCreatingProject(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={getButtonStyles("primary")}
                >
                  <PlusCircle size={20} /> Create Project
                </button>
              </div>

              {/* Create Project Form */}
              {creatingProject && (



           <form
  onSubmit={handleCreate}
  className="max-w-2xl mx-auto rounded-xl p-8 mb-8 shadow-lg"
  style={getCardStyles("glass")}
  encType="multipart/form-data"
>
  <div className="space-y-4">
    {/* Project Title */}
    <input
      type="text"
      name="title"
      value={formData.title}
      onChange={handleChange}
      placeholder="Project Title"
      required
      className="w-full p-3 rounded-lg"
      style={getInputStyles()}
    />

    {/* Project Description */}
    <textarea
      name="description"
      value={formData.description || ""}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      placeholder="Project Description"
      required
      className="w-full p-3 rounded-lg resize-none"
      style={getInputStyles()}
      rows={4}
    />

    {/* Project Link */}
    <input
      type="url"
      name="link"
      value={formData.link || ""}
      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
      placeholder="Project Link (optional)"
      className="w-full p-3 rounded-lg"
      style={getInputStyles()}
    />

    {/* Tags */}
    <input
      type="text"
      name="tags"
      value={formData.tags || ""}
      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
      placeholder="Tags (comma separated)"
      className="w-full p-3 rounded-lg"
      style={getInputStyles()}
    />

    {/* Status */}
    <select
      name="status"
      value={formData.status || "Planned"}
      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
      className="w-full p-3 rounded-lg"
      style={getInputStyles()}
    >
      <option value="Planned">Planned</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>

    {/* Collaborators */}
    <input
      type="text"
      name="collaborators"
      value={formData.collaborators || ""}
      onChange={(e) => setFormData({ ...formData, collaborators: e.target.value })}
      placeholder="Collaborators (comma separated emails or names)"
      className="w-full p-3 rounded-lg"
      style={getInputStyles()}
    />

    {/* Thesis Draft PDF Upload */}
    <input
      type="file"
      name="thesisPdf"
      accept="application/pdf"
      onChange={(e) => setFormData({ ...formData, thesisPdf: e.target.files[0] })}
      className="w-full p-3 rounded-lg"
      style={getInputStyles()}
    />
  </div>

  <div className="flex justify-end gap-3 mt-6">
    <button
      type="button"
      className="px-3 py-1 rounded-full text-sm font-medium"
      onClick={() => setCreatingProject(false)}
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
              {deletingProject && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  <div
                    className="w-full max-w-md rounded-xl p-6 shadow-2xl flex flex-col gap-4"
                    style={getCardStyles("glass")}
                  >
                    <h3 className="text-lg font-medium mb-2" style={{ color: colors.text.primary }}>
                      Delete Project
                    </h3>
                    <p style={{ color: colors.text.secondary }}>
                      Are you sure you want to delete <strong>{deletingProject.title}</strong>?
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        onClick={cancelDelete}
                        style={getButtonStyles("secondary")}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        onClick={() => handleDelete(deletingProject._id)}
                        style={getButtonStyles("danger")}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Projects Table */}
              {loading ? (
                <p className="text-center" style={{ color: colors.text.primary }}>Loading...</p>
              ) : error ? (
                <p className="text-center" style={{ color: colors.status.error.text }}>{error}</p>
              ) : projects.length === 0 ? (
                <p className="text-center" style={{ color: colors.text.primary }}>No projects found.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table
                      className="min-w-full rounded-lg overflow-hidden shadow-lg"
                      style={{ backgroundColor: colors.background.secondary, color: colors.text.primary }}
                    >
                      <thead style={{ backgroundColor: colors.background.secondary }}>
                        <tr>
                          <th className="px-6 py-3 text-left">Title</th>
                          <th className="px-6 py-3 text-left">Owner</th>
                          <th className="px-6 py-3 text-left">Collaborators</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProjects.map((p) => (
                          <tr key={p._id} style={{ borderBottom: `1px solid ${colors.border.muted}` }}>
                            <td className="px-6 py-4">{p.title}</td>
                            <td className="px-6 py-4">{p.creator?.name || "Unknown"}</td>
                            <td className="px-6 py-4">No collaborators</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                onClick={() => confirmDelete(p)}
                                style={getButtonStyles("danger")}
                              >
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
                        style={getButtonStyles(currentPage === i + 1 ? "primary" : "secondary")}
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
