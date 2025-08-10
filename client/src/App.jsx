import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import ProjectHub from './pages/ProjectHub';
import Publications from './pages/Publication';
import Dashboard from './pages/Dashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import Auth from './components/Auth';
import MyProjects from './pages/MyProjects';  
import MyPublications from './pages/MyPublications';
import MyCommunityPosts from './pages/MyCommunityPosts';
import MyBlogs from './pages/MyBlogs';
import PublicationSearch from './components/PublicationSearch';
import BlogPage from './pages/BlogPage';
import { colors } from './styles/colors';
import BlogDetails from './components/BlogDetails';

// Component to conditionally render navbar
function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/dashboard' || 
                     location.pathname === '/mentor-dashboard' ||
                     location.pathname === '/admin-dashboard' ||
                     location.pathname === '/settings' || 
                     location.pathname === '/profile' || 
                     location.pathname === '/my-projects' ||
                     location.pathname === '/my-publications' ||
                     location.pathname === '/my-community-posts' ||
                     location.pathname === '/my-blogs';

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.background.main }}>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? "" : "pt-36"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth isSignup={true} />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          } />
          <Route path="/mentor-dashboard" element={
            <ProtectedRoute requiredRole="mentor">
              <MentorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/explore" element={<Explore />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectHub />
            </ProtectedRoute>
          } />
          <Route path="/my-projects" element={
            <ProtectedRoute>
              <MyProjects />
            </ProtectedRoute>
          } />
          <Route path="/my-publications" element={
            <ProtectedRoute>
              <MyPublications />
            </ProtectedRoute>
          } />
          <Route path="/my-community-posts" element={
            <ProtectedRoute>
              <MyCommunityPosts />
            </ProtectedRoute>
          } />
          <Route path="/my-blogs" element={
            <ProtectedRoute>
              <MyBlogs />
            </ProtectedRoute>
          } />

         <Route path="/search-publications" element={
            <ProtectedRoute>
              <PublicationSearch />
            </ProtectedRoute>

          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AlertProvider>
          <Router>
            <AppContent />
          </Router>
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;