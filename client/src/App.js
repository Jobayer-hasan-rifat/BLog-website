import React, { useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreatePost from './pages/CreatePost';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import UserPublicProfile from './pages/UserPublicProfile';
import './App.css';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect after login based on role
    if (user && window.location.pathname === '/login') {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="App">
      <Navbar />
      <div className="App__content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<BlogDetail />} />
          <Route path="/users/:id" element={<UserPublicProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["user", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["user", "admin"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute roles={["user", "admin"]}>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}


