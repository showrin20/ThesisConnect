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
  const [isDarkMode, setIsDarkMode] = useState(getCurrentTheme());
  const [colors, setColors] = useState(getColors());

  useEffect(() => {
    const handleThemeChange = (event) => {
      const newIsDarkMode = event.detail.isDarkMode;
      setIsDarkMode(newIsDarkMode);
      setColors(getColors());
    };

    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  const toggle = () => {
    const newTheme = toggleTheme();
    setIsDarkMode(newTheme);
    setColors(getColors());
    return newTheme;
  };

  const setThemeMode = (darkMode) => {
    const newTheme = setTheme(darkMode);
    setIsDarkMode(newTheme);
    setColors(getColors());
    return newTheme;
  };

  const value = {
    isDarkMode,
    colors,
    toggleTheme: toggle,
    setTheme: setThemeMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
