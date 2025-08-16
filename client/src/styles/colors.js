// Light mode colors
const lightColors = {
  primary: {
    blue: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',  // Same vibrant blue works well in light mode
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },
    purple: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',  // Same vibrant purple
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75'
    },
    pink: {
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777'
    }
  },

  accent: {
    green: {
      300: '#86efac',
      400: '#4ade80',
      500: '#38a169',  // Softer, more muted green
      600: '#2f855a'
    },
    orange: {
      300: '#fed7aa',
      400: '#fdba74',
      500: '#dd6b20',  // Warmer, less aggressive orange
      600: '#c05621'
    },
    red: {
      300: '#fca5a5',
      400: '#f87171',
      500: '#c53030',  // Softer, less harsh red
      600: '#9c2a2a'
    },
    yellow: {
      300: '#fef3c7',
      400: '#fed18c',
      500: '#d69e2e',  // Gentler, warmer yellow
      600: '#b7791f'
    }
  },

background: {
  primary: '#E6E4DF',   // Soft stone (main background, not white at all)
  secondary: '#DCD9D3', // Warmer beige-gray (for sections/cards)
  tertiary: '#D1CEC7',  // Slightly darker stone (panels, sidebars)
  dark: '#B8B5AE',      // Muted taupe (contrasting elements)
  gray: {
    700: '#5C5B58',     // Text gray (softer than pure black)
    800: '#3F3E3C',     // Strong headings
    900: '#2A2927'      // Deep charcoal, not pure black
  }
    
    
    ,
    card: 'rgba(250, 249, 247, 0.98)',      // Warm card background
    glass: 'rgba(255, 255, 255, 0.6)',      // Light glass effect
    overlay: 'rgba(255, 255, 255, 0.45)'    // Light overlay effect
  },

  surface: {
    primary: '#faf9f7',        // Warm cream surface
    secondary: '#f5f4f1',      // Gentle beige
    muted: '#ebe8e3'          // Soft taupe surface
  },

  text: {
    primary: '#1a1816',       // Soft blackish-brown, easier than pure black
    secondary: '#2d2926',     // Warm charcoal
    muted: '#4a453f',         // Medium warm gray-brown
    disabled: '#9b958f',      // Soft warm gray for disabled
    error: '#c53030',         // Softer, warmer red
    success: '#38a169',       // Gentler green
    warning: '#dd6b20',       // Warmer orange
    transparent: 'transparent'
  },

  border: {
    primary: '#ebe8e3',                    // Soft warm border
    secondary: 'rgba(139, 128, 109, 0.15)', // Gentle warm borders
    light: 'rgba(139, 128, 109, 0.08)',     // Very light warm borders
    blue: 'rgba(14, 165, 233, 0.15)',       // Softer blue accent
    purple: 'rgba(217, 70, 239, 0.15)',     // Softer purple accent
    error: 'rgba(197, 48, 48, 0.15)',       // Gentle error border
    success: 'rgba(56, 161, 105, 0.15)'     // Soft success border
  },

  status: {
    error: {
      background: 'rgba(197, 48, 48, 0.04)',
      border: 'rgba(197, 48, 48, 0.15)',
      text: '#c53030'
    },
    success: {
      background: 'rgba(56, 161, 105, 0.04)',
      border: 'rgba(56, 161, 105, 0.15)',
      text: '#38a169'
    },
    warning: {
      background: 'rgba(221, 107, 32, 0.04)',
      border: 'rgba(221, 107, 32, 0.15)',
      text: '#dd6b20'
    }
  },

  gradients: {
    brand: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)',        // Same vibrant gradient
      secondary: 'linear-gradient(135deg, #0284c7 0%, #c026d3 50%, #ec4899 100%)',
      dark: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',          // Light gradient
      darkHover: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'      // Hover state
    },
    background: {
      main: 'linear-gradient(180deg, #fefefe, #faf9f7)',
      hero: 'linear-gradient(135deg, #0ea5e9, #d946ef, #ec4899)',
      overlay: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(217, 70, 239, 0.1))',
      radial: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.1), transparent 70%)',
      page: 'linear-gradient(135deg, rgba(217, 70, 239, 0.015), #fefefe, rgba(14, 165, 233, 0.015))'
    },
    accent: {
      blue: 'linear-gradient(135deg, #0ea5e9, #7dd3fc)',
      green: 'linear-gradient(135deg, #38a169, #86efac)',
      purple: 'linear-gradient(135deg, #d946ef, #f0abfc)',
      orange: 'linear-gradient(135deg, #dd6b20, #fed7aa)',
      red: 'linear-gradient(135deg, #c53030, #fca5a5)',
      yellow: 'linear-gradient(135deg, #d69e2e, #fed18c)'
    }
  },

  button: {
    primary: {
      background: 'linear-gradient(135deg, #0ea5e9, #d946ef)',  // Same vibrant gradient
      backgroundHover: 'linear-gradient(135deg, #0284c7, #c026d3)',
      text: '#ffffff',
      border: 'transparent'
    },
    secondary: {
      background: 'transparent',
      backgroundHover: 'rgba(217, 70, 239, 0.05)',  // Very subtle hover
      text: '#d946ef',
      textHover: '#c026d3',
      border: '#d946ef'
    },
    outline: {
      background: 'transparent',
      backgroundHover: 'rgba(217, 70, 239, 0.03)',
      text: '#d946ef',
      textHover: '#c026d3',
      border: '#d946ef'
    },
    danger: {
      background: '#c53030',  // Softer red for light mode
      backgroundHover: '#9c2a2a',
      text: '#ffffff',
      border: 'transparent'
    },
    success: {
      background: '#38a169',  // Gentler green
      backgroundHover: '#2f855a',
      text: '#ffffff',
      border: 'transparent'
    },
    disabled: {
      background: '#ebe8e3',  // Warm light disabled
      text: '#9b958f',
      border: 'transparent'
    }
  },

  input: {
    background: 'rgba(250, 249, 247, 0.98)',  // Warm cream input
    border: '#ebe8e3',                         // Soft warm border
    borderFocus: '#0ea5e9',                    // Blue focus state
    text: '#1a1816',                           // Soft blackish-brown text
    placeholder: '#6b6560'                     // Warm gray placeholder
  },

  icon: {
    primary: '#0ea5e9',      // Blue primary icon
    secondary: '#6b6560',    // Warm gray secondary
    muted: '#9b958f',        // Soft warm gray muted
    error: '#c53030',        // Softer red error
    success: '#38a169',      // Gentler green success
    warning: '#dd6b20'       // Warm orange warning
  },

  shadow: {
    default: 'rgba(139, 128, 109, 0.08)',    // Warm, very subtle shadows
    lg: 'rgba(139, 128, 109, 0.12)',
    xl: 'rgba(139, 128, 109, 0.16)',
    '2xl': 'rgba(139, 128, 109, 0.2)'
  }
};

