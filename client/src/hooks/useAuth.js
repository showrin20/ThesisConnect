import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Hook for protected routes
export const useAuthGuard = (requiredRole = null) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        navigate('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, user, loading, requiredRole, navigate]);

  return { isAuthenticated, user, loading };
};

// Hook for role-based access
export const useRole = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';
  const isStudent = user?.role === 'student';
  
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);
  
  return {
    isAdmin,
    isSupervisor,
    isStudent,
    hasRole,
    hasAnyRole,
    userRole: user?.role,
  };
};
