import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '', size = 20 }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${className}`}
      style={{
        backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}20`,
        color: colors.primary?.blue?.[500] || '#3b82f6',
        border: `1px solid ${colors.primary?.blue?.[400] || '#60a5fa'}40`
      }}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <Sun size={size} />
      ) : (
        <Moon size={size} />
      )}
    </button>
  );
};

export default ThemeToggle;