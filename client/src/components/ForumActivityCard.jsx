import React from 'react';
import { Clock } from 'lucide-react';

const ForumActivityCard = ({ title, snippet, tags, time, category }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
      <div className="relative bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.01]">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-white font-medium text-base group-hover:text-sky-400 transition-colors duration-300 line-clamp-2">
            {title}
          </h4>
        </div>
        
        <p className="text-white/70 text-sm mb-3 line-clamp-2">
          {snippet}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs font-medium border border-purple-500/30"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-white/50">
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
