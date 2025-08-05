import React from 'react';
import { colors } from '../styles/colors';

const StatCard = ({ number, label, icon: Icon, color = colors.primary.blue[500] }) => {
  return (
    <div className="relative group">
      <div 
        className="absolute inset-0 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${colors.primary.purple[600]}33, ${colors.primary.blue[600]}33)`
        }}
      ></div>
      <div 
        className="relative backdrop-blur-lg rounded-xl p-6 border hover:scale-105 transition-all duration-300"
        style={{
          backgroundColor: `${colors.background.glass}66`,
          borderColor: `${colors.border.secondary}33`
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.background.glass}99`}
        onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.background.glass}66`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div 
              className="text-3xl font-bold mb-1"
              style={{ color }}
            >
              {number}
            </div>
            <div className="text-sm font-medium" style={{ color: `${colors.text.secondary}CC` }}>
              {label}
            </div>
          </div>
          <div
            className="group-hover:opacity-100 transition-opacity duration-300"
            style={{ color}}
          >
            <Icon size={32} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
