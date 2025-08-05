export const colors = {
  primary: {
    blue: {
      50: '#f5faff',
      100: '#e0f2ff',
      200: '#b9ddff',
      300: '#7ec2ff',
      400: '#51a9f7',
      500: '#2b91ea', // new primary
      600: '#1e81ce',
      700: '#1867a8',
      800: '#145087',
      900: '#0d375e'
    },
    purple: {
      50: '#f9f5ff',
      100: '#e8ddff',
      200: '#cbb7ff',
      300: '#ad90ff',
      400: '#9771f2',
      500: '#7f56d9',
      600: '#6932cc', // new primary purple
      700: '#5c2db6',
      800: '#43208a',
      900: '#2e1462'
    },
    pink: {
      400: '#f38cb5',
      500: '#ec6aa2',
      600: '#d95091'
    }
  },

  accent: {
    green: {
      300: '#b1e9c4',
      400: '#6dd3a7',
      500: '#3cbf90',
      600: '#1f9c75'
    },
    orange: {
      300: '#ffddb0',
      400: '#ffb871',
      500: '#f78a3c',
      600: '#dc6825'
    },
    red: {
      300: '#f9b3b3',
      400: '#f77979',
      500: '#ec4c4c',
      600: '#c93030'
    },
    yellow: {
      300: '#fde68a',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04'
    }
  },

  background: {
    primary: '#ffffff',       // white background
    secondary: '#f9fafb',     // light gray for cards/sections
    tertiary: '#e5e7eb',      // soft gray for subtle contrast
    dark: '#d1d5db',          // light gray, not really dark
    gray: {
      700: '#4b5563',
      800: '#374151',
      900: '#1f2937'
    },
    card: 'rgba(243, 244, 246, 0.7)',   // light glass effect
    glass: 'rgba(255, 255, 255, 0.6)',  // white glass effect
    overlay: 'rgba(255, 255, 255, 0.45)'// lighter overlay
  },

  surface: {
    primary: '#ffffff',    // white card background
    secondary: '#f3f4f6',  // light gray card alternative
    muted: '#e5e7eb'       // subtle backgrounds
  },

  text: {
    primary: '#1f2937',  // dark gray-800 for main text
    secondary: '#4b5563',// gray-600
    muted: '#6b7280',    // gray-500 for disabled/placeholder text
    disabled: '#9ca3af', // gray-400
    error: '#ef4444',
    success: '#22c55e',
    warning: '#eab308',
    transparent: 'transparent'
  },

  border: {
    primary: '#d1d5db', // gray-300
    secondary: 'rgba(0, 0, 0, 0.1)', // subtle shadow
    light: 'rgba(0, 0, 0, 0.05)',
    blue: 'rgba(43, 145, 234, 0.3)', // light blue border
    purple: 'rgba(127, 86, 217, 0.3)',
    error: 'rgba(239, 68, 68, 0.3)',
    success: 'rgba(34, 197, 94, 0.3)'
  },

  status: {
    error: {
      background: 'rgba(239, 68, 68, 0.2)',
      border: 'rgba(239, 68, 68, 0.4)',
      text: '#ef4444'
    },
    success: {
      background: 'rgba(34, 197, 94, 0.15)',
      border: 'rgba(34, 197, 94, 0.4)',
      text: '#86efac'
    },
    warning: {
      background: 'rgba(251, 191, 36, 0.2)',
      border: 'rgba(251, 191, 36, 0.4)',
      text: '#fcd34d'
    }
  },

  gradients: {
    brand: {
      primary: 'linear-gradient(90deg, #2b91ea 0%, #7f56d9 100%)',
      secondary: 'linear-gradient(90deg, #145087 0%, #7f56d9 50%, #ec6aa2 100%)',
      dark: 'linear-gradient(90deg, #e0f2ff 0%, #ede9fe 100%)',      // softer gradient for light bg
      darkHover: 'linear-gradient(90deg, #dbeafe 0%, #cbb7ff 100%)'
    },
    background: {
      main: 'linear-gradient(180deg, #ffffff, #f9fafb)',               // subtle white gradient bg
      hero: 'linear-gradient(90deg, #e0f2ff, #ad90ff, #e0f2ff)',
      overlay: 'linear-gradient(90deg, rgba(43, 145, 234, 0.1), rgba(127, 86, 217, 0.1))',
      radial: 'radial-gradient(circle at center, rgba(43, 145, 234, 0.1), transparent 70%)',
      page: 'linear-gradient(135deg, rgba(127, 86, 217, 0.1), #ffffff, rgba(43, 145, 234, 0.1))'
    },
    accent: {
      blue: 'linear-gradient(90deg, #2b91ea, #7ec2ff)',
      green: 'linear-gradient(90deg, #3cbf90, #b1e9c4)',
      purple: 'linear-gradient(90deg, #7f56d9, #d8b4fe)',
      orange: 'linear-gradient(90deg, #f78a3c, #ffddb0)',
      red: 'linear-gradient(90deg, #ec4c4c, #f9b3b3)',
      yellow: 'linear-gradient(90deg, #facc15, #fde68a)'
    }
  },

  button: {
    primary: {
      background: 'linear-gradient(to right, #2b91ea, #7f56d9)',
      backgroundHover: 'linear-gradient(to right, #1e81ce, #5c2db6)',
      text: '#ffffff',
      border: 'transparent'
    },
    secondary: {
      background: 'transparent',
      backgroundHover: '#7f56d9',
      text: '#7f56d9',
      textHover: '#ffffff',
      border: '#7f56d9'
    },
    outline: {
      background: 'transparent',
      backgroundHover: 'rgba(127, 86, 217, 0.1)',
      text: '#7f56d9',
      textHover: '#5c2db6',
      border: '#7f56d9'
    },
    danger: {
      background: '#ec4c4c',
      backgroundHover: '#c93030',
      text: '#ffffff',
      border: 'transparent'
    },
    success: {
      background: '#3cbf90',
      backgroundHover: '#1f9c75',
      text: '#ffffff',
      border: 'transparent'
    },
    disabled: {
      background: '#d1d5db',
      text: '#9ca3af',
      border: 'transparent'
    }
  },

  input: {
    background: 'rgba(243, 244, 246, 0.8)',
    border: '#d1d5db',
    borderFocus: '#51a9f7',
    text: '#1f2937',
    placeholder: '#6b7280'
  },

  icon: {
    primary: '#2b91ea',
    secondary: '#6b7280',
    muted: '#9ca3af',
    error: '#ec4c4c',
    success: '#4ade80',
    warning: '#facc15'
  },

  shadow: {
    default: 'rgba(0, 0, 0, 0.06)',
    lg: 'rgba(0, 0, 0, 0.12)',
    xl: 'rgba(0, 0, 0, 0.18)',
    '2xl': 'rgba(0, 0, 0, 0.24)'
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
