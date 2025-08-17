import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../axios";
import { Trash2, UserPlus } from "lucide-react";
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

export default function UserManagement() {
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [deletingUser, setDeletingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const totalPages = Math.ceil(users.length / usersPerPage);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

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

  const fetchUsers = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await axios.get("/users");
    const filteredUsers = (res.data?.data || []).filter(user => user.role !== "admin");
    setUsers(filteredUsers);
    setCurrentPage(1);
    showAlert("success", "Users loaded successfully");
  } catch (err) {
    const msg = err.response?.data?.msg || "Failed to load users";
    setError(msg);
    showAlert("error", msg);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register", formData);
      showAlert("success", "User created successfully");
      setCreatingUser(false);
      setFormData({ name: "", email: "", role: "student", password: "" });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to create user";
      showAlert("error", msg);
    }
  };

  const confirmDelete = (user) => setDeletingUser(user);
  const cancelDelete = () => setDeletingUser(null);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/users/${id}`);
      setDeletingUser(null);
      showAlert("success", "User deleted successfully");
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to delete user";
      showAlert("error", msg);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: colors.background.radial }}>
      <div className="absolute inset-0" style={{ opacity: 0.3, pointerEvents: "none" }}>
        <div className="h-full w-full" style={{ background: colors.gradients.background.radial  , color: colors.text.primary }}></div>
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
                    User Management
                  </span>
                </h1>
                <button
                  onClick={() => setCreatingUser(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={getButtonStyles("primary")}
                >
                  <UserPlus size={20} /> Create User
                </button>
              </div>

              {/* Create User Form */}
              {creatingUser && (
                <form
                  onSubmit={handleCreate}
                  className="max-w-2xl mx-auto rounded-xl p-8 mb-8 shadow-lg"
                  style={getCardStyles("glass")}
                >
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name"
                      required
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      required
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      required
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full p-3 rounded-lg"
                      style={getInputStyles()}
                    >
                      <option value="student">Student</option>
                      <option value="mentor">Mentor</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                        className="px-3 py-1 rounded-full text-sm font-medium"
                      type="button"
                      onClick={() => {
                        setCreatingUser(false);
                        setFormData({ name: "", email: "", role: "student", password: "" });
                      }}
                      style={getButtonStyles("secondary")}
                    >
                      Cancel
                    </button>
                    <button type="submit" 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={getButtonStyles("primary")}>
                      Create
                    </button>
                  </div>
                </form>
              )}

              {/* Delete Confirmation */}
              {deletingUser && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  <div
                    className="w-full max-w-md rounded-xl p-6 shadow-2xl flex flex-col gap-4"
                    style={getCardStyles("glass")}
                  >
                    <h3 className="text-lg font-medium mb-2" style={{ color: colors.text.primary }}>
                      Delete User
                    </h3>
                    <p style={{ color: colors.text.secondary }}>
                      Are you sure you want to delete <strong>{deletingUser.name}</strong>?
                    </p>
                    <div className="flex justify-center gap-3">
                      <button 
                              
                    className="px-3 py-1 rounded-full text-sm font-medium"
                      onClick={cancelDelete} style={getButtonStyles("secondary")}>
                        Cancel
                      </button>
                      <button 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                      
                      onClick={() => handleDelete(deletingUser._id)} style={getButtonStyles("danger")}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Table */}
              {loading ? (
                <p className="text-center" style={{ color: colors.text.primary }}>
                  Loading...
                </p>
              ) : error ? (
               
               <p className="text-center" style={{ color: colors.status.error.text }}>
                  {error}
                </p>
              ) : users.length === 0 ? (
                <p className="text-center" style={{ color: colors.text.primary }}>
                  No users found.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table
                      className="min-w-full rounded-lg overflow-hidden shadow-lg"
                      style={{ backgroundColor: colors.background.secondary, color: colors.text.primary }}
                    >
                      <thead style={{ backgroundColor: colors.background.secondary }}>
                        <tr>
                          <th className="px-6 py-3 text-left">Name</th>
                          <th className="px-6 py-3 text-left">Email</th>
                          <th className="px-6 py-3 text-left">Role</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map((u) => (
                          <tr key={u._id} style={{ borderBottom: `1px solid ${colors.border.muted}` }}>
                            <td className="px-6 py-4">{u.name}</td>
                            <td className="px-6 py-4">{u.email}</td>
                            <td className="px-6 py-4">
                              <span
                                style={getButtonStyles(u.role === "student" ? "primary" : "secondary")}
                                className="px-3 py-1 rounded-full text-sm font-medium"
                              >
                                {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                onClick={() => confirmDelete(u)}
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
                      className="px-3 py-1 rounded-full text-sm font-medium"

                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        style={getButtonStyles(currentPage === i + 1 ? "primary" : "secondary")}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-full text-sm font-medium"

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