// Dark mode colors
const darkColors = {
  primary: {
    blue: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',  // Softer, less harsh blue
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },
    purple: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',  // Softer magenta-purple, easier on eyes
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75'
    },
    pink: {
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777'
    }
  },

  accent: {
    green: {
      300: '#86efac',
      400: '#4ade80',
      500: '#10d050',  // Gentler green, less electric
      600: '#16a34a'
    },
    orange: {
      300: '#fed7aa',
      400: '#fdba74',
      500: '#fb923c',  // Warmer, softer orange
      600: '#ea580c'
    },
    red: {
      300: '#fca5a5',
      400: '#f87171',
      500: '#f56565',  // Softer red, less aggressive
      600: '#e53e3e'
    },
    yellow: {
      300: '#fef3c7',
      400: '#fed18c',
      500: '#f6cc15',  // Warmer, creamier yellow
      600: '#d69e2e'
    }
  },

  background: {
    primary: '#1a202c',         // Warmer dark blue-gray, easier on eyes
    secondary: '#2d3748',       // Soft transition
    tertiary: '#4a5568',        // Gentle progression
    dark: '#171923',           // Less harsh than pure black
    gray: {
      700: '#4a5568',
      800: '#2d3748',
      900: '#1a202c'
    },
    card: 'rgba(45, 55, 72, 0.85)',      // Warmer card background
    glass: 'rgba(203, 213, 225, 0.06)',  // Very subtle warm glass
    overlay: 'rgba(203, 213, 225, 0.03)'
  },

  surface: {
    primary: '#2d3748',        // Warm, comfortable surface
    secondary: '#4a5568',      // Gentle elevation
    muted: '#718096'          // Soft, muted tone
  },

  text: {
    primary: '#f1f5f9',       // Slightly off-white — clean for dark mode
    secondary: '#e2e8f0',     // Light gray — readable subtitles
    muted: '#cbd5e1',         // Softer muted text for dark mode
    disabled: '#64748b',      // Medium gray, low emphasis
    error: '#ef4444',         // Vivid red — alert pop
    success: '#22c55e',       // Vivid green — success clarity
    warning: '#f59e0b',       // Bright amber — good contrast
    transparent: 'transparent'
  },

  border: {
    primary: '#718096',                    // Warm, soft border
    secondary: 'rgba(203, 213, 225, 0.15)', // Very gentle borders
    light: 'rgba(203, 213, 225, 0.08)',
    blue: 'rgba(14, 165, 233, 0.3)',      // Softer blue accent
    purple: 'rgba(217, 70, 239, 0.3)',    // Softer purple accent
    error: 'rgba(245, 101, 101, 0.3)',    // Gentle error border
    success: 'rgba(16, 208, 80, 0.3)'     // Soft success border
  },

  status: {
    error: {
      background: 'rgba(245, 101, 101, 0.08)',
      border: 'rgba(245, 101, 101, 0.25)',
      text: '#fc8181'
    },
    success: {
      background: 'rgba(16, 208, 80, 0.08)',
      border: 'rgba(16, 208, 80, 0.25)',
      text: '#68d391'
    },
    warning: {
      background: 'rgba(246, 224, 94, 0.1)',
      border: 'rgba(246, 224, 94, 0.3)',
      text: '#f6e05e'
    }
  },

  gradients: {
    brand: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)',        // Softer brand gradient
      secondary: 'linear-gradient(135deg, #0284c7 0%, #c026d3 50%, #ec4899 100%)',
      dark: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      darkHover: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)'
    },
    background: {
      main: 'linear-gradient(180deg, #1a202c, #2d3748)',
      hero: 'linear-gradient(135deg, #0ea5e9, #d946ef, #ec4899)',
      overlay: 'linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(217, 70, 239, 0.06))',
      radial: 'radial-gradient(circle at center, rgba(14, 165, 233, 0.06), transparent 70%)',
      page: 'linear-gradient(135deg, rgba(217, 70, 239, 0.04), #1a202c, rgba(14, 165, 233, 0.04))'
    },
    accent: {
      blue: 'linear-gradient(135deg, #0ea5e9, #7dd3fc)',
      green: 'linear-gradient(135deg, #10d050, #86efac)',
      purple: 'linear-gradient(135deg, #d946ef, #f0abfc)',
      orange: 'linear-gradient(135deg, #fb923c, #fed7aa)',
      red: 'linear-gradient(135deg, #f56565, #fca5a5)',
      yellow: 'linear-gradient(135deg, #f6cc15, #fed18c)'
    }
  },

  button: {
    primary: {
      background: 'linear-gradient(135deg, #0ea5e9, #d946ef)',  // Softer primary button
      backgroundHover: 'linear-gradient(135deg, #0284c7, #c026d3)',
      text: '#ffffff',
      border: 'transparent'
    },
    secondary: {
      background: 'transparent',
      backgroundHover: 'rgba(217, 70, 239, 0.08)',  // Very subtle hover
      text: '#d946ef',
      textHover: '#c026d3',
      border: '#d946ef'
    },
    outline: {
      background: 'transparent',
      backgroundHover: 'rgba(217, 70, 239, 0.06)',
      text: '#d946ef',
      textHover: '#c026d3',
      border: '#d946ef'
    },
    danger: {
      background: '#f56565',  // Softer danger button
      backgroundHover: '#e53e3e',
      text: '#ffffff',
      border: 'transparent'
    },
    success: {
      background: '#10d050',  // Gentler success
      backgroundHover: '#16a34a',
      text: '#ffffff',
      border: 'transparent'
    },
    disabled: {
      background: '#718096',  // Softer disabled
      text: '#a0aec0',
      border: 'transparent'
    }
  },

  input: {
    background: 'rgba(45, 55, 72, 0.95)',  // Warmer input background
    border: '#718096',                      // Soft border
    borderFocus: '#0ea5e9',                // Gentle focus state
    text: '#f7fafc',
    placeholder: '#a0aec0'                  // Softer placeholder
  },

  icon: {
    primary: '#0ea5e9',      // Softer primary icon
    secondary: '#e2e8f0',    // Warm secondary
    muted: '#a0aec0',        // Gentler muted
    error: '#fc8181',        // Soft error
    success: '#68d391',      // Gentle success
    warning: '#f6e05e'       // Soft warning
  },

  shadow: {
    default: 'rgba(26, 32, 44, 0.25)',    // Warmer, softer shadows
    lg: 'rgba(26, 32, 44, 0.35)',
    xl: 'rgba(26, 32, 44, 0.45)',
    '2xl': 'rgba(26, 32, 44, 0.55)'
  }
};

