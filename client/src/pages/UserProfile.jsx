import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from '../axios';
import Sidebar from '../components/DashboardSidebar';
import { getButtonStyles } from '../styles/styleUtils';
import { colors } from '../styles/colors';
import Topbar from '../components/DashboardTopbar';
import { useAlert } from '../context/AlertContext';

import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Briefcase,
  Award,
  BookOpen,
  FolderOpen,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Star,
  Heart,
  MessageCircle,
  Send,
  ArrowLeft,
  Download,
  Eye,
  Users,
  TrendingUp,
  Clock,
  Edit,
  Share2
} from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { user: currentUser, logout } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useAlert();
  

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [publications, setPublications] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [collaborationStatus, setCollaborationStatus] = useState('none');

  const [isLoggingOut, setIsLoggingOut] = useState(false);





  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const profileResponse = await axios.get(`/users/${userId}`);
      setProfile(profileResponse.data.data);

      // Fetch user's projects
      try {
        const projectsResponse = await axios.get(`/projects/user/${userId}`);
        setProjects(projectsResponse.data.data || []);
      } catch (err) {
        console.warn('Could not fetch projects:', err);
      }

      // Fetch user's publications
      try {
        const publicationsResponse = await axios.get(`/publications/user/${userId}`);
        setPublications(publicationsResponse.data.data || []);
      } catch (err) {
        console.warn('Could not fetch publications:', err);
      }

      // Fetch user's blogs
      try {
        const blogsResponse = await axios.get(`/blogs/user/${userId}`);
        setBlogs(blogsResponse.data.data || []);
      } catch (err) {
        console.warn('Could not fetch blogs:', err);
      }

      // Check collaboration status
      if (currentUser?.id !== userId) {
        try {
          const collaborationResponse = await axios.get(`/collaborations/status/${userId}`);
          setCollaborationStatus(collaborationResponse.data.status || 'none');
        } catch (err) {
          console.warn('Could not check collaboration status:', err);

        }
      }

    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendCollaborationRequest = async () => {
    try {
      const response = await axios.post('/collaborations/request', {
        recipientId: userId,
        message: `Hi ${profile.name}, I'd like to collaborate with you on academic projects. Let's connect!`
      });

      if (response.data.success) {
        setCollaborationStatus('sent');
        showSuccess('Collaboration request sent successfully!');
      }
    } catch (err) {
      console.error('Error sending collaboration request:', err);
      showError(err.response?.data?.message || 'Failed to send collaboration request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'published':
      case 'completed':
        return colors.accent?.green?.[500] || '#22c55e';
      case 'in progress':
      case 'draft':
        return colors.primary?.blue?.[500] || '#3b82f6';
      case 'planned':
        return colors.accent?.orange?.[500] || '#f59e0b';
      default:
        return colors.text.secondary;
    }
  };

  const getCollaborationButtonConfig = () => {
    switch (collaborationStatus) {
      case 'sent':
        return {
          text: 'Request Sent',
          icon: Clock,
          disabled: true,
          color: colors.accent?.orange?.[500] || '#f59e0b'
        };
      case 'accepted':
        return {
          text: 'Collaborating',
          icon: Users,
          disabled: true,
          color: colors.accent?.green?.[500] || '#22c55e'
        };
      default:
        return {
          text: 'Send Collaboration Request',
          icon: Send,
          disabled: false,
          color: colors.primary?.blue?.[500] || '#3b82f6'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: colors.background.primary }}>
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
                   style={{ borderColor: colors.primary?.blue?.[500] || '#3b82f6' }}></div>
              <p className="text-lg" style={{ color: colors.text.secondary }}>Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: colors.background.primary }}>
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>User Not Found</h2>
              <p className="mb-6" style={{ color: colors.text.secondary }}>The user you're looking for doesn't exist.</p>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: colors.primary?.blue?.[500] || '#3b82f6', color: 'white' }}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const buttonConfig = getCollaborationButtonConfig();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: colors.background.primary }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Topbar */}
             <Topbar 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            user={currentUser}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header Section */}
          <div 
            className="relative"
            style={{ 
              background: colors.background.primary,
              color: colors.text.secondary
            }}
          >
           <div className="relative px-6 py-12">
           
          

              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profile.name}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full  flex items-center justify-center border-4">
                        <User size={48} 
         />
                      </div>
                    )}
                
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-bold mb-3 break-words">{profile.name}</h1>
                    <div className="flex items-center mb-4">
                      <GraduationCap size={20} className="mr-2 flex-shrink-0" />
                      <span className="text-xl">{profile.role || 'Student'}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {profile.university && (
                        <div className="flex items-center">
                          <Award size={16} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{profile.university}</span>
                        </div>
                      )}
                      {profile.department && (
                        <div className="flex items-center">
                          <Briefcase size={16} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{profile.department}</span>
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{profile.location}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 flex-shrink-0" />
                        <span>Joined {formatDate(profile.createdAt)}</span>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-lg opacity-90 mb-6 leading-relaxed max-w-3xl">{profile.bio}</p>
                    )}

                    {/* Social Links */}
                    <div className="flex flex-wrap gap-3">
                      {profile.github && (
                        <a
                          href={profile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 transition-all transform hover:scale-105"
                          style={{ backgroundColor: colors.background.card }}
                          title="GitHub"
                        >
                          <Github size={20} />
                        </a>
                      )}
                      {profile.linkedin && (
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3  transition-all transform hover:scale-105"
                          style={{ backgroundColor: colors.background.card }}
                          title="LinkedIn"
                        >
                          <Linkedin size={20} />
                        </a>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3  transition-all transform hover:scale-105"
                          style={{ backgroundColor: colors.background.card }} 
                          title="Website"
                        >
                          <Globe size={20} />
                        </a>
                      )}
                {profile.email && (
  <a
    href={`mailto:${profile.email}`}
    className="p-3 transition-all transform hover:scale-105 flex items-center gap-2"
    style={{ backgroundColor: colors.background.card }}
    title="Email"
  >
    <Mail size={20} /> {profile.email}
  </a>
)}

                    </div>
                  </div>

            
                </div>
              </div>
            </div>
          </div>




          {/* Stats Bar */}
          <div 
            className="border-b shadow-sm"
            style={{ 
              backgroundColor: colors.background.card,
              borderColor: colors.border.secondary 
            }}
          >
            <div className="max-w-6xl mx-auto px-6 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1" style={{ color: colors.text.primary }}>
                    {projects.length}
                  </div>
                  <div className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                    Projects
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1" style={{ color: colors.text.primary }}>
                    {publications.length}
                  </div>
                  <div className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                    Publications
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1" style={{ color: colors.text.primary }}>
                    {blogs.length}
                  </div>
                  <div className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                    Blogs
                  </div>
                </div>
                {/* <div className="text-center">
                  <div className="text-3xl font-bold mb-1" style={{ color: colors.text.primary }}>
                    {profile.totalViews || 0}
                  </div>
                  <div className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                    Profile Views
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div 
            className="border-b shadow-sm sticky top-0 z-10"
            style={{ 
              backgroundColor: colors.background.card,
              borderColor: colors.border.secondary 
            }}
          >
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex space-x-8 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'projects', label: `Projects (${projects.length})`, icon: FolderOpen },
                  { id: 'publications', label: `Publications (${publications.length})`, icon: BookOpen },
                  { id: 'blogs', label: `Blogs (${blogs.length})`, icon: MessageCircle }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-2 border-b-2 transition-all duration-200 whitespace-nowrap font-medium ${
                      activeTab === tab.id 
                        ? 'border-blue-500' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ 
                      color: activeTab === tab.id 
                        ? colors.primary?.blue?.[500] || '#3b82f6'
                        : colors.text.secondary 
                    }}
                  >
                    <tab.icon size={18} className="mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto px-6 py-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div 
                    className="rounded-xl p-6 border shadow-sm"
                    style={{
                      backgroundColor: colors.background.card,
                      borderColor: colors.border.secondary
                    }}
                  >
                    <h3 className="text-xl font-bold mb-4" style={{ color: colors.text.primary }}>
                      Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 rounded-lg font-medium transition-colors hover:scale-105 transform"
                          style={{
                            backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}15`,
                            color: colors.primary?.blue?.[500] || '#3b82f6',
                            border: `1px solid ${colors.primary?.blue?.[500] || '#3b82f6'}30`
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Projects */}
                  {projects.length > 0 && (
                    <div 
                      className="rounded-xl p-6 border shadow-sm"
                      style={{
                        backgroundColor: colors.background.card,
                        borderColor: colors.border.secondary
                      }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold" style={{ color: colors.text.primary }}>
                          Recent Projects
                        </h3>
                        <button
                          onClick={() => setActiveTab('projects')}
                          className="text-sm font-medium hover:underline transition-colors"
                          style={{ color: colors.primary?.blue?.[500] || '#3b82f6' }}
                        >
                          View All →
                        </button>
                      </div>
                      <div className="space-y-4">
                        {projects.slice(0, 3).map(project => (
                          <div
                            key={project._id}
                            className="p-4 rounded-lg border transition-all hover:shadow-md"
                            style={{
                              backgroundColor: colors.background.primary,
                              borderColor: colors.border.secondary
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-lg" style={{ color: colors.text.primary }}>
                                {project.title}
                              </h4>
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${getStatusColor(project.status)}20`,
                                  color: getStatusColor(project.status)
                                }}
                              >
                                {project.status}
                              </span>
                            </div>
                            <p className="text-sm mb-4 leading-relaxed" style={{ color: colors.text.secondary }}>
                              {project.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {project.tags?.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 rounded-full text-xs"
                                    style={{
                                      backgroundColor: `${colors.text.secondary}15`,
                                      color: colors.text.secondary
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs font-medium" style={{ color: colors.text.muted }}>
                                {formatDate(project.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Publications */}
                  {publications.length > 0 && (
                    <div 
                      className="rounded-xl p-6 border shadow-sm"
                      style={{
                        backgroundColor: colors.background.card,
                        borderColor: colors.border.secondary
                      }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold" style={{ color: colors.text.primary }}>
                          Recent Publications
                        </h3>
                        <button
                          onClick={() => setActiveTab('publications')}
                          className="text-sm font-medium hover:underline transition-colors"
                          style={{ color: colors.primary?.blue?.[500] || '#3b82f6' }}
                        >
                          View All →
                        </button>
                      </div>
                      <div className="space-y-4">
                        {publications.slice(0, 3).map(publication => (
                          <div
                            key={publication._id}
                            className="p-4 rounded-lg border transition-all hover:shadow-md"
                            style={{
                              backgroundColor: colors.background.primary,
                              borderColor: colors.border.secondary
                            }}
                          >
                            <h4 className="font-semibold text-lg mb-2" style={{ color: colors.text.primary }}>
                              {publication.title}
                            </h4>
                            <p className="text-sm mb-3 font-medium" style={{ color: colors.text.secondary }}>
                              {publication.venue} • {publication.year}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {publication.citations > 0 && (
                                  <div className="flex items-center">
                                    <Award size={16} style={{ color: colors.text.secondary }} />
                                    <span className="text-sm ml-1 font-medium" style={{ color: colors.text.secondary }}>
                                      {publication.citations} citations
                                    </span>
                                  </div>
                                )}
                                {publication.doi && (
                                  <a
                                    href={`https://doi.org/${publication.doi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm flex items-center font-medium hover:underline"
                                    style={{ color: colors.primary?.blue?.[500] || '#3b82f6' }}
                                  >
                                    <ExternalLink size={14} className="mr-1" />
                                    DOI
                                  </a>
                                )}
                              </div>
                              <span className="text-xs font-medium" style={{ color: colors.text.muted }}>
                                {publication.year}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Empty State for Overview */}
                {projects.length === 0 && publications.length === 0 && (
                  <div className="text-center py-16">
                    <div 
                      className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{ backgroundColor: `${colors.text.secondary}10` }}
                    >
                      <User size={32} style={{ color: colors.text.secondary }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                      {isOwnProfile ? 'Welcome to your profile!' : `${profile.name}'s profile`}
                    </h3>
                    <p style={{ color: colors.text.secondary }}>
                      {isOwnProfile 
                        ? "Start by adding your first project or publication!"
                        : `${profile.name} hasn't shared any content yet.`
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
                    All Projects ({projects.length})
                  </h2>
                </div>
                
                {projects.length === 0 ? (
                  <div className="text-center py-16">
                    <div 
                      className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{ backgroundColor: `${colors.text.secondary}10` }}
                    >
                      <FolderOpen size={32} style={{ color: colors.text.secondary }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                      No projects yet
                    </h3>
                    <p style={{ color: colors.text.secondary }}>
                      {isOwnProfile ? "Start by creating your first project!" : `${profile.name} hasn't shared any projects yet.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map(project => (
                      <div
                        key={project._id}
                        className="rounded-xl p-6 border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                        style={{
                          backgroundColor: colors.background.card,
                          borderColor: colors.border.secondary
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-bold text-xl leading-tight" style={{ color: colors.text.primary }}>
                            {project.title}
                          </h3>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-3"
                            style={{
                              backgroundColor: `${getStatusColor(project.status)}20`,
                              color: getStatusColor(project.status)
                            }}
                          >
                            {project.status}
                          </span>
                        </div>
                        
                        <p className="text-sm mb-6 leading-relaxed" style={{ color: colors.text.secondary }}>
                          {project.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.tags?.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}15`,
                                color: colors.primary?.blue?.[500] || '#3b82f6'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border.secondary }}>
                          <span className="text-sm font-medium" style={{ color: colors.text.muted }}>
                            {formatDate(project.createdAt)}
                          </span>
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm font-medium hover:underline"
                              style={{ color: colors.primary?.blue?.[500] || '#3b82f6' }}
                            >
                              <ExternalLink size={16} className="mr-1" />
                              View Project
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'publications' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
                    All Publications ({publications.length})
                  </h2>
                </div>
                
                {publications.length === 0 ? (
                  <div className="text-center py-16">
                    <div 
                      className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{ backgroundColor: `${colors.text.secondary}10` }}
                    >
                      <BookOpen size={32} style={{ color: colors.text.secondary }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                      No publications yet
                    </h3>
                    <p style={{ color: colors.text.secondary }}>
                      {isOwnProfile ? "Share your research and publications!" : `${profile.name} hasn't shared any publications yet.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {publications.map(publication => (
                      <div
                        key={publication._id}
                        className="rounded-xl p-6 border shadow-sm hover:shadow-lg transition-all duration-300"
                        style={{
                          backgroundColor: colors.background.card,
                          borderColor: colors.border.secondary
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-bold text-xl leading-tight flex-1 mr-4" style={{ color: colors.text.primary }}>
                            {publication.title}
                          </h3>
                          <span
                            className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
                            style={{
                              backgroundColor: `${colors.primary?.purple?.[500] || '#9333ea'}15`,
                              color: colors.primary?.purple?.[500] || '#9333ea'
                            }}
                          >
                            {publication.type}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <p className="font-semibold mb-2" style={{ color: colors.text.secondary }}>
                            {publication.venue} • {publication.year}
                          </p>
                          {publication.authors && (
                            <p className="text-sm" style={{ color: colors.text.secondary }}>
                              Authors: {publication.authors}
                            </p>
                          )}
                        </div>
                        
                        {publication.abstract && (
                          <p className="text-sm mb-6 leading-relaxed" style={{ color: colors.text.secondary }}>
                            {publication.abstract}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border.secondary }}>
                          <div className="flex items-center space-x-6">
                            {publication.citations > 0 && (
                              <div className="flex items-center">
                                <Award size={18} style={{ color: colors.text.secondary }} />
                                <span className="ml-2 font-semibold" style={{ color: colors.text.secondary }}>
                                  {publication.citations} citations
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-3">
                              {publication.doi && (
                                <a
                                  href={`https://doi.org/${publication.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-sm px-3 py-1 rounded-lg font-medium hover:underline transition-colors"
                                  style={{
                                    backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}15`,
                                    color: colors.primary?.blue?.[500] || '#3b82f6'
                                  }}
                                >
                                  <ExternalLink size={14} className="mr-1" />
                                  DOI
                                </a>
                              )}
                              
                              {publication.pdfUrl && (
                                <a
                                  href={publication.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-sm px-3 py-1 rounded-lg font-medium hover:underline transition-colors"
                                  style={{
                                    backgroundColor: `${colors.accent?.green?.[500] || '#22c55e'}15`,
                                    color: colors.accent?.green?.[500] || '#22c55e'
                                  }}
                                >
                                  <Download size={14} className="mr-1" />
                                  PDF
                                </a>
                              )}
                            </div>
                          </div>
                          
                          <span className="text-sm font-medium" style={{ color: colors.text.muted }}>
                            {publication.year}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'blogs' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
                    All Blogs ({blogs.length})
                  </h2>
                </div>
                
                {blogs.length === 0 ? (
                  <div className="text-center py-16">
                    <div 
                      className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{ backgroundColor: `${colors.text.secondary}10` }}
                    >
                      <MessageCircle size={32} style={{ color: colors.text.secondary }} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                      No blogs yet
                    </h3>
                    <p style={{ color: colors.text.secondary }}>
                      {isOwnProfile ? "Start sharing your thoughts and experiences!" : `${profile.name} hasn't written any blogs yet.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {blogs.map(blog => (
                      <div
                        key={blog._id}
                        className="rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                        style={{
                          backgroundColor: colors.background.card,
                          borderColor: colors.border.secondary
                        }}
                      >
                        {blog.image && (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        
                        <div className="p-6">
                          <h3 className="font-bold text-xl mb-3 leading-tight" style={{ color: colors.text.primary }}>
                            {blog.title}
                          </h3>
                          
                          <p className="text-sm mb-6 leading-relaxed" style={{ color: colors.text.secondary }}>
                            {blog.excerpt || blog.content?.substring(0, 150) + '...'}
                          </p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Eye size={16} style={{ color: colors.text.secondary }} />
                                <span className="text-sm ml-1 font-medium" style={{ color: colors.text.secondary }}>
                                  {blog.views || 0}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Heart size={16} style={{ color: colors.text.secondary }} />
                                <span className="text-sm ml-1 font-medium" style={{ color: colors.text.secondary }}>
                                  {blog.likes || 0}
                                </span>
                              </div>
                            </div>
                            
                            <span className="text-sm font-medium" style={{ color: colors.text.muted }}>
                              {formatDate(blog.createdAt)}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => navigate(`/blog/${blog._id}`)}
                            className="w-full py-3 rounded-lg transition-colors font-medium"
                            style={{
                              backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}15`,
                              color: colors.primary?.blue?.[500] || '#3b82f6'
                            }}
                          >
                            Read More
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;