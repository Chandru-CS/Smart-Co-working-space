import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage        from './pages/HomePage';
import { LoginPage }   from './pages/LoginPage';
import { RegisterPage } from './pages/LoginPage';
import SpacesPage      from './pages/SpacesPage';
import SpaceDetailPage from './pages/SpaceDetailPage';
import BookingPage     from './pages/BookingPage';
import UserDashboard   from './pages/UserDashboard';
import OwnerDashboard  from './pages/OwnerDashboard';
import AdminDashboard  from './pages/AdminDashboard';
import NotFoundPage    from './pages/NotFoundPage';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<HomePage />} />
      <Route path="/spaces"    element={<SpacesPage />} />
      <Route path="/spaces/:id" element={<SpaceDetailPage />} />
      <Route path="/login"     element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register"  element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/dashboard" element={<PrivateRoute roles={['user']}><UserDashboard /></PrivateRoute>} />
      <Route path="/book/:spaceId" element={<PrivateRoute roles={['user']}><BookingPage /></PrivateRoute>} />
      <Route path="/owner/dashboard" element={<PrivateRoute roles={['owner']}><OwnerDashboard /></PrivateRoute>} />
      <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: '"Cabinet Grotesk", sans-serif',
              borderRadius: '12px',
              fontSize: '14px',
              background: '#25252d',
              color: '#e2e2e5',
              border: '1px solid #3a3a43',
            },
            success: { iconTheme: { primary: '#d97706', secondary: '#25252d' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#25252d' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
