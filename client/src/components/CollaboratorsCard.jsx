import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import axios from '../axios';
import CollaborationRequestModal from './CollaborationRequestModal';
import { 
  User, 
  MapPin, 
  Mail, 
  GraduationCap, 
  BookOpen,
  FolderOpen,
  Send,
  Check,
  Clock,
  UserPlus,
  Star,
  Badge,
  Calendar,
  Heart,
  MessageCircle,
  ExternalLink,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';

const CollaboratorsCard = ({ 
  student, 
  showProjects = true, 
  showPublications = false, 
  compact = false,
  onRequestSent = () => {},
  projectId = null
}) => {
  const { colors } = useTheme();
  const {showSuccess, showError, showWarning, showInfo } = useAlert();
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [publications, setPublications] = useState([]);
  const [collaborationStatus, setCollaborationStatus] = useState('none'); // none, pending, sent, accepted
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (student?._id) {
      fetchStudentData();
      checkCollaborationStatus();
    }
  }, [student]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Fetch student's projects
      if (showProjects) {
        try {
          const projectsResponse = await axios.get(`/projects/user/${student._id}`);
          setProjects(projectsResponse.data.data || []);
        } catch (err) {
          console.warn('Could not fetch projects:', err);
        }
      }

      // Fetch student's publications if enabled
      if (showPublications) {
        try {
          const publicationsResponse = await axios.get(`/publications/user/${student._id}`);
          setPublications(publicationsResponse.data.data || []);
        } catch (err) {
          console.warn('Could not fetch publications:', err);
        }
      }

    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

// Update the checkCollaborationStatus function
const checkCollaborationStatus = async () => {
  try {
    const response = await axios.get(`/collaborations/status/${student._id}`);
    setCollaborationStatus(response.data.status || 'none');
  } catch (err) {
    console.warn('Could not check collaboration status:', err);
    // If the route doesn't exist, just set to 'none'
    setCollaborationStatus('none');
  }
};

// Update the sendCollaborationRequest function
const sendCollaborationRequest = async (customMessage) => {
  try {
    setRequestLoading(true);

    const requestData = {
      recipientId: student._id,
      message: customMessage || `Hi ${student.name}, I'd like to collaborate with you on academic projects. Let's connect!`
    };

    // If we have a projectId, include it in the request
    if (projectId) {
      requestData.projectId = projectId;
    }

    const response = await axios.post('/collaborations/request', requestData);

    if (response.data.success) {
      setCollaborationStatus('sent');
      setShowRequestModal(false);
      onRequestSent(student._id);
      
      // Show success message (you can customize this)
      showSuccess('Collaboration request sent successfully!');
    }
  } catch (err) {
    console.error('Error sending collaboration request:', err);
    
    // Handle specific error cases
    if (err.response?.status === 404) {
      showWarning('Collaboration feature is not available yet.');
    } else if (err.response?.data?.message) {
      showError(err.response.data.message);
    } else {
      showError('Failed to send collaboration request. Please try again.');
    }
  } finally {
    setRequestLoading(false);
  }
};
  

  const getCollaborationButtonConfig = () => {
    const isProjectCollaboration = !!projectId;
    
    switch (collaborationStatus) {
      case 'sent':
        return {
          text: isProjectCollaboration ? 'Project Request Sent' : 'Request Sent',
          icon: Clock,
          disabled: true,
          color: colors.accent?.orange?.[500] || '#f59e0b',
          bg: `${colors.accent?.orange?.[500] || '#f59e0b'}20`
        };
      case 'accepted':
        return {
          text: isProjectCollaboration ? 'Project Collaborator' : 'Collaborating',
          icon: Check,
          disabled: true,
          color: colors.accent?.green?.[500] || '#22c55e',
          bg: `${colors.accent?.green?.[500] || '#22c82f6'}20`
        };
      case 'pending':
        return {
          text: 'Please Respond to Request',
          icon: MessageCircle,
          disabled: false,
          color: colors.primary?.blue?.[500] || '#3b82f6',
          bg: `${colors.primary?.blue?.[500] || '#3b82f6'}20`
        };
      default:
        return {
          text: isProjectCollaboration ? 'Request Project Collaboration' : 'Send Request',
          icon: Send,
          disabled: false,
          color: colors.primary?.blue?.[500] || '#3b82f6',
          bg: `${colors.primary?.blue?.[500] || '#3b82f6'}20`
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getSkillBadgeColor = (skill, index) => {
    const colors_array = [
      colors.primary?.blue?.[500] || '#3b82f6',
      colors.primary?.purple?.[500] || '#9333ea',
      colors.accent?.pink?.[500] || '#ec4899',
      colors.accent?.green?.[500] || '#22c55e',
      colors.accent?.orange?.[500] || '#f59e0b'
    ];
    return colors_array[index % colors_array.length];
  };

  if (!student) {
    return null;
  }

  const buttonConfig = getCollaborationButtonConfig();
  const isOwnProfile = currentUser?.id === student._id;

  return (
    <div 
      className={`backdrop-blur-lg rounded-xl border shadow-lg transition-all duration-300 hover:scale-[1.02] group ${
        compact ? 'p-4' : 'p-6'
      }`}
      style={{
        backgroundColor: colors.background.glass,
        borderColor: colors.border.secondary
      }}
    >
      {/* Student Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          {student.profileImage ? (
            <img
              src={student.profileImage}
              alt={student.name}
              className="w-14 h-14 rounded-full object-cover border-2"
              style={{ borderColor: colors.primary?.blue?.[400] || '#60a5fa' }}
            />
          ) : (
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center border-2"
              style={{ 
                backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}20`,
                borderColor: colors.primary?.blue?.[400] || '#60a5fa'
              }}
            >
              <User size={20} style={{ color: colors.primary?.blue?.[500] || '#3b82f6' }} />
            </div>
          )}
          
          {/* Online Status Indicator
          <div 
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
            style={{ 
              backgroundColor: colors.accent?.green?.[500] || '#22c55e',
              borderColor: colors.background.primary
            }}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        // </div> */}


  </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold truncate" style={{ color: colors.text.primary }}>
            {student.name}
          </h3>
          
          <div className="flex items-center mt-1">
            <GraduationCap size={14} style={{ color: colors.text.secondary }} />
            <span className="text-sm ml-1 truncate" style={{ color: colors.text.secondary }}>
              {student.department || 'Computer Science'} • {student.university || 'University  not specified'}
            </span>
          </div>

          {student.location && (
            <div className="flex items-center mt-1">
              <MapPin size={12} style={{ color: colors.text.secondary }} />
              <span className="text-xs ml-1" style={{ color: colors.text.secondary }}>
                {student.location}
              </span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {/* <div className="text-right">
          <div className="text-sm font-bold" style={{ color: colors.text.primary }}>
            {student.rating || '4.8'}
          </div>
          <div className="flex items-center justify-end">
            <Star size={12} style={{ color: colors.accent?.orange?.[500] || '#f59e0b' }} fill="currentColor" />
            <span className="text-xs ml-1" style={{ color: colors.text.secondary }}>
              ({student.reviewCount || '12'})
            </span>
          </div>
        </div> */}
      </div>

      {/* Skills/Interests */}
      {student.skills && student.skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {student.skills.slice(0, compact ? 3 : 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${getSkillBadgeColor(skill, index)}20`,
                  color: getSkillBadgeColor(skill, index)
                }}
              >
                {skill}
              </span>
            ))}
            {student.skills.length > (compact ? 3 : 5) && (
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${colors.text.secondary}20`,
                  color: colors.text.secondary
                }}
              >
                +{student.skills.length - (compact ? 3 : 5)} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bio/Description */}
      {student.bio && !compact && (
        <div className="mb-4">
          <p className="text-sm line-clamp-2" style={{ color: colors.text.secondary }}>
            {student.bio}
          </p>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg" style={{ backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}10` }}>
          <div className="text-lg font-bold" style={{ color: colors.text.primary }}>
            {projects.length}
          </div>
          <div className="text-xs" style={{ color: colors.text.secondary }}>
            Projects
          </div>
        </div>
        <div className="text-center p-2 rounded-lg" style={{ backgroundColor: `${colors.primary?.purple?.[500] || '#9333ea'}10` }}>
          <div className="text-lg font-bold" style={{ color: colors.text.primary }}>
            {publications.length}
          </div>
          <div className="text-xs" style={{ color: colors.text.secondary }}>
            Publications
          </div>
        </div>
        {/* <div className="text-center p-2 rounded-lg" style={{ backgroundColor: `${colors.accent?.green?.[500] || '#22c55e'}10` }}>
          <div className="text-lg font-bold" style={{ color: colors.text.primary }}>
            {student.collaborations || 0}
          </div>
          <div className="text-xs" style={{ color: colors.text.secondary }}>
            Collaborations
          </div>
        </div> */}

      </div>

      {/* Recent Projects Preview */}
      {showProjects && projects.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <FolderOpen size={14} style={{ color: colors.primary?.blue?.[500] || '#3b82f6' }} />
            <span className="text-sm font-medium ml-1" style={{ color: colors.text.primary }}>
              Recent Projects
            </span>
          </div>
          <div className="space-y-2">
            {projects.slice(0, compact ? 1 : 2).map((project) => (
              <div
                key={project._id}
                className="p-2 rounded-lg border"
                style={{
                  backgroundColor: `${colors.background.card}60`,
                  borderColor: colors.border.secondary
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-xs truncate" style={{ color: colors.text.primary }}>
                    {project.title}
                  </h4>
                  <span
                    className="px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: `${colors.accent?.green?.[500] || '#22c55e'}20`,
                      color: colors.accent?.green?.[500] || '#22c55e'
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="text-xs mt-1 line-clamp-1" style={{ color: colors.text.secondary }}>
                  {project.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {(student.github || student.linkedin || student.website) && !compact && (
        <div className="flex space-x-2 mb-4">
          {student.github && (
            <a
              href={student.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: `${colors.text.secondary}20`,
                color: colors.text.secondary
              }}
            >
              <Github size={14} />
            </a>
          )}
          {student.linkedin && (
            <a
              href={student.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}20`,
                color: colors.primary?.blue?.[500] || '#3b82f6'
              }}
            >
              <Linkedin size={14} />
            </a>
          )}
          {student.website && (
            <a
              href={student.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: `${colors.accent?.green?.[500] || '#22c55e'}20`,
                color: colors.accent?.green?.[500] || '#22c55e'
              }}
            >
              <Globe size={14} />
            </a>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {!isOwnProfile && (
          <button
            onClick={collaborationStatus === 'none' ? () => setShowRequestModal(true) : undefined}
            disabled={buttonConfig.disabled || requestLoading}
            className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50"
            style={{
              backgroundColor: buttonConfig.bg,
              color: buttonConfig.color,
              border: `1px solid ${buttonConfig.color}40`
            }}
          >
            {requestLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <buttonConfig.icon size={16} className="mr-2" />
            )}
            {requestLoading ? 'Sending...' : buttonConfig.text}
          </button>
        )}

        <button
          className="px-3 py-2 rounded-lg transition-colors border"
          style={{
            backgroundColor: 'transparent',
            color: colors.text.secondary,
            borderColor: colors.border.secondary
          }}
          onClick={() => window.open(`/#/profile/${student._id}`, '_blank')}
        >
          <ExternalLink size={16} />
        </button>



      </div>

      {/* Join Date */}
      <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.border.secondary }}>
        <div className="flex items-center justify-center">
          <Calendar size={12} style={{ color: colors.text.muted }} />
          <span className="text-xs ml-1" style={{ color: colors.text.muted }}>
            Joined {formatDate(student.createdAt || new Date())}
          </span>
        </div>
      </div>

      {/* Collaboration Request Modal */}
      <CollaborationRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        recipient={student}
        onSend={sendCollaborationRequest}
        loading={requestLoading}
      />
    </div>
  );
};

export default CollaboratorsCard;