import React from 'react';
import { ExternalLink } from 'lucide-react';
import { colors } from '../styles/colors';

const ProjectCard = ({ title, description, link, tags, status, category }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return {
          backgroundColor: `${colors.accent.green[500]}33`,
          color: colors.accent.green[400],
          borderColor: `${colors.accent.green[500]}4D`
        };
      case 'Review':
        return {
          backgroundColor: `${colors.accent.yellow[500]}33`,
          color: colors.accent.yellow[400],
          borderColor: `${colors.accent.yellow[500]}4D`
        };
      case 'Completed':
        return {
          backgroundColor: `${colors.primary.blue[500]}33`,
          color: colors.primary.blue[400],
          borderColor: `${colors.primary.blue[500]}4D`
        };
      default:
        return {
          backgroundColor: `${colors.text.disabled}33`,
          color: colors.text.disabled,
          borderColor: `${colors.text.disabled}4D`
        };
    }
  };

  const trimmedLink = link?.trim();

  return (
    <div className="relative group">
      <div 
        className="absolute inset-0 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${colors.primary.purple[600]}1A, ${colors.primary.blue[600]}1A)`
        }}
      ></div>
      <div 
        className="relative backdrop-blur-lg rounded-xl p-6 border hover:scale-[1.02] transition-all duration-300"
        style={{
          backgroundColor: colors.background.glass,
          borderColor: colors.border.secondary
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.background.glass}CC`}
        onMouseLeave={(e) => e.target.style.backgroundColor = colors.background.glass}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 
            className="font-semibold text-lg transition-colors duration-300"
            style={{ color: colors.text.primary }}
            onMouseEnter={(e) => e.target.style.color = colors.primary.blue[400]}
            onMouseLeave={(e) => e.target.style.color = colors.text.primary}
          >
            {title}
          </h3>
          <span 
            className="px-3 py-1 rounded-full text-xs font-medium border"
            style={getStatusColor(status)}
          >
            {status}
          </span>
        </div>
        
        <p className="text-sm mb-4 line-clamp-2" style={{ color: `${colors.text.secondary}B3` }}>
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags && tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 rounded-md text-xs font-medium border"
              style={{
                backgroundColor: `${colors.primary.blue[500]}33`,
                color: colors.primary.blue[300],
                borderColor: `${colors.primary.blue[500]}4D`
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs" style={{ color: `${colors.text.secondary}80` }}>
            Category: {category || 'Research'}
          </div>
          {trimmedLink ? (
            <a
              href={trimmedLink.startsWith('http') ? trimmedLink : `https://${trimmedLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 border rounded-lg transition-all duration-200 text-xs font-medium"
              style={{
                backgroundColor: `${colors.primary.blue[500]}33`,
                color: colors.primary.blue[400],
                borderColor: `${colors.primary.blue[500]}4D`
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.primary.blue[500]}4D`}
              onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.primary.blue[500]}33`}
            >
              <span>View Project</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: colors.text.disabled }}>No project link available</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
