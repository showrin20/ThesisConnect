import React from 'react';

const ProjectCard = ({ title, description, tags, status, category }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Review':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
      <div className="relative bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-white font-semibold text-lg group-hover:text-sky-400 transition-colors duration-300">
            {title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        
        <p className="text-white/70 text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-sky-500/20 text-sky-300 rounded-md text-xs font-medium border border-sky-500/30"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="text-xs text-white/50">
          Category: {category}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;