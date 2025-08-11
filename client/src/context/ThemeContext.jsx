import React, { createContext, useContext, useState, useEffect } from 'react';
import { getColors, toggleTheme, setTheme, getCurrentTheme } from '../styles/colors';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => getCurrentTheme());
  const [colors, setColors] = useState(() => getColors());

  // Apply theme immediately
  useEffect(() => {
    const newColors = getColors();
    setColors(newColors);
    
    // Force immediate re-render
    document.documentElement.style.setProperty('--theme-transition', 'none');
    setTimeout(() => {
      document.documentElement.style.removeProperty('--theme-transition');
    }, 0);
  }, [isDarkMode]);

  // Listen for theme changes from other sources
  useEffect(() => {
    const handleThemeChange = (event) => {
      setIsDarkMode(event.detail.isDarkMode);
      setColors(event.detail.colors);
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const toggle = () => {
    const newTheme = toggleTheme();
    setIsDarkMode(newTheme);
    return newTheme;
  };

  const setThemeMode = (darkMode) => {
    const newTheme = setTheme(darkMode);
    setIsDarkMode(newTheme);
    return newTheme;
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      colors, 
      toggleTheme: toggle, 
      setTheme: setThemeMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};