import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, X, Info } from 'lucide-react';
import { colors } from '../styles/colors';
import { getStatusStyles } from '../styles/styleUtils';

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

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return colors.icon.success;
      case 'error':
        return colors.icon.error;
      case 'warning':
        return colors.icon.warning;
      case 'info':
      default:
        return colors.icon.primary;
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

  const statusStyle = getStatusStyles(type);
  const iconColor = getIconColor();
  const Icon = getIcon();

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`
        flex items-start gap-3 backdrop-blur-sm
        transition-all duration-300 ease-in-out transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${className}
      `}
      style={{
        ...statusStyle,
        color: statusStyle.color || colors.text.primary
      }}
    >
      <Icon 
        size={20} 
        className="flex-shrink-0 mt-0.5"
        style={{ color: iconColor }}
      />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-full transition-colors hover:bg-white/10"
        style={{ color: iconColor }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Alert;
