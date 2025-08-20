import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from '../axios';
import { Upload, FileText, X, Search, User } from 'lucide-react';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getStatusStyles } from '../styles/styleUtils';
import { useAuth } from '../context/AuthContext';

const ProjectForm = ({
  onProjectCreated,
  onProjectUpdated,
  onCancel,
  isEditMode = false,
  initialData = {},
  projectId,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    link: initialData.link || '',
    tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
    status: initialData.status || 'Planned',
    collaborators: [],
    thesisDraft: initialData.thesisDraft || { externalLink: '', description: '' },
  });

  const [creatorData, setCreatorData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [collaboratorResults, setCollaboratorResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedCollaborators, setAcceptedCollaborators] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Validate URL
  const isValidURL = (url) => {
    if (!url) return true; // Allow empty URLs
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Fetch collaboration data
  const fetchCollaborationData = async () => {
    if (!isEditMode || !projectId) {
      setPendingRequests([]);
      setAcceptedCollaborators([]);
      setRejectedRequests([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      const [requestsResponse, collaboratorsResponse] = await Promise.all([
        axios.get(`/collaborations/project/${projectId}/requests`, {
          headers: { 'x-auth-token': token },
        }),
        axios.get(`/projects/${projectId}/collaborators`, {
          headers: { 'x-auth-token': token },
        }),
      ]);
      
      // Filter requests by their status
      const allRequests = requestsResponse.data.data || [];
      const onlyPendingRequests = allRequests.filter(request => request.status === 'pending');
      const onlyRejectedRequests = allRequests.filter(request => request.status === 'declined');
      
      setPendingRequests(onlyPendingRequests);
      setRejectedRequests(onlyRejectedRequests);
      setAcceptedCollaborators(collaboratorsResponse.data.data || []);
    } catch (error) {
      setError('Failed to fetch collaboration data');
    }
  };

  // Search collaborators (debounced)
  useEffect(() => {
    let timeout;
    const searchCollaborators = async () => {
      if (!collaboratorSearch.trim() || !isEditMode || !projectId) {
        setCollaboratorResults([]);
        return;
      }
      try {
        const response = await axios.get(
          `/projects/search-collaborators?q=${encodeURIComponent(collaboratorSearch)}`,
          {
            headers: { 'x-auth-token': localStorage.getItem('token') },
          }
        );
        setCollaboratorResults(response.data.data || []);
      } catch (err) {
        setError('Failed to search collaborators');
      }
    };

    timeout = setTimeout(searchCollaborators, 300);
    return () => clearTimeout(timeout);
  }, [collaboratorSearch, isEditMode, projectId]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCollaboratorResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch collaboration data on mount
  useEffect(() => {
    fetchCollaborationData();
  }, [isEditMode, projectId]);

  // Get creator data
  useEffect(() => {
    let isMounted = true;
    const fetchCreator = async () => {
      if (isEditMode && initialData?.creator) {
        if (typeof initialData.creator === 'object') {
          if (isMounted) setCreatorData(initialData.creator);
        } else if (initialData.creator) {
          try {
            const response = await axios.get(`/users/${initialData.creator}`);
            if (isMounted && response.data?.success) {
              setCreatorData(response.data.data);
            }
          } catch (error) {
            if (isMounted) setError('Failed to fetch creator data');
          }
        }
      } else {
        if (isMounted) setCreatorData(user);
      }
    };
    fetchCreator();
    return () => {
      isMounted = false;
    };
  }, [isEditMode, initialData.creator, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in to proceed');

      const hasLink = formData.link.trim();
      const hasFile = selectedFile;
      const hasExternalLink = formData.thesisDraft?.externalLink?.trim();

      if (!formData.title.trim() || !formData.description.trim()) {
        throw new Error('Title and description are required');
      }

      if (!hasLink && !hasFile && !hasExternalLink) {
        throw new Error('Please provide a project link, upload a thesis draft, or external thesis link');
      }

      if (hasLink && !isValidURL(formData.link)) {
        throw new Error('Invalid project link URL');
      }
      if (hasExternalLink && !isValidURL(formData.thesisDraft.externalLink)) {
        throw new Error('Invalid thesis draft external link URL');
      }

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('status', formData.status);
      if (hasLink) submitData.append('link', formData.link);
      if (formData.tags) {
        const tags = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
        if (tags.length) submitData.append('tags', JSON.stringify([...new Set(tags)]));
      }
      if (selectedFile) {
        submitData.append('thesisPdf', selectedFile);
      }
      if (hasExternalLink || formData.thesisDraft?.description) {
        submitData.append(
          'thesisDraft',
          JSON.stringify({
            externalLink: formData.thesisDraft?.externalLink || '',
            description: formData.thesisDraft?.description || '',
          })
        );
      }

      let response;
      if (isEditMode) {
        response = await axios.put(`/projects/${projectId}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token,
          },
        });
        setSuccess('Project updated successfully!');
        if (onProjectUpdated) onProjectUpdated(response.data.data);
      } else {
        response = await axios.post('/projects', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token,
          },
        });
        setSuccess('Project created successfully!');
        if (onProjectCreated) onProjectCreated(response.data.data);
      }

      setFormData({
        title: '',
        description: '',
        link: '',
        tags: '',
        status: 'Planned',
        collaborators: [],
        thesisDraft: { externalLink: '', description: '' },
      });
      setSelectedFile(null);
      setCollaboratorSearch('');
      setCollaboratorResults([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || err.message || (isEditMode ? 'Failed to update project' : 'Failed to create project'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('thesisDraft.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        thesisDraft: { ...prev.thesisDraft, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file only');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addCollaborator = async (user) => {
    if (!isEditMode || !projectId) {
      setError('Please create the project first before sending collaboration requests.');
      return;
    }

    const existingRequest = pendingRequests.find((req) => req.recipient._id === user._id);
    const isAccepted = acceptedCollaborators.some((collab) => collab._id === user._id);

    if (isAccepted) {
      setError('This user is already a collaborator on this project.');
      return;
    }

    if (existingRequest) {
      setError('A collaboration request has already been sent to this user.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      const requestData = {
        recipientId: user._id || user.id,
        projectId,
        message: `Hi ${user.name || user.email}, I'd like to collaborate with you on this project. Looking forward to working together!`,
      };

      const response = await axios.post('/collaborations/request', requestData, {
        headers: { 'x-auth-token': token },
      });

      setPendingRequests((prev) => [
        ...prev,
        {
          _id: response.data.data?._id || Date.now().toString(),
          recipient: user,
          message: requestData.message,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ]);

      setSuccess('Collaboration request sent successfully!');
      setCollaboratorSearch('');
      setCollaboratorResults([]);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      const status = error.response?.status;
      let errorMessage = 'Failed to send collaboration request. Please try again.';
      if (status === 400) errorMessage = error.response.data?.message || 'Invalid request data';
      else if (status === 401) errorMessage = 'Authentication failed. Please log in again.';
      else if (status === 404) errorMessage = 'User not found.';
      setError(errorMessage);
    }
  };

  const isFormValid = () => {
    const hasLink = formData.link?.trim();
    const hasThesisDraft = selectedFile || (formData.thesisDraft?.externalLink?.trim());
    return formData.title?.trim() && formData.description?.trim() && (hasLink || hasThesisDraft);
  };

  return (
    <div
      className="space-y-6"
      role="region"
      aria-label={isEditMode ? 'Project update form' : 'Project creation form'}
    >
      {error && (
        <div className="rounded-lg p-4" style={getStatusStyles('error')} role="alert">
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg p-4" style={getStatusStyles('success')} role="alert">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.status.success.border }}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: colors.text.primary }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 9m0 0l4-9m-4 9V3" />
              </svg>
            </div>
            <p className="text-sm font-medium">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Creator Information */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: colors.background.tertiary }}
          aria-label="Project creator information"
        >
          <h3
            className="text-sm font-medium mb-3 flex items-center gap-2"
            style={{ color: colors.text.primary }}
          >
            <User size={16} />
            Project Creator
          </h3>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: colors.primary.blue[500],
                color: colors.text.inverse,
              }}
            >
              {creatorData?.name?.charAt(0) || creatorData?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium" style={{ color: colors.text.primary }}>
                {creatorData?.name || 'Loading...'}
              </p>
              <p className="text-xs" style={{ color: colors.text.secondary }}>
                {creatorData?.email || ''}
                {creatorData?.role && (
                  <span
                    className="ml-2 px-2 py-0.5 text-[10px] rounded-full"
                    style={{
                      backgroundColor: colors.primary.purple[500] + '33',
                      color: colors.primary.purple[400],
                    }}
                  >
                    {creatorData.role.charAt(0).toUpperCase() + creatorData.role.slice(1)}
                  </span>
                )}
              </p>
              {creatorData?.university && (
                <p className="text-xs" style={{ color: colors.text.muted }}>
                  {creatorData.university}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Project Title *
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter your project title..."
            required
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
            aria-required="true"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Project Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your project goals, methodology, and expected outcomes..."
            required
            rows={5}
            className="w-full p-3 rounded-lg transition-all duration-200 resize-none"
            style={getInputStyles()}
            aria-required="true"
          />
        </div>

        {/* Link */}
        <div>
          <label
            htmlFor="link"
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Project Link
          </label>
          <input
            id="link"
            name="link"
            type="url"
            value={formData.link}
            onChange={handleChange}
            placeholder="https://example.com/your-project-report-or-blog"
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
            onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
            onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
          >
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Collaborators Section */}
        <div
          className="relative border rounded-lg p-4"
          style={{ borderColor: colors.border.secondary, backgroundColor: colors.background.card }}
          ref={dropdownRef}
          aria-label="Collaborators section"
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg font-medium flex items-center gap-2"
              style={{ color: colors.text.primary }}
            >
              <Search size={20} />
              Collaborators
            </h3>
            {isEditMode && projectId && (
              <button
                type="button"
                onClick={fetchCollaborationData}
                className="text-xs px-3 py-1 rounded border transition-colors"
                style={getStatusStyles('info')}
                onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.target.style.opacity = '1')}
                aria-label="Refresh collaborator status"
              >
                🔄 Refresh Status
              </button>
            )}
          </div>

          <div className="relative">
            <label
              htmlFor="collaboratorSearch"
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.secondary }}
            >
              Search Collaborators (Mentors or Students)
              {(!isEditMode || !projectId) && (
                <span className="ml-2 text-xs px-2 py-1 rounded" style={getStatusStyles('warning')}>
                  ⚠️ Project must be created first
                </span>
              )}
            </label>
            <div className="relative">
              <input
                id="collaboratorSearch"
                value={collaboratorSearch}
                onChange={(e) => setCollaboratorSearch(e.target.value)}
                placeholder={
                  !isEditMode || !projectId
                    ? 'Create project to add collaborators'
                    : 'Search by name or email...'
                }
                disabled={!isEditMode || !projectId}
                className={`w-full p-3 rounded-lg transition-all duration-200 pr-10 ${
                  !isEditMode || !projectId ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={getInputStyles()}
                onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                aria-describedby="collaboratorSearchHelp"
              />
              {collaboratorSearch && (
                <button
                  type="button"
                  onClick={() => setCollaboratorSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors"
                  style={getStatusStyles('info')}
                  onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.target.style.opacity = '1')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <span id="collaboratorSearchHelp" className="sr-only">
              Search for collaborators by name or email. Project must be created first to enable this feature.
            </span>

            {!collaboratorSearch && (
              <div className="mt-2 p-2 text-center text-sm" style={{ color: colors.text.muted }}>
                💡 Start typing to search for potential collaborators
              </div>
            )}

            {collaboratorSearch && collaboratorResults.length === 0 && (
              <div className="mt-2 p-2 text-center text-sm" style={{ color: colors.text.muted }}>
                No users found. Try searching by name or email.
              </div>
            )}

            {collaboratorResults.length > 0 && (
              <ul
                className="absolute z-50 mt-1 w-full border rounded-lg shadow-lg max-h-48 overflow-y-auto"
                style={{
                  borderColor: colors.border.secondary,
                  backgroundColor: colors.background.card,
                }}
                role="listbox"
                aria-label="Collaborator search results"
              >
                {collaboratorResults.map((user) => {
                  const existingRequest = pendingRequests.find(
                    (req) => req.recipient._id === user._id
                  );
                  const isAccepted = acceptedCollaborators.some(
                    (collab) => collab._id === user._id
                  );

                  const statusText = isAccepted
                    ? '✓ Already Collaborator'
                    : existingRequest
                    ? '⏳ Request Pending'
                    : 'Send Request';
                  const statusStyle = isAccepted
                    ? getStatusStyles('success')
                    : existingRequest
                    ? getStatusStyles('warning')
                    : getStatusStyles('info');
                  const isDisabled = isAccepted || existingRequest;

                  return (
                    <li
                      key={user._id}
                      className={`p-3 border-b last:border-b-0 transition-colors ${
                        isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'
                      }`}
                      onClick={isDisabled ? undefined : () => addCollaborator(user)}
                      onKeyDown={(e) => {
                        if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          addCollaborator(user);
                        }
                      }}
                      role="option"
                      aria-selected={false}
                      tabIndex={isDisabled ? -1 : 0}
                      style={{
                        color: colors.text.primary,
                        backgroundColor: colors.background.card,
                        borderColor: colors.border.secondary,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm" style={{ color: colors.text.secondary }}>
                            {user.email} • {user.role}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-xs font-medium px-2 py-1 rounded-full"
                            style={statusStyle}
                          >
                            {statusText}
                          </div>
                          {!isDisabled && (
                            <div
                              className="text-xs mt-1 opacity-70"
                              style={{ color: colors.text.muted }}
                            >
                              👆 Click to send request
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Pending Collaboration Requests */}
          {pendingRequests.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                  Pending Collaboration Requests ({pendingRequests.length})
                </p>
                <button
                  type="button"
                  onClick={fetchCollaborationData}
                  className="text-xs px-2 py-1 rounded border transition-colors"
                  style={getStatusStyles('info')}
                  onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.target.style.opacity = '1')}
                  aria-label="Refresh pending requests"
                >
                  🔄 Refresh
                </button>
              </div>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request._id}
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.background.tertiary,
                      borderColor: colors.border.secondary,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: colors.primary.blue[500] }}
                        >
                          <span className="text-xs text-white font-medium">
                            {request.recipient?.name?.charAt(0) ||
                              request.recipient?.email?.charAt(0) ||
                              'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                            {request.recipient?.name || request.recipient?.email || 'Unknown User'}
                          </p>
                          <p className="text-xs" style={{ color: colors.text.secondary }}>
                            {request.recipient?.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={getStatusStyles('warning')}
                      >
                        Pending
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
                      "{request.message}"
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: colors.text.muted }}>
                        Sent {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setPendingRequests((prev) => prev.filter((req) => req._id !== request._id));
                        }}
                        className="text-xs px-2 py-1 rounded border transition-colors"
                        style={getStatusStyles('error')}
                        onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                        onMouseLeave={(e) => (e.target.style.opacity = '1')}
                        aria-label={`Remove pending request for ${request.recipient?.name || 'user'}`}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Collaboration Requests */}
          {rejectedRequests.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                  Rejected Collaboration Requests ({rejectedRequests.length})
                </p>
                <button
                  type="button"
                  onClick={fetchCollaborationData}
                  className="text-xs px-2 py-1 rounded border transition-colors"
                  style={getStatusStyles('info')}
                  onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.target.style.opacity = '1')}
                  aria-label="Refresh rejected requests"
                >
                  🔄 Refresh
                </button>
              </div>
              <div className="space-y-3">
                {rejectedRequests.map((request) => (
                  <div
                    key={request._id}
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: colors.background.tertiary,
                      borderColor: colors.border.secondary,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: colors.primary.blue[500] }}
                        >
                          <span className="text-xs text-white font-medium">
                            {request.recipient?.name?.charAt(0) ||
                              request.recipient?.email?.charAt(0) ||
                              'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                            {request.recipient?.name || request.recipient?.email || 'Unknown User'}
                          </p>
                          <p className="text-xs" style={{ color: colors.text.secondary }}>
                            {request.recipient?.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={getStatusStyles('error')}
                      >
                        Rejected
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
                      "{request.message}"
                    </p>
                    {request.responseMessage && (
                      <p className="text-xs p-2 rounded" style={{ backgroundColor: colors.background.subtle, color: colors.text.secondary }}>
                        Response: "{request.responseMessage}"
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs" style={{ color: colors.text.muted }}>
                        Sent {new Date(request.createdAt).toLocaleDateString()}
                        {request.respondedAt && `, Rejected ${new Date(request.respondedAt).toLocaleDateString()}`}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectedRequests((prev) => prev.filter((req) => req._id !== request._id));
                        }}
                        className="text-xs px-2 py-1 rounded border transition-colors"
                        style={getStatusStyles('error')}
                        onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                        onMouseLeave={(e) => (e.target.style.opacity = '1')}
                        aria-label={`Remove rejected request for ${request.recipient?.name || 'user'}`}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Collaborators */}
          {acceptedCollaborators.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                  Accepted Collaborators ({acceptedCollaborators.length})
                </p>
                <button
                  type="button"
                  onClick={fetchCollaborationData}
                  className="text-xs px-2 py-1 rounded border transition-colors"
                  style={getStatusStyles('success')}
                  onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.target.style.opacity = '1')}
                  aria-label="Refresh accepted collaborators"
                >
                  🔄 Refresh
                </button>
              </div>
              <div className="space-y-2">
                {acceptedCollaborators.map((collaborator) => (
                  <div
                    key={collaborator._id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      backgroundColor: colors.background.card,
                      color: colors.text.primary,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: colors.primary.blue[500] }}
                      >
                        <span className="text-xs font-medium text-white">
                          {collaborator.name?.charAt(0) || collaborator.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {collaborator.name || collaborator.email}
                        </p>
                        <p className="text-xs opacity-80">
                          {collaborator.role || 'Collaborator'}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={getStatusStyles('success')}
                    >
                      ✓ Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: colors.background.tertiary }}
              aria-label="Collaboration instructions"
            >
              <p className="text-xs font-medium mb-2" style={{ color: colors.text.primary }}>
                💡 <strong>How Collaboration Works:</strong>
              </p>
              {!isEditMode || !projectId ? (
                <div className="text-xs p-3 rounded-lg" style={getStatusStyles('warning')}>
                  <p>⚠️ Collaboration requests can only be sent after the project is created.</p>
                  <p>Please create your project first, then come back to add collaborators.</p>
                </div>
              ) : (
                <ul className="text-xs space-y-1" style={{ color: colors.text.secondary }}>
                  <li>• Search for potential collaborators by name or email</li>
                  <li>• Click on a user to send a collaboration request</li>
                  <li>• The request will show as "Pending" until they respond</li>
                  <li>• If accepted, they'll automatically be added to your project</li>
                  <li>• You can view all requests in the Collaboration Requests page</li>
                </ul>
              )}
            </div>
          </div>

          {/* No Requests or Collaborators Message */}
          {pendingRequests.length === 0 && rejectedRequests.length === 0 && acceptedCollaborators.length === 0 && (
            <div
              className="mt-4 p-4 rounded-lg border-2 border-dashed text-center"
              style={{
                borderColor: colors.border.secondary,
                backgroundColor: colors.background.tertiary,
              }}
            >
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                📝 <strong>No collaboration requests or collaborators yet.</strong>
              </p>
              <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
                Use the search above to find and invite collaborators to your project.
              </p>
              <div className="mt-2 text-xs" style={{ color: colors.text.muted }}>
                <p>• Search by name or email</p>
                <p>• Click on users to send collaboration requests</p>
                <p>• Requests will show as pending until accepted or rejected</p>
              </div>
            </div>
          )}
        </div>

        {/* Thesis Draft Section */}
        <div
          className="border rounded-lg p-4"
          style={{
            borderColor: colors.border.secondary,
            backgroundColor: colors.background.card,
            color: colors.text.primary,
          }}
          aria-label="Thesis draft section"
        >
          <h3
            className="text-lg font-medium mb-4 flex items-center gap-2"
            style={{ color: colors.text.primary }}
          >
            <FileText size={20} />
            Project Report
          </h3>
          <div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="thesis-file"
              ref={fileInputRef}
            />
            <label
              htmlFor="thesis-file"
              className="cursor-pointer block p-3 border rounded-lg text-center"
              style={{
                borderColor: colors.border.secondary,
                backgroundColor: colors.background.tertiary,
                color: colors.text.primary,
              }}
            >
              {selectedFile ? `Change file: ${selectedFile.name}` : 'Upload PDF Draft'}
            </label>
          </div>
          {selectedFile && (
            <div
              className="mt-2 flex items-center justify-between p-2 rounded"
              style={{ backgroundColor: colors.background.tertiary }}
            >
              <span className="text-sm flex items-center gap-2">
                {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
              <button
                type="button"
                onClick={removeFile}
                style={getStatusStyles('error')}
                aria-label="Remove uploaded file"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="mt-4">
            <label
              htmlFor="thesisDraft.externalLink"
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.secondary }}
            >
              Thesis Draft External Link
            </label>
            <input
              id="thesisDraft.externalLink"
              name="thesisDraft.externalLink"
              type="url"
              value={formData.thesisDraft?.externalLink || ''}
              onChange={handleChange}
              placeholder="https://example.com/thesis-draft"
              className="w-full p-3 rounded-lg transition-all duration-200"
              style={getInputStyles()}
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="thesisDraft.description"
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.secondary }}
            >
              Thesis Draft Description
            </label>
            <textarea
              id="thesisDraft.description"
              name="thesisDraft.description"
              value={formData.thesisDraft?.description || ''}
              onChange={handleChange}
              placeholder="Describe your thesis draft..."
              rows={3}
              className="w-full p-3 rounded-lg transition-all duration-200 resize-none"
              style={getInputStyles()}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Research Tags
          </label>
          <input
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., Machine Learning, Climate Science"
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
          />
        </div>

        {/* Submit and Cancel */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200"
            style={getButtonStyles('outline')}
            onMouseEnter={(e) =>
              Object.assign(e.target.style, getButtonStyles('outline'), {
                backgroundColor: colors.button.outline.backgroundHover,
              })
            }
            onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('outline'))}
            aria-label="Cancel project creation or update"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200"
            style={loading || !isFormValid() ? getButtonStyles('primary', true) : getButtonStyles('primary')}
            onMouseEnter={(e) =>
              Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' })
            }
            onMouseLeave={(e) =>
              Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' })
            }
            aria-label={isEditMode ? 'Update project' : 'Create project'}
          >
            {loading ? (isEditMode ? 'Updating Project...' : 'Creating Project...') : (isEditMode ? 'Update Project' : 'Create Project')}
          </button>
        </div>
      </form>
    </div>
  );
};

ProjectForm.propTypes = {
  onProjectCreated: PropTypes.func,
  onProjectUpdated: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
  initialData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    link: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.oneOf(['Planned', 'In Progress', 'Completed']),
    creator: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
        role: PropTypes.string,
        university: PropTypes.string,
      }),
    ]),
    thesisDraft: PropTypes.shape({
      externalLink: PropTypes.string,
      description: PropTypes.string,
    }),
  }),
  projectId: PropTypes.string,
};

ProjectForm.defaultProps = {
  isEditMode: false,
  initialData: {},
};

export default ProjectForm;