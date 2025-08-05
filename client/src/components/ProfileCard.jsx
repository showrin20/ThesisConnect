import React, { useContext } from 'react';
import {
  User, MapPin, BookOpen, Users,
  GraduationCap, Globe2, GitBranch,
  ShieldCheck
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext'; // adjust path as needed

const ProfileCard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null; // don't show the card if user isn't loaded yet

  return (
    <div className="relative group">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>

      {/* Card */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
        
        {/* Top */}
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-sky-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
            {user.name?.[0]?.toUpperCase() || <User size={24} />}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              {user.name}
            </h3>
            <p className="text-white/70 text-sm flex items-center gap-1">
              <MapPin size={14} />
              {user.university}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} />
            <span>{user.domain}</span>
          </div>

          <div className="flex items-center gap-2">
            <Globe2 size={16} />
            <a 
              href={user.scholarLink} 
              target="_blank" 
              rel="noreferrer" 
              className="underline text-blue-300 hover:text-blue-200 transition-colors"
            >
              Google Scholar
            </a>
          </div>

          <div className="flex items-center gap-2">
            <GitBranch size={16} />
            <a 
              href={user.githubLink} 
              target="_blank" 
              rel="noreferrer" 
              className="underline text-green-300 hover:text-green-200 transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span className="capitalize">{user.role}</span>
          </div>

          {user.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {user.keywords.map((kw, idx) => (
                <span 
                  key={idx} 
                  className="bg-white/20 text-white/80 px-2 py-1 text-xs rounded-md"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Stats */}
        <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm flex items-center gap-2">
              <BookOpen size={16} />
              Publications
            </span>
            <span className="text-green-400 font-semibold">24</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm flex items-center gap-2">
              <Users size={16} />
              Collaborators
            </span>
            <span className="text-purple-400 font-semibold">8</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm flex items-center gap-2">
              🕒 Research Hours
            </span>
            <span className="text-yellow-400 font-semibold">156</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
