import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';

// Client Pages
import HomePage from './pages/client/HomePage';

// Auth protected route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && !isAdmin) {
    // Redirect non-admin users to the home page
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<div>Projects Admin Page</div>} />
            <Route path="meetings" element={<div>Meetings Page</div>} />
            <Route path="reclamations" element={<div>Reclamations Page</div>} />
            <Route path="users" element={<div>Users Page</div>} />
          </Route>

          {/* Client Routes */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<HomePage />} />
            <Route path="projects" element={
              <ProtectedRoute>
                <div>Projects Page</div>
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <div>User Profile Page</div>
              </ProtectedRoute>
            } />
            <Route path="meetings" element={
              <ProtectedRoute>
                <div>User Meetings Page</div>
              </ProtectedRoute>
            } />
            <Route path="about" element={<div>About Us Page</div>} />
            <Route path="help" element={<div>Help Center Page</div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
