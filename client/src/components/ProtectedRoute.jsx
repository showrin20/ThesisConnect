import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStatusStyles, getButtonStyles } from '../styles/styleUtils';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-sky-400/30 border-t-sky-400 rounded-full animate-spin"></div>
          <p className="text-white/70 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20 flex items-center justify-center">
        <div className="backdrop-blur-lg rounded-xl p-8 text-center" style={getStatusStyles('error')}>
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-6">
            You don't have permission to access this page. Required role: {requiredRole}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-lg transition-all duration-200"
            style={getButtonStyles('primary')}
            onMouseEnter={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.05)' })}
            onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' })}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
