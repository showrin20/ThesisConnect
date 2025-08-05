import React from 'react';
import { User, MapPin, BookOpen, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import colors from '../styles/colors'; // named export not destructuring

const ProfileCard = ({ userStats = null, loadingStats = false }) => {
  const { user, loading } = useAuth();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return {
          backgroundColor: `${colors.accent.red[400]}33`,
          color: colors.accent.red[300],
        };
      case 'mentor':
        return {
          backgroundColor: `${colors.primary.blue[500]}33`,
          color: colors.primary.blue[300],
        };
      case 'student':
        return {
          backgroundColor: `${colors.accent.green[400]}33`,
          color: colors.accent.green[300],
        };
      default:
        return {
          backgroundColor: `${colors.background.gray[700]}33`,
          color: colors.background.gray[700],
        };
    }
  };

  const displayRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Unknown';

  if (loading) {
    return (
      <div className="relative group">
        <div
          className="absolute inset-0 rounded-xl blur-sm"
          style={{
            background: `linear-gradient(to right, ${colors.primary.purple[600]}33, ${colors.primary.blue[600]}33)`
          }}
        ></div>
        <div
          className="relative rounded-xl p-6"
          style={{
            backgroundColor: colors.background.glass,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${colors.border.secondary}`
          }}
        >
          <div className="animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full mr-4" style={{ backgroundColor: `${colors.text.muted}20` }}></div>
              <div>
                <div className="h-4 rounded w-32 mb-2" style={{ backgroundColor: `${colors.text.muted}20` }}></div>
                <div className="h-3 rounded w-40" style={{ backgroundColor: `${colors.text.muted}20` }}></div>
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-3 rounded w-24" style={{ backgroundColor: `${colors.text.muted}20` }}></div>
                  <div className="h-3 rounded w-8" style={{ backgroundColor: `${colors.text.muted}20` }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div
        className="absolute inset-0 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${colors.primary.purple[600]}33, ${colors.primary.blue[600]}33)`
        }}
      ></div>
      <div
        className="relative rounded-xl p-6 hover:scale-105 transition-all duration-300"
        style={{
          backgroundColor: colors.background.glass,
          backdropFilter: 'blur(16px)',
          border: `1px solid ${colors.border.secondary}`
        }}
      >
        <div className="flex items-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl mr-4"
            style={{
              background: `linear-gradient(to right, ${colors.primary.blue[400]}, ${colors.primary.purple[400]})`,
              color: colors.text.primary
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={24} />}
          </div>
          <div>
            <h3 className="font-semibold text-lg" style={{ color: colors.text.primary }}>
              {user?.name || 'User'}
            </h3>
            <p className="text-sm flex items-center gap-1" style={{ color: colors.text.secondary }}>
              <MapPin size={14} />
              {user?.university || 'University not specified'}
            </p>
            {user?.domain && (
              <p className="text-xs flex items-center gap-1 mt-1" style={{ color: colors.text.muted }}>
                <GraduationCap size={12} />
                {user.domain}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={getRoleBadgeStyle(user?.role)}
              >
                {displayRole}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-2" style={{ color: colors.text.secondary }}>
              <BookOpen size={16} />
              Active Projects
            </span>
            <span style={{ color: colors.primary.blue[400], fontWeight: 600 }}>
              {loadingStats ? '...' : (userStats?.projects?.total || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-2" style={{ color: colors.text.secondary }}>
              <Users size={16} />
              Collaborators
            </span>
            <span style={{ color: colors.primary.purple[400], fontWeight: 600 }}>
              {loadingStats ? '...' : (userStats?.collaborators?.total || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-2" style={{ color: colors.text.secondary }}>
              <BookOpen size={16} />
              Publications
            </span>
            <span style={{ color: colors.accent.green[500], fontWeight: 600 }}>
              {loadingStats ? '...' : (userStats?.publications?.total || 0)}
            </span>
          </div>
        </div>

        {/* Keywords */}
        {user?.keywords?.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border.light}` }}>
            <div className="text-xs mb-2" style={{ color: colors.text.muted }}>
              Research Keywords
            </div>
            <div className="flex flex-wrap gap-1">
              {user.keywords.slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: colors.background.overlay,
                    color: colors.text.secondary
                  }}
                >
                  {keyword}
                </span>
              ))}
              {user.keywords.length > 3 && (
                <span
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: colors.background.overlay,
                    color: colors.text.muted
                  }}
                >
                  +{user.keywords.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* External Links */}
        {(user?.scholarLink || user?.githubLink) && (
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border.light}` }}>
            <div className="text-xs mb-2" style={{ color: colors.text.muted }}>
              External Links
            </div>
            <div className="flex gap-2">
              {user.scholarLink && (
                <a
                  href={user.scholarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs rounded-full transition-colors"
                  style={{
                    backgroundColor: `${colors.primary.blue[500]}33`,
                    color: colors.primary.blue[800]
                  }}
                >
                  Scholar
                </a>
              )}
              {user.githubLink && (
                <a
                  href={user.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs rounded-full transition-colors"
                  style={{
                    backgroundColor: `${colors.background.gray[700]}33`,
                    color: colors.background.gray[700]
                  }}
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
