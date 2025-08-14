import React, { useEffect, useState } from "react";
import axios from "../axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/DashboardSidebar";
import Topbar from "../components/DashboardTopbar";
import ConfirmModal from "../components/ConfirmModal";
import CollaboratorsCard from "../components/CollaboratorsCard";

export default function CollaborationRequestsPage() {
  const { user: currentUser, logout } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Pagination states
  const [receivedPage, setReceivedPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);
  const pageSize = 5;

  const [confirmData, setConfirmData] = useState({ open: false, id: null, type: null });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteClick = (id, type) => {
    setConfirmData({ open: true, id, type });
  };

  const handleDeleteConfirmed = async () => {
    try {
      await axios.delete(`/collaborations/cancel/${confirmData.id}`);
      if (confirmData.type === "received") {
        setReceivedRequests((prev) => prev.filter((req) => req._id !== confirmData.id));
      } else {
        setSentRequests((prev) => prev.filter((req) => req._id !== confirmData.id));
      }
    } catch (err) {
      console.error("Error deletling request:", err);
    }
  };


  
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const [receivedRes, sentRes] = await Promise.all([
          axios.get("/collaborations/requests?type=received"),
          axios.get("/collaborations/requests?type=sent"),
        ]);

        setReceivedRequests(receivedRes.data.data || []);
        setSentRequests(sentRes.data.data || []);
      } catch (err) {
        console.error("Error fetching collaboration requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Pagination helper
  const paginate = (data, page) => data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex" style={{ backgroundColor: colors.background.main }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <ConfirmModal
        isOpen={confirmData.open}
        onClose={() => setConfirmData({ open: false, id: null, type: null })}
        onConfirm={handleDeleteConfirmed}
        title="Confirm Deletion"
        message="Are you sure you want to delete this request?"
        colors={colors}
      />

      <div className="flex-1 flex flex-col">
        <Topbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          user={currentUser}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        <div className="p-6 space-y-8">
          {loading ? (
            <p style={{ color: colors.text.primary }}>Loading collaboration requests...</p>
          ) : (
            <>
              {/* Total received requests */}
              <div
                className="p-4 rounded-lg shadow"
                style={{
                  backgroundColor: colors.background.card,
                  color: colors.text.primary,
                }}
              >
                <h2 className="text-lg font-bold">
                  You have {receivedRequests.length} request(s) received
                </h2>
              </div>

              {/* Received Requests */}
              <section>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Received Requests
                </h3>
                {receivedRequests.length === 0 ? (
                  <p style={{ color: colors.text.secondary }}>No requests received.</p>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {paginate(receivedRequests, receivedPage).map((req) => (
                        <li
                          key={req._id}
                          className="p-4 rounded-lg shadow flex flex-col gap-4"
                          style={{ backgroundColor: colors.background.card }}
                        >
                          {/* Sender details without profile picture */}
                          <CollaboratorsCard
                            student={{ ...req.requester, profileImage: null }}
                            showProjects={true}
                            showPublications={false}
                            compact={true}
                          />

                          {/* Message & Actions */}
                          <div className="flex justify-between items-center">
                            <div>
                              <p style={{ color: colors.text.secondary }}>
                                <strong>Message:</strong> {req.message}
                              </p>
                              <p style={{ color: colors.text.primary }}>
                                <strong>Status:</strong> {req.status}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteClick(req._id, "received")}
                              style={{
                                backgroundColor: colors.error?.main || "red",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Pagination controls */}
                    <div className="flex justify-between mt-4">
                      <button
                        disabled={receivedPage === 1}
                        onClick={() => setReceivedPage((p) => p - 1)}
                        style={{
                          backgroundColor: "green",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          opacity: receivedPage === 1 ? 0.5 : 1,
                        }}
                      >
                        Previous
                      </button>
                      <button
                        disabled={receivedPage * pageSize >= receivedRequests.length}
                        onClick={() => setReceivedPage((p) => p + 1)}
                        style={{
                          backgroundColor: "green",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          opacity:
                            receivedPage * pageSize >= receivedRequests.length
                              ? 0.5
                              : 1,
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </section>

              {/* Sent Requests */}
              <section>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Sent Requests & Status
                </h3>
                {sentRequests.length === 0 ? (
                  <p style={{ color: colors.text.secondary }}>No requests sent.</p>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {paginate(sentRequests, sentPage).map((req) => (
                        <li
                          key={req._id}
                          className="p-4 rounded-lg shadow flex flex-col gap-4"
                          style={{ backgroundColor: colors.background.card }}
                        >
                          {/* Receiver details without profile picture */}
                          <CollaboratorsCard
                            student={{ ...req.recipient, profileImage: null }}
                            showProjects={true}
                            showPublications={false}
                            compact={true}
                          />

                          {/* Message & Actions */}
                          <div className="flex justify-between items-center">
                            <div>
                              <p style={{ color: colors.text.secondary }}>
                                <strong>Message:</strong> {req.message}
                              </p>
                              <p style={{ color: colors.text.primary }}>
                                <strong>Status:</strong> {req.status}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteClick(req._id, "sent")}
                              style={{
                                backgroundColor: colors.error?.main || "red",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Pagination controls */}
                    <div className="flex justify-between mt-4">
                      <button
                        disabled={sentPage === 1}
                        onClick={() => setSentPage((p) => p - 1)}
                        style={{
                          backgroundColor: "green",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          opacity: sentPage === 1 ? 0.5 : 1,
                        }}
                      >
                        Previous
                      </button>
                      <button
                        disabled={sentPage * pageSize >= sentRequests.length}
                        onClick={() => setSentPage((p) => p + 1)}
                        style={{
                          backgroundColor: "green",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          opacity:
                            sentPage * pageSize >= sentRequests.length
                              ? 0.5
                              : 1,
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
