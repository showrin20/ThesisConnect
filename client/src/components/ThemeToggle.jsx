import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${className}`}
      style={{
        backgroundColor: colors.surface.secondary,
        border: `1px solid ${colors.border.primary}`,
        color: colors.text.primary
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = colors.surface.muted;
        e.target.style.borderColor = colors.border.blue;
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = colors.surface.secondary;
        e.target.style.borderColor = colors.border.primary;
      }}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? (
        <Sun 
          className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-12" 
          style={{ color: colors.accent.yellow[400] }}
        />
      ) : (
        <Moon 
          className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-12" 
          style={{ color: colors.primary.purple[500] }}
        />
      )}
    </button>
  );
};

export default ThemeToggle;
