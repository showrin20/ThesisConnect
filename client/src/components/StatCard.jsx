import React from 'react';

const StatCard = ({ number, label, icon: Icon, color = 'text-sky-400' }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
      <div className="relative bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-3xl font-bold ${color} mb-1`}>
              {number}
            </div>
            <div className="text-white/80 text-sm font-medium">
              {label}
            </div>
          </div>
          <div className={`${color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}>
            <Icon size={32} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