// // Theme management - Initialize with system preference
// let isDarkMode = typeof window !== 'undefined' ? 
//   window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches :
//   false;
// let currentColors = isDarkMode ? darkColors : lightColors; // Cache current colors

// // Function to get current colors based on theme
// export const getColors = () => {
//   currentColors = isDarkMode ? darkColors : lightColors;
//   return currentColors;
// };

// // Function to toggle theme
// export const toggleTheme = () => {
//   isDarkMode = !isDarkMode;
//   currentColors = getColors(); // Update cached colors
//   // Update the colors export
//   Object.assign(colors, currentColors);
//   // Trigger re-render by dispatching a custom event
//   if (typeof window !== 'undefined') {
//     window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDarkMode } }));
//   }
//   return isDarkMode;
// };

// // Function to set specific theme
// export const setTheme = (darkMode) => {
//   isDarkMode = darkMode;
//   currentColors = getColors(); // Update cached colors
//   // Update the colors export
//   Object.assign(colors, currentColors);
//   if (typeof window !== 'undefined') {
//     window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDarkMode } }));
//   }
//   return isDarkMode;
// };

// // Function to get current theme
// export const getCurrentTheme = () => isDarkMode;

// // Export colors for backward compatibility (will return current theme colors)
// export const colors = { ...(isDarkMode ? darkColors : lightColors) }; // Start with system preference

