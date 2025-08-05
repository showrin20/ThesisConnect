import React from 'react';
import { User, MapPin, BookOpen, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';

const ProfileCard = ({ userStats = null, loadingStats = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="relative group">
        <div
          className="absolute inset-0 rounded-xl blur-sm"
          style={{
            background: `linear-gradient(to right, ${colors.primary.purple[600]}20, ${colors.primary.blue[600]}20)`
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

  // Capitalize role name
  const displayRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Unknown';

  // Determine badge styles by role
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-300';
      case 'mentor':
        return 'bg-blue-500/20 text-blue-300';
      case 'student':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
      <div className="relative bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-sky-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={24} />}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              {user?.name || 'User'}
            </h3>
            <p className="text-white/70 text-sm flex items-center gap-1">
              <MapPin size={14} />
              {user?.university || 'University not specified'}
            </p>
            {user?.domain && (
              <p className="text-white/60 text-xs flex items-center gap-1 mt-1">
                <GraduationCap size={12} />
                {user.domain}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(user?.role)}`}
              >
                {displayRole}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm flex items-center gap-2">
              <BookOpen size={16} />
              Active Projects
            </span>
            <span className="text-sky-400 font-semibold">
              {loadingStats ? '...' : (userStats?.projects?.total || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm flex items-center gap-2">
              <Users size={16} />
              Collaborators
            </span>
            <span className="text-purple-400 font-semibold">
              {loadingStats ? '...' : (userStats?.collaborators?.total || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm flex items-center gap-2">
              <BookOpen size={16} />
              Publications
            </span>
            <span className="text-green-400 font-semibold">
              {loadingStats ? '...' : (userStats?.publications?.total || 0)}
            </span>
          </div>
        </div>

        {/* Keywords */}
        {user?.keywords?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs text-white/60 mb-2">Research Keywords</div>
            <div className="flex flex-wrap gap-1">
              {user.keywords.slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full"
                >
                  {keyword}
                </span>
              ))}
              {user.keywords.length > 3 && (
                <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-full">
                  +{user.keywords.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* External Links */}
        {(user?.scholarLink || user?.githubLink) && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs text-white/60 mb-2">External Links</div>
            <div className="flex gap-2">
              {user.scholarLink && (
                <a
                  href={user.scholarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full hover:bg-blue-500/30 transition-colors"
                >
                  Scholar
                </a>
              )}
              {user.githubLink && (
                <a
                  href={user.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full hover:bg-gray-500/30 transition-colors"
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
