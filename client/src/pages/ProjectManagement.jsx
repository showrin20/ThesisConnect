import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../axios";
import { Trash2, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { colors } from "../styles/colors";
import {
  getButtonStyles,
  getCardStyles,
  getGradientTextStyles,
} from "../styles/styleUtils";
import { useAlert } from "../context/AlertContext";
import Sidebar from "../components/DashboardSidebar";
import Topbar from "../components/DashboardTopbar";
import ProjectForm from "../components/ProjectForm";

export default function ProjectManagement() {
  const { user, logout, token } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 8;
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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleProjectCreated = () => {
    setCreatingProject(false);
    fetchProjects();
  };

  // Helper function to render collaborators
  const renderCollaborators = (collaborators) => {
    if (!collaborators || collaborators.length === 0) {
      return "No collaborators";
    }
    if (Array.isArray(collaborators)) {
      return collaborators
        .map((collaborator, index) =>
          typeof collaborator === "object" && collaborator?.name
            ? collaborator.name
            : collaborator
        )
        .filter((name) => name)
        .join(", ") || "No collaborators";
    }
    return collaborators;
  };

  return (
    <div className="min-h-screen" style={{ background: colors.background.radial }}>
      <div className="absolute inset-0" style={{ opacity: 0.3, pointerEvents: "none" }}>
        <div className="h-full w-full" style={{ background: colors.gradients.background.radial }}></div>
      </div>

      <div className="relative flex h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col lg:ml-0">
          <Topbar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            user={user || {}} // Pass empty object as fallback to avoid undefined
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

              {/* Project Form */}
              {creatingProject && (
                <div
                  className="max-w-2xl mx-auto rounded-xl p-8 mb-8 shadow-lg"
                  style={getCardStyles("glass")}
                >
                  <ProjectForm onProjectCreated={handleProjectCreated} />
                  <div className="flex justify-end mt-6">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      onClick={() => setCreatingProject(false)}
                      style={getButtonStyles("secondary")}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
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
                      Are you sure you want to delete <strong>{deletingProject.title || "this project"}</strong>?
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
                            <td className="px-6 py-4">
                              {(() => {
                                if (!p.title) return "Untitled";
                                const words = p.title.split(' ');
                                const lines = [];
                                for (let i = 0; i < words.length; i += 7) {
                                  lines.push(words.slice(i, i + 7).join(' '));
                                }
                                return lines.map((line, idx) => (
                                  <span key={idx} style={{ display: 'block', wordBreak: 'break-word' }}>{line}</span>
                                ));
                              })()}
                            </td>
                            <td className="px-6 py-4">{p.creator?.name || "Unknown"}</td>
                            <td className="px-6 py-4">{renderCollaborators(p.collaborators)}</td>
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

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50"
                        style={{
                          backgroundColor: currentPage === 1 ? colors.background.glass : colors.button.primary.background,
                          color: colors.button.primary.text,
                          border: `1px solid ${colors.border.primary}`
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== 1) {
                            e.target.style.backgroundColor = colors.button.primary.backgroundHover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== 1) {
                            e.target.style.backgroundColor = colors.button.primary.background;
                          }
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className="px-3 py-2 rounded-lg transition-all duration-200 shadow-sm"
                            style={{
                              backgroundColor: currentPage === page ? colors.primary.blue[500] : colors.background.card,
                              color: currentPage === page ? colors.button.primary.text : colors.text.secondary,
                              border: `1px solid ${colors.border.primary}`
                            }}
                            onMouseEnter={(e) => {
                              if (currentPage !== page) {
                                e.target.style.backgroundColor = colors.surface.muted;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentPage !== page) {
                                e.target.style.backgroundColor = colors.background.card;
                              }
                            }}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-50"
                        style={{
                          backgroundColor: currentPage === totalPages ? colors.background.glass : colors.button.primary.background,
                          color: colors.button.primary.text,
                          border: `1px solid ${colors.border.primary}`
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== totalPages) {
                            e.target.style.backgroundColor = colors.button.primary.backgroundHover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== totalPages) {
                            e.target.style.backgroundColor = colors.button.primary.background;
                          }
                        }}
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}