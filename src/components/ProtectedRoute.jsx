import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // Redirect based on role if they try to access wrong dashboard
    if (userRole === 'citizen') {
      return <Navigate to="/citizen-dashboard" replace />;
    } else if (userRole === 'govt') {
      return <Navigate to="/govt-dashboard" replace />;
    }
  }

  return children;
}
