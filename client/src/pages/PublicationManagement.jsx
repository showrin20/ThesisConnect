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

export default function PublicationManagement() {
  const { user, logout, token } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [deletingPublication, setDeletingPublication] = useState(null);
  const [creatingPublication, setCreatingPublication] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    year: "",
    venue: "",
    type: "Journal",
    genre: "",
    quality: "N/A",
    tags: "",
    doi: "",
    abstract: "",
    citations: 0,
    location: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const publicationsPerPage = 8;
  const totalPages = Math.ceil(publications.length / publicationsPerPage);
  const indexOfLastPublication = currentPage * publicationsPerPage;
  const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage;
  const currentPublications = publications.slice(
    indexOfFirstPublication,
    indexOfLastPublication
  );

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

  const fetchPublications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/publications", { headers: authHeader });
      setPublications(res.data?.data || []);
      setCurrentPage(1);
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to load publications";
      setError(msg);
      showAlert("error", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const publicationData = {
        ...formData,
        authors: formData.authors
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        year: parseInt(formData.year, 10),
        citations: parseInt(formData.citations, 10) || 0,
        creator: user?._id,
      };

      await axios.post("/publications", publicationData, { headers: authHeader });
      showAlert("success", "Publication added successfully");
      setCreatingPublication(false);
      setFormData({
        title: "",
        authors: "",
        year: "",
        venue: "",
        type: "Journal",
        genre: "",
        quality: "N/A",
        tags: "",
        doi: "",
        abstract: "",
        citations: 0,
        location: "",
      });
      fetchPublications();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to add publication";
      showAlert("error", msg);
    }
  };

  const confirmDelete = (pub) => setDeletingPublication(pub);
  const cancelDelete = () => setDeletingPublication(null);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/publications/${id}`, { headers: authHeader });
      setDeletingPublication(null);
      showAlert("success", "Publication deleted successfully");
      fetchPublications();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to delete publication";
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

          <main className="flex-1 p-4 sm:p-6 max-h-screen overflow-y-auto">
            <div className="container mx-auto max-h-full flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  <span style={getGradientTextStyles("secondary")}>
                    Publication Management
                  </span>
                </h1>
                <button
                  onClick={() => setCreatingPublication(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm sm:text-base"
                  style={getButtonStyles("primary")}
                >
                  <PlusCircle size={20} /> Add Publication
                </button>
              </div>

              {/* Create Publication Form */}
              {creatingPublication && (
                <form
                  onSubmit={handleCreate}
                  className="w-full max-w-3xl mx-auto rounded-xl p-4 sm:p-6 md:p-8 mb-8 shadow-lg"
                  style={{ ...getCardStyles("glass"), maxHeight: "80vh", overflowY: "auto" }}
                >
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Title"
                      required
                      className="w-full p-3 rounded-lg break-words whitespace-normal text-sm sm:text-base"
                      style={{ ...getInputStyles() }}
                    />

                    <input
                      type="text"
                      name="authors"
                      value={formData.authors}
                      onChange={handleChange}
                      placeholder="Authors (comma separated)"
                      required
                      className="w-full p-3 rounded-lg break-words whitespace-normal text-sm sm:text-base"
                      style={getInputStyles()}
                    />

                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="Year"
                      required
                      className="w-full p-3 rounded-lg text-sm sm:text-base"
                      style={getInputStyles()}
                    />

                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      placeholder="Venue (Conference/Journal)"
                      required
                      className="w-full p-3 rounded-lg break-words whitespace-normal text-sm sm:text-base"
                      style={getInputStyles()}
                    />

                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg text-sm sm:text-base"
                      style={getInputStyles()}
                    >
                      <option>Journal</option>
                      <option>Conference</option>
                      <option>Workshop</option>
                      <option>Book Chapter</option>
                      <option>Other</option>
                    </select>

                    <input
                      type="text"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      placeholder="Genre (e.g. Machine Learning)"
                      className="w-full p-3 rounded-lg break-words whitespace-normal text-sm sm:text-base"
                      style={getInputStyles()}
                    />

                    <select
                      name="quality"
                      value={formData.quality}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg text-sm sm:text-base"
                      style={getInputStyles()}
                    >
                      <option>N/A</option>
                      <option>A*</option>
                      <option>A</option>
                      <option>Q1</option>
                      <option>Q2</option>
                      <option>Q3</option>
                      <option>Q4</option>
                    </select>

                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="Tags (comma separated)"
                      className="w-full p-3 rounded-lg break-words whitespace-normal text-sm sm:text-base"
                      style={getInputStyles()}
                    />

                    <input
                      type="text"
                      name="doi"
                      value={formData.doi}
                      onChange={handleChange}
                      placeholder="DOI"
                      className="w-full p-3 rounded-lg break-words whitespace-normal text-sm sm:text-base"
                      style={getInputStyles()}
                    />

                    <textarea
                      name="abstract"
                      value={formData.abstract}
                      onChange={handleChange}
                      placeholder="Abstract"
                      className="w-full p-3 rounded-lg resize-none break-words whitespace-normal text-sm sm:text-base"
                      rows={4}
                      style={getInputStyles()}
                    />

                    <input
                      type="number"
                      name="citations"
                      value={formData.citations}
                      onChange={handleChange}
                      placeholder="Citations"
                      className="w-full p-3 rounded-lg text-sm sm:text-base"
                      style={getInputStyles()}
                    />

                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Location"
                      className="w-full p-3 rounded-lg break-words whitespace-normal text-sm sm:text-base"
                      style={getInputStyles()}
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      onClick={() => setCreatingPublication(false)}
                      style={getButtonStyles("secondary")}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={getButtonStyles("primary")}
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              {/* Delete Confirmation */}
              {deletingPublication && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  <div
                    className="w-full max-w-md rounded-xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4"
                    style={getCardStyles("glass")}
                  >
                    <h3 className="text-lg font-medium mb-2" style={{ color: colors.text.primary }}>
                      Delete Publication
                    </h3>
                    <p className="break-words whitespace-normal text-sm sm:text-base" style={{ color: colors.text.secondary }}>
                      Are you sure you want to delete <strong>{deletingPublication.title}</strong>?
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
                        onClick={() => handleDelete(deletingPublication._id)}
                        style={getButtonStyles("danger")}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Publications Table */}
              {loading ? (
                <p className="text-center" style={{ color: colors.text.primary }}>Loading...</p>
              ) : error ? (
                <p className="text-center" style={{ color: colors.status.error.text }}>{error}</p>
              ) : publications.length === 0 ? (
                <p className="text-center" style={{ color: colors.text.primary }}>No publications found.</p>
              ) : (
                <>
                  <div className="overflow-x-auto flex-1 min-h-0">
                    <table
                      className="w-full rounded-lg overflow-hidden shadow-lg"
                      style={{
                        backgroundColor: colors.background.secondary,
                        color: colors.text.primary,
                        tableLayout: 'auto',
                        maxHeight: '60vh',
                        overflowY: 'auto',
                      }}
                    >
                      <thead style={{ backgroundColor: colors.background.secondary }}>
                        <tr>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-sm">Title</th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-sm">Year</th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-sm">Venue</th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-sm">Type</th>
                          <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPublications.map((p) => (
                          <tr
                            key={p._id}
                            style={{
                              borderBottom: `1px solid ${colors.border.muted}`,
                            }}
                          >
                                <td className="px-6 py-4">
                              {(() => {
                                if (!p.title) return null;
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
                            <td className="px-2 py-2 sm:px-4 sm:py-4 text-sm">{p.year}</td>
                            <td className="px-2 py-2 sm:px-4 sm:py-4 break-words whitespace-normal text-sm">
                              {p.venue}
                            </td>
                            <td className="px-2 py-2 sm:px-4 sm:py-4 text-sm">{p.type}</td>
                            <td className="px-2 py-2 sm:px-4 sm:py-4 text-right">
                              <button
                                className="px-2 py-1 rounded-full text-sm font-medium"
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