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
      color: colors.status.error.text,
      borderRadius: '8px',
      padding: '12px 16px',
      fontWeight: '500'
    },
    success: {
      backgroundColor: colors.status.success.background,
      border: `1px solid ${colors.status.success.border}`,
      color: colors.status.success.text,
      borderRadius: '8px',
      padding: '12px 16px',
      fontWeight: '500'
    },
    warning: {
      backgroundColor: colors.status.warning.background,
      border: `1px solid ${colors.status.warning.border}`,
      color: colors.status.warning.text,
      borderRadius: '8px',
      padding: '12px 16px',
      fontWeight: '500'
    },
    info: {
      backgroundColor: colors.primary.blue[50] || '#eff6ff',
      border: `1px solid ${colors.primary.blue[200] || '#bfdbfe'}`,
      color: colors.primary.blue[700] || '#1d4ed8',
      borderRadius: '8px',
      padding: '12px 16px',
      fontWeight: '500'
    },
    loading: {
      backgroundColor: colors.text.muted || '#f3f4f6',
      border: `1px solid ${colors.border.secondary}`,
      color: colors.text.secondary,
      borderRadius: '8px',
      padding: '12px 16px',
      fontWeight: '500'
    }
  };

  return styles[type] || styles.info;
};

// Centralized status messages
export const getStatusMessage = (type, context = 'general') => {
  const messages = {
    // Authentication messages
    auth: {
      success: 'Successfully authenticated!',
      error: 'Authentication failed. Please check your credentials.',
      logout: 'Logged out successfully',
      sessionExpired: 'Your session has expired. Please log in again.',
      unauthorized: 'You are not authorized to access this resource.'
    },
    
    // Data operation messages
    data: {
      loading: 'Loading data...',
      success: 'Data loaded successfully',
      error: 'Failed to load data. Please try again.',
      notFound: 'No data found',
      empty: 'No items to display'
    },
    
    // CRUD operation messages
    create: {
      success: 'Item created successfully',
      error: 'Failed to create item. Please try again.',
      loading: 'Creating item...'
    },
    
    update: {
      success: 'Item updated successfully',
      error: 'Failed to update item. Please try again.',
      loading: 'Updating item...'
    },
    
    delete: {
      success: 'Item deleted successfully',
      error: 'Failed to delete item. Please try again.',
      loading: 'Deleting item...',
      confirm: 'Are you sure you want to delete this item?'
    },
    
    // Network/Connection messages
    network: {
      error: 'Network error. Please check your connection.',
      timeout: 'Request timed out. Please try again.',
      offline: 'You appear to be offline. Please check your connection.',
      serverError: 'Server error occurred. Please try again later.'
    },
    
    // Collaboration messages
    collaboration: {
      requestSent: 'Collaboration request sent successfully!',
      requestError: 'Failed to send collaboration request.',
      requestAccepted: 'Collaboration request accepted!',
      requestDeclined: 'Collaboration request declined.',
      alreadyCollaborating: 'You are already collaborating with this user.',
      cannotCollaborateWithSelf: 'You cannot send a collaboration request to yourself!'
    },
    
    // File upload messages
    upload: {
      success: 'File uploaded successfully',
      error: 'Failed to upload file. Please try again.',
      invalidType: 'Invalid file type. Please select a valid file.',
      tooLarge: 'File is too large. Please select a smaller file.',
      loading: 'Uploading file...'
    },
    
    // Validation messages
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      password: 'Password must be at least 8 characters long',
      match: 'Passwords do not match',
      minLength: 'Input is too short',
      maxLength: 'Input is too long'
    },
    
    // Generic messages
    general: {
      success: 'Operation completed successfully',
      error: 'An error occurred. Please try again.',
      loading: 'Loading...',
      saving: 'Saving...',
      processing: 'Processing...',
      noPermission: 'You do not have permission to perform this action.',
      featureUnavailable: 'This feature is not available yet.'
    }
  };

  return messages[context] || messages.general;
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
  getStatusMessage,
  getGradientTextStyles,
  getHoverEffects
};
