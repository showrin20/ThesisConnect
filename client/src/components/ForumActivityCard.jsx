import React from 'react';
import { Clock } from 'lucide-react';
import { colors } from '../styles/colors';

const ForumActivityCard = ({ title, snippet, tags, time, category }) => {
  return (
    <div className="relative group">
      <div 
        className="absolute inset-0 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${colors.primary.purple[600]}0D, ${colors.primary.blue[600]}0D)`
        }}
      ></div>
      <div 
        className="relative backdrop-blur-lg rounded-xl p-5 border hover:scale-[1.01] transition-all duration-300"
        style={{
          backgroundColor: colors.background.glass,
          borderColor: colors.border.secondary
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.background.glass}CC`}
        onMouseLeave={(e) => e.target.style.backgroundColor = colors.background.glass}
      >
        <div className="flex justify-between items-start mb-3">
          <h4 
            className="font-medium text-base transition-colors duration-300 line-clamp-2"
            style={{ color: colors.text.primary }}
            onMouseEnter={(e) => e.target.style.color = colors.primary.blue[400]}
            onMouseLeave={(e) => e.target.style.color = colors.text.primary}
          >
            {title}
          </h4>
        </div>
        
        <p className="text-sm mb-3 line-clamp-2" style={{ color: `${colors.text.secondary}B3` }}>
          {snippet}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 rounded-md text-xs font-medium border"
              style={{
                backgroundColor: `${colors.primary.purple[500]}33`,
                color: colors.primary.purple[300],
                borderColor: `${colors.primary.purple[500]}4D`
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs" style={{ color: `${colors.text.secondary}80` }}>
          <span>{category}</span>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumActivityCard;
