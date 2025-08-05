/**
 * Centralized Color Scheme for ThesisConnect
 * All color values used throughout the application
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa', // Main blue
      500: '#3b82f6',
      600: '#2563eb', // Primary blue
      700: '#1d4ed8', // Darker blue
      800: '#1e40af',
      900: '#1e3a8a'
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc', // Main purple
      500: '#a855f7',
      600: '#9333ea', // Primary purple
      700: '#7c3aed',
      800: '#6b21a8', // Purple-800
      900: '#581c87' // Purple-900
    },
    pink: {
      400: '#f472b6', // Main pink
      500: '#ec4899',
      600: '#db2777'
    }
  },

  // Background Colors
  background: {
    primary: '#0f172a', // slate-900
    secondary: '#1e293b', // slate-800  
    tertiary: '#334155', // slate-700
    dark: '#020617', // slate-950
    gray: {
      700: '#374151', // gray-700
      800: '#1f2937', // gray-800
      900: '#111827'  // gray-900
    },
    card: 'rgba(30, 41, 59, 0.3)', // slate-800/30
    glass: 'rgba(255, 255, 255, 0.05)', // white/5
    overlay: 'rgba(0, 0, 0, 0.5)'
  },

  // Text Colors
  text: {
    primary: '#ffffff', // white
    secondary: '#d1d5db', // gray-300
    muted: '#9ca3af', // gray-400
    disabled: '#6b7280', // gray-500
    error: '#fca5a5', // red-300
    success: '#86efac', // green-300
    warning: '#fde047', // yellow-300
    transparent: 'transparent'
  },

  // Border Colors
  border: {
    primary: '#4b5563', // gray-600
    secondary: 'rgba(255, 255, 255, 0.1)', // white/10
    light: 'rgba(255, 255, 255, 0.3)', // white/30
    blue: 'rgba(96, 165, 250, 0.3)', // blue-400/30
    purple: 'rgba(192, 132, 252, 0.3)', // purple-400/30
    error: 'rgba(248, 113, 113, 0.5)', // red-500/50
    success: 'rgba(34, 197, 94, 0.5)' // green-500/50
  },

  // State Colors
  status: {
    error: {
      background: 'rgba(153, 27, 27, 0.3)', // red-900/30
      border: 'rgba(248, 113, 113, 0.5)', // red-500/50
      text: '#fca5a5' // red-300
    },
    success: {
      background: 'rgba(20, 83, 45, 0.3)', // green-900/30
      border: 'rgba(34, 197, 94, 0.5)', // green-500/50
      text: '#86efac' // green-300
    },
    warning: {
      background: 'rgba(146, 64, 14, 0.3)', // orange-900/30
      border: 'rgba(251, 146, 60, 0.5)', // orange-500/50
      text: '#fed7aa' // orange-200
    }
  },

  // Gradient Definitions
  gradients: {
    // Brand gradients
    brand: {
      primary: 'linear-gradient(to right, #60a5fa, #c084fc)', // blue-400 to purple-400
      secondary: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', // blue-400 via purple-400 to pink-400
      dark: 'linear-gradient(to right, #2563eb, #9333ea)', // blue-600 to purple-600
      darkHover: 'linear-gradient(to right, #1d4ed8, #7c3aed)' // blue-700 to purple-700
    },
    
    // Background gradients
    background: {
      main: 'linear-gradient(to bottom, #0f172a, #1f2937)', // slate-900 to gray-800
      hero: 'linear-gradient(to right, #1e293b, #6b21a8, #1e293b)', // slate-800 via purple-800 to slate-800
      overlay: 'linear-gradient(to right, rgba(96, 165, 250, 0.2), rgba(192, 132, 252, 0.2))', // blue-400/20 to purple-400/20
      radial: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.1), transparent 50%)', // sky-400/10
      page: 'linear-gradient(to bottom right, rgba(88, 28, 135, 0.2), #0f172a, rgba(30, 58, 138, 0.2))' // purple-900/20 via slate-900 to blue-900/20
    }
  },

  // Button Colors
  button: {
    primary: {
      background: 'linear-gradient(to right, #2563eb, #9333ea)',
      backgroundHover: 'linear-gradient(to right, #1d4ed8, #7c3aed)',
      text: '#ffffff',
      border: 'transparent'
    },
    secondary: {
      background: 'transparent',
      backgroundHover: '#c084fc',
      text: '#c084fc',
      textHover: '#ffffff',
      border: '#c084fc'
    },
    outline: {
      background: 'transparent',
      backgroundHover: 'rgba(255, 255, 255, 0.1)',
      text: '#d1d5db',
      textHover: '#ffffff',
      border: '#4b5563'
    },
    danger: {
      background: '#dc2626',
      backgroundHover: '#b91c1c',
      text: '#ffffff',
      border: 'transparent'
    },
    success: {
      background: '#059669',
      backgroundHover: '#047857',
      text: '#ffffff',
      border: 'transparent'
    },
    disabled: {
      background: '#6b7280',
      text: '#9ca3af',
      border: 'transparent'
    }
  },

  // Form Input Colors
  input: {
    background: 'rgba(30, 41, 59, 0.5)', // slate-800/50
    border: '#4b5563', // gray-600
    borderFocus: '#60a5fa', // blue-400
    text: '#ffffff',
    placeholder: '#9ca3af' // gray-400
  },

  // Icon Colors
  icon: {
    primary: '#60a5fa', // blue-400
    secondary: '#9ca3af', // gray-400
    muted: '#6b7280', // gray-500
    error: '#f87171', // red-400
    success: '#4ade80', // green-400
    warning: '#fbbf24' // amber-400
  },

  // Shadow Colors (for box-shadow utilities)
  shadow: {
    default: 'rgba(0, 0, 0, 0.1)',
    lg: 'rgba(0, 0, 0, 0.15)',
    xl: 'rgba(0, 0, 0, 0.25)',
    '2xl': 'rgba(0, 0, 0, 0.35)'
  }
};

// Utility function to get CSS custom properties
export const getCSSCustomProperties = () => {
  const flattenColors = (obj, prefix = '') => {
    let result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result = { ...result, ...flattenColors(value, `${prefix}${key}-`) };
      } else {
        result[`--color-${prefix}${key}`] = value;
      }
    }
    
    return result;
  };
  
  return flattenColors(colors);
};

export default colors;
