import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleSelection from './pages/auth/RoleSelection';
import CitizenAuth from './pages/auth/CitizenAuth';
import AdminAuth from './pages/auth/AdminAuth';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import GovtDashboard from './pages/govt/GovtDashboard';
import SmartRoute from './pages/citizen/SmartRoute';
import Layout from './components/Layout';
import Support from './pages/Support';

// Custom route to redirect authenticated users away from auth pages
function PublicRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

  if (currentUser) {
    return <Navigate to={userRole === 'govt' ? '/govt-dashboard' : '/citizen-dashboard'} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><RoleSelection /></PublicRoute>} />
      <Route path="/auth/citizen" element={<PublicRoute><CitizenAuth /></PublicRoute>} />
      <Route path="/auth/admin" element={<PublicRoute><AdminAuth /></PublicRoute>} />
      
      <Route 
        path="/citizen-dashboard" 
        element={
          <ProtectedRoute allowedRole="citizen">
            <Layout>
              <CitizenDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/smart-route" 
        element={
          <ProtectedRoute allowedRole="citizen">
            <Layout>
              <SmartRoute />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/govt-dashboard" 
        element={
          <ProtectedRoute allowedRole="govt">
            <Layout>
              <GovtDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/support" 
        element={
          <Layout>
            <Support />
          </Layout>
        } 
      />
      
      <Route 
        path="/complaints" 
        element={
          <ProtectedRoute allowedRole="citizen">
            <Layout>
              <div className="p-8 text-2xl font-bold">Complaints Module Coming Soon...</div>
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Catch all route - optional, but good for UX */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
