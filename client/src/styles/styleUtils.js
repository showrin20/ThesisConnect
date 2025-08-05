import { colors } from './colors';

/**
 * Utility functions for applying consistent styling across components
 */

// Form input styles
export const getInputStyles = (focused = false) => ({
  backgroundColor: colors.input.background,
  border: `1px solid ${focused ? colors.input.borderFocus : colors.input.border}`,
  color: colors.input.text,
  transition: 'all 0.3s ease'
});

// Button styles
export const getButtonStyles = (variant = 'primary', disabled = false) => {
  if (disabled) {
    return {
      backgroundColor: colors.button.disabled.background,
      color: colors.button.disabled.text,
      border: `1px solid ${colors.button.disabled.border}`,
      cursor: 'not-allowed'
    };
  }

  const styles = {
    primary: {
      background: colors.button.primary.background,
      color: colors.button.primary.text,
      border: `1px solid ${colors.button.primary.border}`
    },
    secondary: {
      backgroundColor: colors.button.secondary.background,
      color: colors.button.secondary.text,
      border: `2px solid ${colors.button.secondary.text}`
    },
    outline: {
      backgroundColor: colors.button.outline.background,
      color: colors.button.outline.text,
      border: `1px solid ${colors.button.outline.border}`
    },
    danger: {
      backgroundColor: colors.button.danger.background,
      color: colors.button.danger.text,
      border: `1px solid ${colors.button.danger.border}`
    },
    success: {
      backgroundColor: colors.button.success.background,
      color: colors.button.success.text,
      border: `1px solid ${colors.button.success.border}`
    }
  };

  return styles[variant] || styles.primary;
};

// Card styles
export const getCardStyles = (variant = 'default') => {
  const baseStyles = {
    backgroundColor: colors.background.card,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${colors.border.secondary}`
  };

  if (variant === 'glass') {
    return {
      ...baseStyles,
      backgroundColor: colors.background.glass
    };
  }

  return baseStyles;
};

// Status message styles
export const getStatusStyles = (type = 'info') => {
  const styles = {
    error: {
      backgroundColor: colors.status.error.background,
      border: `1px solid ${colors.status.error.border}`,
      color: colors.status.error.text
    },
    success: {
      backgroundColor: colors.status.success.background,
      border: `1px solid ${colors.status.success.border}`,
      color: colors.status.success.text
    },
    warning: {
      backgroundColor: colors.status.warning.background,
      border: `1px solid ${colors.status.warning.border}`,
      color: colors.status.warning.text
    }
  };

  return styles[type] || styles.error;
};

// Gradient text styles
export const getGradientTextStyles = (gradient = 'primary') => {
  const gradients = {
    primary: colors.gradients.brand.primary,
    secondary: colors.gradients.brand.secondary,
    dark: colors.gradients.brand.dark
  };

  return {
    background: gradients[gradient] || gradients.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };
};

// Hover effect utilities
export const getHoverEffects = {
  scale: {
    transform: 'scale(1.05)',
    transition: 'transform 0.3s ease'
  },
  lift: {
    transform: 'translateY(-4px)',
    transition: 'transform 0.3s ease'
  },
  glow: {
    boxShadow: `0 0 20px ${colors.primary.blue[400]}40`,
    transition: 'box-shadow 0.3s ease'
  }
};

export default {
  getInputStyles,
  getButtonStyles,
  getCardStyles,
  getStatusStyles,
  getGradientTextStyles,
  getHoverEffects
};
