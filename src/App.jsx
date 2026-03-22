import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import GovtDashboard from './pages/govt/GovtDashboard';

// Custom route to redirect authenticated users away from Login/Signup
function PublicRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (currentUser) {
    return <Navigate to={userRole === 'govt' ? '/govt-dashboard' : '/citizen-dashboard'} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      
      <Route 
        path="/citizen-dashboard" 
        element={
          <ProtectedRoute allowedRole="citizen">
            <CitizenDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/govt-dashboard" 
        element={
          <ProtectedRoute allowedRole="govt">
            <GovtDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
