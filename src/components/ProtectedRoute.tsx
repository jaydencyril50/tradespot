import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('ProtectedRoute: No token found in localStorage. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }
  // Optionally, add more token validation here and log errors if needed
  return <>{children}</>;
};

export default ProtectedRoute;