// // Utility function to get CSS custom properties
// export const getCSSCustomProperties = () => {
//   const flattenColors = (obj, prefix = '') => {
//     let result = {};

//     for (const [key, value] of Object.entries(obj)) {
//       if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
//         result = { ...result, ...flattenColors(value, `${prefix}${key}-`) };
//       } else {
//         result[`--color-${prefix}${key}`] = value;
//       }
//     }

//     return result;
//   };

//   return flattenColors(getColors());
// };

// export default colors;


// ... keep all your lightColors and darkColors objects as they are ...

// Keep all your existing color definitions (lightColors, darkColors)...

const THEME_KEY = 'thesisconnect-theme';

// Theme state management
let currentTheme = null;

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  if (typeof window === 'undefined') return false;
  
  const stored = localStorage.getItem(THEME_KEY);
  if (stored !== null) {
    currentTheme = JSON.parse(stored);
    return currentTheme;
  }
  
  currentTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  localStorage.setItem(THEME_KEY, JSON.stringify(currentTheme));
  return currentTheme;
};

// Apply CSS variables for immediate visual updates
const applyCSSVariables = (colors, isDark) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply theme class
  root.classList.toggle('dark', isDark);
  
  // Flatten and apply all color variables
  const flattenColors = (obj, prefix = 'color') => {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flattenColors(value, `${prefix}-${key}`);
      } else {
        root.style.setProperty(`--${prefix}-${key}`, value);
      }
    });
  };
  
  flattenColors(colors);
  
  // Force repaint
  root.style.display = 'none';
  root.offsetHeight; // Trigger reflow
  root.style.display = '';
};

// Get current theme
export const getCurrentTheme = () => {
  if (currentTheme === null) {
    currentTheme = initializeTheme();
  }
  return currentTheme;
};

// Get colors based on current theme
export const getColors = () => {
  const isDark = getCurrentTheme();
  const colors = isDark ? darkColors : lightColors;
  
  // Apply CSS variables
  applyCSSVariables(colors, isDark);
  
  return colors;
};

// Set theme
export const setTheme = (isDark) => {
  if (typeof window === 'undefined') return isDark;
  
  currentTheme = isDark;
  localStorage.setItem(THEME_KEY, JSON.stringify(isDark));
  
  const colors = isDark ? darkColors : lightColors;
  applyCSSVariables(colors, isDark);
  
  // Dispatch event for components
  window.dispatchEvent(new CustomEvent('themeChange', { 
    detail: { isDarkMode: isDark, colors } 
  }));
  
  return isDark;
};

// Toggle theme
export const toggleTheme = () => {
  const current = getCurrentTheme();
  return setTheme(!current);
};

// Export reactive colors
export const colors = new Proxy({}, {
  get(target, prop) {
    const currentColors = getCurrentTheme() ? darkColors : lightColors;
    return currentColors[prop];
  }
});

// Initialize on load
if (typeof window !== 'undefined') {
  initializeTheme();
  getColors();
}

export default colors;