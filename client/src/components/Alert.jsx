import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, X, Info } from 'lucide-react';
import { colors } from '../styles/colors';

const Alert = ({ 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  onClose, 
  autoClose = true, 
  duration = 5000,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); 
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.status.success.background,
          borderColor: colors.status.success.border,
          textColor: colors.text.success,
          iconColor: colors.icon.success
        };
      case 'error':
        return {
          backgroundColor: colors.status.error.background,
          borderColor: colors.status.error.border,
          textColor: colors.text.error,
          iconColor: colors.icon.error
        };
      case 'warning':
        return {
          backgroundColor: colors.status.warning.background,
          borderColor: colors.status.warning.border,
          textColor: colors.text.warning,
          iconColor: colors.icon.warning
        };
      case 'info':
      default:
        return {
          backgroundColor: `${colors.primary.blue[500]}20`,
          borderColor: colors.primary.blue[400],
          textColor: colors.text.primary,
          iconColor: colors.icon.primary
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertCircle;
      case 'info':
      default:
        return Info;
    }
  };

  const styles = getAlertStyles();
  const Icon = getIcon();

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`
        flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm
        transition-all duration-300 ease-in-out transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${className}
      `}
      style={{
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.textColor
      }}
    >
      <Icon 
        size={20} 
        className="flex-shrink-0 mt-0.5"
        style={{ color: styles.iconColor }}
      />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-full transition-colors hover:bg-white/10"
        style={{ color: styles.iconColor }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Alert;
