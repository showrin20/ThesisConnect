import React from 'react';
import { colors } from '../styles/colors';

/**
 * StatusIndicator component to display various status messages with appropriate styling
 * @param {Object} props - Component props
 * @param {string} props.type - The type of status: 'success', 'error', 'warning', 'info'
 * @param {string} props.message - The message to display
 * @param {boolean} props.show - Whether to show the indicator
 * @param {Function} props.onDismiss - Optional callback for dismissing the indicator
 */
const StatusIndicator = ({ 
  type = 'info', 
  message, 
  show = true, 
  onDismiss,
  className = ''
}) => {
  if (!show || !message) return null;

  // Define status types with their corresponding styles
  const statusStyles = {
    success: {
      background: colors.status.success.background,
      text: colors.status.success.text,
      border: colors.status.success.border,
      icon: '✓'
    },
    error: {
      background: colors.status.error.background,
      text: colors.status.error.text,
      border: colors.status.error.border,
      icon: '✕'
    },
    warning: {
      background: colors.status.warning.background,
      text: colors.status.warning.text,
      border: colors.status.warning.border,
      icon: '⚠'
    },
    info: {
      background: colors.status.info.background,
      text: colors.status.info.text,
      border: colors.status.info.border,
      icon: 'ℹ'
    }
  };

  // Get styles for current type, default to info
  const currentStyle = statusStyles[type] || statusStyles.info;

  return (
    <div 
      className={`p-3 rounded-lg flex items-start mb-4 animate-fadeIn ${className}`}
      style={{ 
        backgroundColor: currentStyle.background,
        color: currentStyle.text,
        border: `1px solid ${currentStyle.border}`
      }}
    >
      <div className="mr-3 font-bold">{currentStyle.icon}</div>
      <div className="flex-1">{message}</div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="ml-2 text-sm hover:opacity-75"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default StatusIndicator;
