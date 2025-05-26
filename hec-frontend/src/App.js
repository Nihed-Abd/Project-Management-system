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
import ProjectsPage from './pages/admin/ProjectsPage';
import ProjectDetailsPage from './pages/admin/ProjectDetailsPage';
import AddProjectPage from './pages/admin/AddProjectPage';
import EditProjectPage from './pages/admin/EditProjectPage';
import UsersPage from './pages/admin/UsersPage';
import MeetingsPage from './pages/admin/MeetingsPage';
import ReclamationsPage from './pages/admin/ReclamationsPage';

// Client Pages
import HomePage from './pages/client/HomePage';
import AboutPage from './pages/client/AboutPage';
import FrontProjectsPage from './pages/client/ProjectsPage';
import ProjectDetailPage from './pages/client/ProjectDetailPage';
import RequestProjectPage from './pages/client/RequestProjectPage';
import ContactPage from './pages/client/ContactPage';
import UserProjectsPage from './pages/client/UserProjectsPage';
import UserReclamationsPage from './pages/client/UserReclamationsPage';
import UserInterviewsPage from './pages/client/UserInterviewsPage';
import UserProfilePage from './pages/client/UserProfilePage';

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
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="projects/add" element={<AddProjectPage />} />
            <Route path="projects/edit/:projectId" element={<EditProjectPage />} />
            <Route path="meetings" element={<MeetingsPage />} />
            <Route path="reclamations" element={<ReclamationsPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>

          {/* Client Routes */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<HomePage />} />
            <Route path="projects" element={<FrontProjectsPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="request-project" element={
              <ProtectedRoute>
                <RequestProjectPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            } />
            <Route path="user-projects" element={
              <ProtectedRoute>
                <UserProjectsPage />
              </ProtectedRoute>
            } />
            <Route path="reclamations" element={
              <ProtectedRoute>
                <UserReclamationsPage />
              </ProtectedRoute>
            } />
            <Route path="interviews" element={
              <ProtectedRoute>
                <UserInterviewsPage />
              </ProtectedRoute>
            } />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
