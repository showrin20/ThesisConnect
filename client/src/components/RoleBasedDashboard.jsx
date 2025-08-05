import React from 'react';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import MentorDashboard from '../pages/MentorDashboard';
import AdminDashboard from '../pages/AdminDashboard';

export default function RoleBasedDashboard() {
  const { user } = useAuth();

  // Redirect based on user role
  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'mentor':
      return <MentorDashboard />;
    case 'student':
    default:
      return <Dashboard />;
  }
}
