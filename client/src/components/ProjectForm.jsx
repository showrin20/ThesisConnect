import React, { useState, useEffect, useRef } from 'react';
import axios from '../axios';
import { Upload, FileText, X, Search } from 'lucide-react';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getStatusStyles } from '../styles/styleUtils';

export default function ProjectForm({ onProjectCreated, onProjectUpdated, onCancel, isEditMode = false, initialData = {}, projectId }) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    link: initialData.link || '',
    tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
    status: initialData.status || 'Planned',
    collaborators: [], // Collaborators are now managed through collaboration requests
    thesisDraft: initialData.thesisDraft || { externalLink: '', description: '' },
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [collaboratorResults, setCollaboratorResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedCollaborators, setAcceptedCollaborators] = useState([]);
  const dropdownRef = useRef(null);

  // Validate URL
  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

    // Search collaborators (debounced)
  useEffect(() => {
    const searchCollaborators = async () => {
      if (!collaboratorSearch.trim() || !isEditMode || !projectId) {
        setCollaboratorResults([]);
        return;
      }
      try {
        const response = await axios.get(`/projects/search-collaborators?q=${encodeURIComponent(collaboratorSearch)}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setCollaboratorResults(response.data.data || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search collaborators');
      }
    };
    const timeout = setTimeout(searchCollaborators, 300);
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

  // Fetch collaboration requests and accepted collaborators for this project
  useEffect(() => {
    const fetchCollaborationData = async () => {
      if (isEditMode && projectId) {
        try {
          const token = localStorage.getItem('token');
          
          // Fetch pending collaboration requests
          const requestsResponse = await axios.get(`/collaborations/project/${projectId}/requests`, {
            headers: { 'x-auth-token': token }
          });
          setPendingRequests(requestsResponse.data.data || []);

          // Fetch accepted collaborators
          const collaboratorsResponse = await axios.get(`/projects/${projectId}/collaborators`, {
            headers: { 'x-auth-token': token }
          });
          setAcceptedCollaborators(collaboratorsResponse.data.data || []);
        } catch (error) {
          console.error('Error fetching collaboration data:', error);
        }
      } else {
        // If not in edit mode, clear the lists
        setPendingRequests([]);
        setAcceptedCollaborators([]);
      }
    };

    fetchCollaborationData();
  }, [isEditMode, projectId]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in to proceed');

      const hasLink = formData.link.trim();
      const hasFile = selectedFile;
      const hasExternalLink = formData.thesisDraft && formData.thesisDraft.externalLink ? formData.thesisDraft.externalLink.trim() : '';

      if (!formData.title.trim() || !formData.description.trim()) {
        throw new Error('Title and description are required');
      }

      if (!hasLink && !hasFile && !hasExternalLink) {
        throw new Error('Please provide a project link, upload a thesis draft, or external thesis link');
      }

      if (hasLink && !isValidURL(formData.link)) {
        throw new Error('Invalid project link URL');
      }
      if (hasExternalLink && formData.thesisDraft && formData.thesisDraft.externalLink && !isValidURL(formData.thesisDraft.externalLink)) {
        throw new Error('Invalid thesis draft external link URL');
      }

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('status', formData.status);
      if (hasLink) submitData.append('link', formData.link);
      if (formData.tags) {
        const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tags.length) submitData.append('tags', JSON.stringify([...new Set(tags)]));
      }
      // Collaborators are now added through collaboration requests, not instantly
      // submitData.append('collaborators', JSON.stringify([]));
      if (selectedFile) {
        submitData.append('thesisPdf', selectedFile);
      }
      if (hasExternalLink || (formData.thesisDraft && formData.thesisDraft.description)) {
        submitData.append('thesisDraft', JSON.stringify({
          externalLink: formData.thesisDraft && formData.thesisDraft.externalLink ? formData.thesisDraft.externalLink : '',
          description: formData.thesisDraft && formData.thesisDraft.description ? formData.thesisDraft.description : '',
        }));
      }

      let response;
      if (isEditMode) {
        response = await axios.put(`/projects/${projectId}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token,
          },
        });
        setSuccess(true);
        if (onProjectUpdated) onProjectUpdated(response.data.data);
      } else {
        response = await axios.post('/projects', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token,
          },
        });
        setSuccess(true);
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
      document.getElementById('thesis-file').value = '';
      setTimeout(() => setSuccess(false), 3000);
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
      setFormData(prev => ({
        ...prev,
        thesisDraft: { ...prev.thesisDraft, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
    document.getElementById('thesis-file').value = '';
  };

  const addCollaborator = async (user) => {
    // Check if user can be added
    const existingRequest = pendingRequests.find(req => req.recipient._id === user._id);
    const isAccepted = acceptedCollaborators.some(collab => collab._id === user._id);
    
    if (isAccepted) {
      setError('This user is already a collaborator on this project.');
      return;
    }
    
    if (existingRequest) {
      setError('A collaboration request has already been sent to this user.');
      return;
    }
    
    // For new projects, don't allow collaboration requests until project is created
    if (!isEditMode || !projectId) {
      setError('Please create the project first before sending collaboration requests.');
      return;
    }
    
    try {
      // Send collaboration request instead of adding instantly
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const requestData = {
        recipientId: user._id || user.id,
        projectId: projectId,
        message: `Hi ${user.name || user.email}, I'd like to collaborate with you on this project. Looking forward to working together!`
      };

      console.log('Sending collaboration request:', requestData);
      console.log('Project ID type:', typeof projectId, 'Value:', projectId);
      console.log('Recipient ID type:', typeof requestData.recipientId, 'Value:', requestData.recipientId);

      const response = await axios.post('/collaborations/request', requestData, {
        headers: { 'x-auth-token': token }
      });
      
      console.log('Collaboration request response:', response.data);
      
      // Add to pending requests list
      const newRequest = {
        _id: response.data.data?._id || Date.now().toString(), // Use real ID if available
        recipient: user,
        message: requestData.message,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setPendingRequests(prev => [...prev, newRequest]);
      
      // Show success message
      setSuccess('Collaboration request sent successfully!');
      setCollaboratorSearch('');
      setCollaboratorResults([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Collaboration request error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to send collaboration request. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid request data';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
    }
  };



  const isFormValid = () => {
    const hasLink = formData.link && formData.link.trim();
    const hasThesisDraft = selectedFile || (formData.thesisDraft && formData.thesisDraft.externalLink && formData.thesisDraft.externalLink.trim());
    return formData.title && formData.title.trim() && formData.description && formData.description.trim() && (hasLink || hasThesisDraft);
  };

  return (
    <div className="space-y-6" role="region" aria-label={isEditMode ? "Project update form" : "Project creation form"}>
      {error && (
        <div className="rounded-lg p-4" style={getStatusStyles('error')}>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-lg p-4" style={getStatusStyles('success')} role="alert">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.status.success.border }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.text.primary }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
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
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
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
          />
        </div>

        {/* Link */}
        <div>
          <label htmlFor="link" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
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
          <label htmlFor="status" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
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
        <div className="relative border rounded-lg p-4" style={{ borderColor: colors.border.secondary, backgroundColor: colors.background.card }} ref={dropdownRef}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2" style={{ color: colors.text.primary }}>
            <Search size={20} />
            Collaborators
          </h3>
            {isEditMode && projectId && (
              <button
                type="button"
                onClick={() => {
                  const fetchCollaborationData = async () => {
                    try {
                      const token = localStorage.getItem('token');
                      
                      // Fetch pending collaboration requests
                      const requestsResponse = await axios.get(`/collaborations/project/${projectId}/requests`, {
                        headers: { 'x-auth-token': token }
                      });
                      setPendingRequests(requestsResponse.data.data || []);

                      // Fetch accepted collaborators
                      const collaboratorsResponse = await axios.get(`/projects/${projectId}/collaborators`, {
                        headers: { 'x-auth-token': token }
                      });
                      setAcceptedCollaborators(collaboratorsResponse.data.data || []);
                    } catch (error) {
                      // Silently handle error
                    }
                  };
                  fetchCollaborationData();
                }}
                className="text-xs px-3 py-1 rounded border transition-colors"
                style={getStatusStyles('info')}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                🔄 Refresh Status
              </button>
            )}
          </div>

          <div className="relative">
            <label htmlFor="collaboratorSearch" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
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
              placeholder={(!isEditMode || !projectId) ? "Create project first to add collaborators..." : "Search by name or email..."}
              disabled={!isEditMode || !projectId}
              className={`w-full p-3 rounded-lg transition-all duration-200 pr-10 ${(!isEditMode || !projectId) ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={getInputStyles()}
              onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
              onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
            />
              {collaboratorSearch && (
                <button
                  type="button"
                  onClick={() => setCollaboratorSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors"
                  style={getStatusStyles('info')}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  ✕
                </button>
              )}
            </div>
            
            {!collaboratorSearch && (
              <div className="mt-2 p-2 text-center text-sm" style={{ color: colors.text.muted }}>
                💡 Start typing to search for potential collaborators
              </div>
            )}

            {collaboratorSearch && collaboratorResults.length === 0 && (
              <div className="mt-2 p-2 text-center text-sm" style={{ color: colors.text.muted }}>
                {collaboratorSearch.length > 0 ? '🔍 Searching for collaborators...' : 'No users found. Try searching by name or email.'}
              </div>
            )}

            {collaboratorResults.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: colors.border.secondary }}>
                {collaboratorResults.map(user => {
                  // Check if user already has a pending request
                  const existingRequest = pendingRequests.find(req => req.recipient._id === user._id);
                  // Check if user is already an accepted collaborator
                  const isAccepted = acceptedCollaborators.some(collab => collab._id === user._id);
                  
                  let statusText = '';
                  let statusStyle = '';
                  let isDisabled = false;
                  
                  if (isAccepted) {
                    statusText = '✓ Already Collaborator';
                    statusStyle = getStatusStyles('success');
                    isDisabled = true;
                  } else if (existingRequest) {
                    statusText = '⏳ Request Pending';
                    statusStyle = getStatusStyles('warning');
                    isDisabled = true;
                  } else {
                    statusText = 'Click to Send Request';
                    statusStyle = getStatusStyles('info');
                    isDisabled = false;
                  }
                  
                  return (
                  <li
                    key={user._id}
                      className={`p-3 border-b last:border-b-0 transition-colors ${
                        isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer active:bg-gray-200'
                      }`}
                      onClick={isDisabled ? undefined : (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addCollaborator(user);
                      }}
                      onTouchStart={isDisabled ? undefined : (e) => {
                        e.preventDefault();
                      }}
                      onMouseDown={isDisabled ? undefined : (e) => {
                        if (!isDisabled) {
                          e.preventDefault();
                        }
                      }}
                      style={{ 
                        color: colors.text.primary, 
                        backgroundColor: colors.background.card,
                        borderColor: colors.border.secondary
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
                            <div className="text-xs mt-1 opacity-70" style={{ color: colors.text.muted }}>
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
                  onClick={() => {
                    // Refresh collaboration data
                    if (isEditMode && projectId) {
                      const fetchCollaborationData = async () => {
                        try {
                          const token = localStorage.getItem('token');
                          
                          // Fetch pending collaboration requests
                          const requestsResponse = await axios.get(`/collaborations/project/${projectId}/requests`, {
                            headers: { 'x-auth-token': token }
                          });
                          setPendingRequests(requestsResponse.data.data || []);

                          // Fetch accepted collaborators
                          const collaboratorsResponse = await axios.get(`/projects/${projectId}/collaborators`, {
                            headers: { 'x-auth-token': token }
                          });
                          setAcceptedCollaborators(collaboratorsResponse.data.data || []);
                        } catch (error) {
                          // Silently handle error
                        }
                      };
                      fetchCollaborationData();
                    }
                  }}
                  className="text-xs px-2 py-1 rounded border transition-colors"
                  style={getStatusStyles('info')}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  🔄 Refresh
                </button>
              </div>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="p-3 rounded-lg border" style={{ 
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.border.secondary 
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ 
                          backgroundColor: colors.primary?.blue?.[500] || '#3b82f6' 
                        }}>
                          <span className="text-xs text-white font-medium">
                            {request.recipient?.name?.charAt(0) || request.recipient?.email?.charAt(0) || 'U'}
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
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={getStatusStyles('warning')}>
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
                            // Remove pending request
                            setPendingRequests(prev => prev.filter(req => req._id !== request._id));
                          }}
                          className="text-xs px-2 py-1 rounded border transition-colors"
                          style={getStatusStyles('error')}
                          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                          title="Remove this pending request"
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
                  onClick={() => {
                    // Refresh collaboration data
                    if (isEditMode && projectId) {
                      const fetchCollaborationData = async () => {
                        try {
                          const token = localStorage.getItem('token');
                          
                          // Fetch pending collaboration requests
                          const requestsResponse = await axios.get(`/collaborations/project/${projectId}/requests`, {
                            headers: { 'x-auth-token': token }
                          });
                          setPendingRequests(requestsResponse.data.data || []);

                          // Fetch accepted collaborators
                          const collaboratorsResponse = await axios.get(`/projects/${projectId}/collaborators`, {
                            headers: { 'x-auth-token': token }
                          });
                          setAcceptedCollaborators(collaboratorsResponse.data.data || []);
                        } catch (error) {
                          // Silently handle error
                        }
                      };
                      fetchCollaborationData();
                    }
                  }}
                  className="text-xs px-2 py-1 rounded border transition-colors"
                  style={getStatusStyles('success')}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  🔄 Refresh
                </button>
              </div>
              <div className="space-y-2">
                {acceptedCollaborators.map((collaborator) => (
                  <div key={collaborator._id} className="flex items-center justify-between p-3 rounded-lg" style={{ 
                    backgroundColor: colors.background.card,
                    color: colors.text.primary
                    
                   
                  }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white bg-opacity-20">
                        <span className="text-xs font-medium">
                          {collaborator.name?.charAt(0) || collaborator.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{collaborator.name || collaborator.email}</p>
                        <p className="text-xs opacity-80">{collaborator.role || 'Collaborator'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={getStatusStyles('success')}>
                      ✓ Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: colors.background.tertiary }}>
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
          {pendingRequests.length === 0 && acceptedCollaborators.length === 0 && (
            <div className="mt-4 p-4 rounded-lg border-2 border-dashed text-center" style={{ 
              borderColor: colors.border.secondary,
              backgroundColor: colors.background.tertiary
            }}>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                📝 <strong>No collaboration requests or collaborators yet.</strong>
              </p>
              <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
                Use the search above to find and invite collaborators to your project.
              </p>
              <div className="mt-2 text-xs" style={{ color: colors.text.muted }}>
                <p>• Search by name or email</p>
                <p>• Click on users to send collaboration requests</p>
                <p>• Requests will show as pending until accepted</p>
              </div>
            </div>
          )}
        </div>

        {/* Thesis Draft Section */}
        <div className="border rounded-lg p-4" style={{ borderColor: colors.border.secondary, backgroundColor: colors.background.card, color: colors.text.primary }}>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: colors.text.primary }}>
            <FileText size={20} />
            Project Report
          </h3>
          <div>
            <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="thesis-file" />
            <label htmlFor="thesis-file" className="cursor-pointer block p-3 border rounded-lg text-center">
              {selectedFile ? `Change file: ${selectedFile.name}` : 'Upload PDF Draft'}
            </label>
          </div>
          {selectedFile && (
            <div className="mt-2 flex items-center justify-between p-2 rounded" style={{ backgroundColor: colors.background.tertiary }}>
              <span className="text-sm flex items-center gap-2">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
              <button type="button" onClick={removeFile} style={getStatusStyles('error')}>
                <X size={16} />
              </button>
            </div>
          )}
          <div className="mt-4">
            <label htmlFor="thesisDraft.externalLink" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Thesis Draft External Link
            </label>
            <input
              id="thesisDraft.externalLink"
              name="thesisDraft.externalLink"
              type="url"
              value={formData.thesisDraft && formData.thesisDraft.externalLink ? formData.thesisDraft.externalLink : ''}
              onChange={handleChange}
              placeholder="https://example.com/thesis-draft"
              className="w-full p-3 rounded-lg transition-all duration-200"
              style={getInputStyles()}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="thesisDraft.description" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
              Thesis Draft Description
            </label>
            <textarea
              id="thesisDraft.description"
              name="thesisDraft.description"
              value={formData.thesisDraft && formData.thesisDraft.description ? formData.thesisDraft.description : ''}
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
          <label htmlFor="tags" className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
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
            onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('outline'), { backgroundColor: colors.button.outline.backgroundHover })}
            onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('outline'))}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200"
            style={loading || !isFormValid() ? getButtonStyles('primary', true) : getButtonStyles('primary')}
            onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' })}
            onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' })}
          >
            {loading ? (isEditMode ? 'Updating Project...' : 'Creating Project...') : (isEditMode ? 'Update Project' : 'Create Project')}
          </button>
          
        </div>
      </form>
    </div>
  );
}