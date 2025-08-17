import React, { useEffect, useState } from "react";
import axios from "../axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/DashboardSidebar";
import Topbar from "../components/DashboardTopbar";
import ConfirmModal from "../components/ConfirmModal";
import CollaboratorsCard from "../components/CollaboratorsCard";
import CollaborationResponseModal from "../components/CollaborationResponseModal";
import { Check, X, Trash2 } from "lucide-react";

export default function CollaborationRequestsPage() {
  const { user: currentUser, logout } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Display limit for grid layout
  const maxDisplayRequests = 2; // 2 rows × 2 columns per page
  
  // Pagination state
  const [receivedPage, setReceivedPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);

  const [confirmData, setConfirmData] = useState({ open: false, id: null, type: null });
  const [responseModal, setResponseModal] = useState({ 
    open: false, 
    request: null 
  });
  const [responding, setResponding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
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
      // Error deleting request
    }
  };

  const handleResponseClick = (request) => {
    setResponseModal({ open: true, request });
  };

  const handleRespond = async (status, responseMessage) => {
    try {
      setResponding(true);
      await axios.put(`/collaborations/respond/${responseModal.request._id}`, {
        status,
        responseMessage
      });
      
      // Remove the request from received list
      setReceivedRequests((prev) => 
        prev.filter((req) => req._id !== responseModal.request._id)
      );
      
      setResponseModal({ open: false, request: null });
      
      // Refresh the data to show updated status
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      // Error responding to request
    } finally {
      setResponding(false);
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
        // Reset page numbers when data refreshes
        setReceivedPage(1);
        setSentPage(1);
      } catch (err) {
        // Error fetching collaboration requests
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [refreshKey]);

  // Helper to paginate requests for grid layout
  const paginateRequests = (data, page, pageSize) => {
    const startIndex = (page - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  };
  
  // Calculate total pages
  const totalReceivedPages = Math.ceil(receivedRequests.length / maxDisplayRequests);
  const totalSentPages = Math.ceil(sentRequests.length / maxDisplayRequests);
  
  // Pagination navigation functions
  const goToReceivedPage = (page) => {
    setReceivedPage(Math.max(1, Math.min(page, totalReceivedPages)));
  };
  
  const goToSentPage = (page) => {
    setSentPage(Math.max(1, Math.min(page, totalSentPages)));
  };

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
      <CollaborationResponseModal
        isOpen={responseModal.open}
        onClose={() => setResponseModal({ open: false, request: null })}
        request={responseModal.request}
        onRespond={handleRespond}
        loading={responding}
        projectId={responseModal.request?.projectId}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginateRequests(receivedRequests, receivedPage, maxDisplayRequests).map((req) => (
                        <div
                          key={req._id}
                          className="p-4 rounded-lg shadow flex flex-col gap-3"
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
                          <div className="flex flex-col gap-3">
                            <div>
                              <p style={{ color: colors.text.secondary }}>
                                <strong>Message:</strong> {req.message}
                              </p>
                              <p style={{ color: colors.text.primary }}>
                                <strong>Status:</strong> {req.status}
                              </p>
                              {req.projectId && (
                                <div className="mt-2 p-2 rounded-lg" style={{ 
                                  backgroundColor: colors.primary?.blue?.[500] || '#3b82f6',
                                  color: 'white'
                                }}>
                                  <p className="text-xs font-medium">Project Collaboration Request</p>
                                  <p className="text-xs opacity-80">
                                    {req.projectId.title ? `Project: ${req.projectId.title}` : 'This request is for a specific project'}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Action buttons based on status */}
                            <div className="flex items-center justify-between">
                              {req.status === 'pending' ? (
                                <button
                                  onClick={() => handleResponseClick(req)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                                  style={{
                                    backgroundColor: colors.primary?.blue?.[900] || '#3b82f6'
                                  }}
                                >
                                  <Check size={16} />
                                  Respond
                                </button>
                              ) : (
                                <div 
                                  className="px-4 py-2 rounded-lg text-sm font-medium"
                                  style={{
                                    backgroundColor: req.status === 'accepted' 
                                      ? `${colors.accent?.green?.[500] || '#22c55e'}20`
                                      : `${colors.accent?.red?.[500] || '#ef4444'}20`,
                                    color: req.status === 'accepted'
                                      ? colors.accent?.green?.[500] || '#22c55e'
                                      : colors.accent?.red?.[500] || '#ef4444'
                                  }}
                                >
                                  {req.status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
                                </div>
                              )}
                              
                              <button
                                onClick={() => handleDeleteClick(req._id, "received")}
                                className="p-2 rounded-lg transition-colors hover:bg-red-100"
                                style={{
                                  color: colors.error?.main || "red"
                                }}
                                title="Delete request"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {totalReceivedPages > 1 && (
                      <div className="text-center mt-4 space-y-2">
                        <p className="text-sm" style={{ color: colors.text.muted }}>
                          Page {receivedPage} of {totalReceivedPages} • Showing {paginateRequests(receivedRequests, receivedPage, maxDisplayRequests).length} of {receivedRequests.length} received requests
                        </p>
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={() => goToReceivedPage(1)}
                            disabled={receivedPage === 1}
                            className="px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: receivedPage === 1 ? colors.text.muted : colors.primary?.blue?.[500] || '#3b82f6',
                              color: 'white'
                            }}
                          >
                            First
                          </button>
                          <button
                            onClick={() => goToReceivedPage(receivedPage - 1)}
                            disabled={receivedPage === 1}
                            className="px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: receivedPage === 1 ? colors.text.muted : colors.primary?.blue?.[500] || '#3b82f6',
                              color: 'white'
                            }}
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: colors.background.secondary, color: colors.text.primary }}>
                            {receivedPage}
                          </span>
                          <button
                            onClick={() => goToReceivedPage(receivedPage + 1)}
                            disabled={receivedPage === totalReceivedPages}
                            className="px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: receivedPage === totalReceivedPages ? colors.text.muted : colors.primary?.blue?.[500] || '#3b82f6',
                              color: 'white'
                            }}
                          >
                            Next
                          </button>
                          <button
                            onClick={() => goToReceivedPage(totalReceivedPages)}
                            disabled={receivedPage === totalReceivedPages}
                            className="px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: receivedPage === totalReceivedPages ? colors.text.muted : colors.primary?.blue?.[500] || '#3b82f6',
                              color: 'white'
                            }}
                          >
                            Last
                          </button>
                        </div>
                      </div>
                    )}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginateRequests(sentRequests, sentPage, maxDisplayRequests).map((req) => (
                        <div
                          key={req._id}
                          className="p-4 rounded-lg shadow flex flex-col gap-3"
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
                          <div className="flex flex-col gap-3">
                            <div>
                              <p style={{ color: colors.text.secondary }}>
                                <strong>Your Message:</strong> {req.message}
                              </p>
                              <p style={{ color: colors.text.primary }}>
                                <strong>Status:</strong> {req.status}
                              </p>
                              {req.responseMessage && (
                                <div 
                                  className="mt-3 p-3 rounded-lg border"
                                  style={{
                                    backgroundColor: req.status === 'accepted' 
                                      ? `${colors.accent?.green?.[500] || '#22c55e'}10`
                                      : `${colors.accent?.red?.[500] || '#ef4444'}10`,
                                    borderColor: req.status === 'accepted'
                                      ? `${colors.accent?.green?.[500] || '#22c55e'}30`
                                      : `${colors.accent?.red?.[500] || '#ef4444'}30`
                                  }}
                                >
                                  <p className="text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                                    {req.status === 'accepted' ? '✅ Accepted' : '❌ Declined'} - Response:
                                  </p>
                                  <p className="text-sm" style={{ color: colors.text.secondary }}>
                                    "{req.responseMessage}"
                                  </p>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteClick(req._id, "sent")}
                              className="p-2 rounded-lg transition-colors hover:bg-red-100 ml-4"
                              style={{
                                color: colors.error?.main || "red"
                              }}
                              title="Delete request"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {totalSentPages > 1 && (
                      <div className="text-center mt-4 space-y-2">
                        <p className="text-sm" style={{ color: colors.text.muted }}>
                          Page {sentPage} of {totalSentPages} • Showing {paginateRequests(sentRequests, sentPage, maxDisplayRequests).length} of {sentRequests.length} sent requests
                        </p>
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={() => goToSentPage(1)}
                            disabled={sentPage === 1}
                            className="px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: sentPage === 1 ? colors.text.muted : colors.primary?.blue?.[500] || '#3b82f6',
                              color: 'white'
                            }}
                          >
                            First
                          </button>
                          <button
                            onClick={() => goToSentPage(sentPage - 1)}
                            disabled={sentPage === 1}
                            className="px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: sentPage === 1 ? colors.text.muted : colors.primary?.blue?.[500] || '#3b82f6',
                              color: 'white'
                            }}
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: colors.background.secondary, color: colors.text.primary }}>
                            {sentPage}
                          </span>
                          <button
                            onClick={() => goToSentPage(sentPage + 1)}
                            disabled={sentPage === totalSentPages}
                            className="px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: sentPage === totalSentPages ? colors.text.muted : colors.primary?.blue?.[500] || '#3b82f6',
                              color: 'white'
                            }}
                          >
                            Next
                          </button>
                          <button
                            onClick={() => goToSentPage(totalSentPages)}
                            disabled={sentPage === totalSentPages}
                            className="px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            style={{
                              backgroundColor: sentPage === totalSentPages ? colors.text.muted : colors.primary?.blue?.[500] || '#3b82f6',
                              color: 'white'
                            }}
                          >
                            Last
                          </button>
                        </div>
                      </div>
                    )}
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
