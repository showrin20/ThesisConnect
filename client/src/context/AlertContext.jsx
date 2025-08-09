import React, { createContext, useContext, useState, useCallback } from 'react';
import Alert from '../components/Alert';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const alert = {
      id,
      message,
      type,
      ...options
    };

    setAlerts(prev => [...prev, alert]);

    // Auto remove after duration if autoClose is enabled (default)
    if (options.autoClose !== false) {
      const duration = options.duration || 5000;
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }

    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, options = {}) => {
    return showAlert(message, 'success', options);
  }, [showAlert]);

  const showError = useCallback((message, options = {}) => {
    return showAlert(message, 'error', options);
  }, [showAlert]);

  const showWarning = useCallback((message, options = {}) => {
    return showAlert(message, 'warning', options);
  }, [showAlert]);

  const showInfo = useCallback((message, options = {}) => {
    return showAlert(message, 'info', options);
  }, [showAlert]);

  const value = {
    alerts,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeAlert,
    clearAllAlerts
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      
      {/* Alert Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            message={alert.message}
            type={alert.type}
            onClose={() => removeAlert(alert.id)}
            autoClose={alert.autoClose}
            duration={alert.duration}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export default AlertProvider;
