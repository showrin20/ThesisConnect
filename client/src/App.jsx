import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import ProjectHub from './pages/ProjectHub';
import Publications from './pages/publication';
import Dashboard from './pages/Dashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import Auth from './components/auth';
import MyProjects from './pages/MyProjects';
import MyPublications from './pages/MyPublications';
import MyCommunityPosts from './pages/MyCommunityPosts';
import MyBlogs from './pages/MyBlogs';
import PublicationSearch from './components/PublicationSearch';
import BlogPage from './pages/BlogPage';
import BlogDetails from './components/BlogDetails';
import FindCollaborators from './pages/FindCollaborators'; 
import UserProfile from './pages/UserProfile';
import CollaborationRequestsPage from './pages/CollaborationRequestsPage';
import UserManagement from './pages/UserManagement';
import ProjectManagement from './pages/ProjectManagement';
import PublicationManagement from './pages/PublicationManagement';
import BlogManagement from './pages/BlogManagement';
import CommunityFeed from './pages/CommunityFeed';
import FindMentors from './pages/FindMentors'; 
import CommunityManagement from './pages/CommunityManagement';
import MyMentees from './pages/MyMentees';
import ProjectReviews from './pages/ProjectReviews'; // Import the new ProjectReviews page
import Bookmark from './pages/Bookmark'; // Import the Bookmark page



// Component to conditionally render navbar
function AppContent() {
  const location = useLocation();
  const { colors } = useTheme();

  const hideNavbar = [
    '/dashboard',
    '/mentor-dashboard',
    '/admin-dashboard',
    '/settings',
    '/profile',
    '/my-projects',
    '/my-publications',
    '/my-community-posts',
    '/my-blogs',
    '/find-collaborators',
    '/profile/:userId',
    '/collaboration-requests',
    '/user-management',
    '/project-management',
    '/publication-management',
    '/blog-management',
    '/community-feed',
    '/find-mentors',
    '/community-management',
    '/my-mentees',
    '/project-reviews',
    '/bookmarks'
  ].includes(location.pathname) || location.pathname.startsWith('/profile/'); // ✅ Added dynamic profile routes

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.background.main }}>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? "" : "pt-36"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth isSignup={true} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor-dashboard"
            element={
              <ProtectedRoute requiredRole="mentor">
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />


           <Route
            path="/my-mentees"
            element={
              <ProtectedRoute requiredRole="mentor">
                <MyMentees />
              </ProtectedRoute>
            }
          />
             <Route
            path="/project-reviews"
            element={
              <ProtectedRoute requiredRole="mentor">
                <ProjectReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/explore" element={<Explore />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-projects"
            element={
              <ProtectedRoute>
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-publications"
            element={
              <ProtectedRoute>
                <MyPublications />
              </ProtectedRoute>
            }
          />
            <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
             <Route
            path="/community-management"
            element={
              <ProtectedRoute>
                <CommunityManagement />
              </ProtectedRoute>
            }
          />
               <Route
            path="/project-management"
            element={
              <ProtectedRoute>
                <ProjectManagement />
              </ProtectedRoute>
            }
          />
            <Route
            path="/blog-management"
            element={
              <ProtectedRoute>
                <BlogManagement/>
              </ProtectedRoute>
            }
          />
          
      <Route
            path="/publication-management"
            element={
              <ProtectedRoute>
                <PublicationManagement />
              </ProtectedRoute>
            }
          />


          <Route
            path="/my-community-posts"
            element={
              <ProtectedRoute>
                <MyCommunityPosts />
              </ProtectedRoute>
            }
          />
   <Route
            path="/community-feed"
            element={
              <ProtectedRoute>
                <CommunityFeed />
              </ProtectedRoute>
            }
          />

   <Route
            path="/find-mentors"
            element={
              <ProtectedRoute>
                <FindMentors />
              </ProtectedRoute>
            }
          />


          <Route
            path="/my-blogs"
            element={
              <ProtectedRoute>
                <MyBlogs />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <Bookmark />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search-publications"
            element={
              <ProtectedRoute>
                <PublicationSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-collaborators"
            element={
              <ProtectedRoute>
                <FindCollaborators />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
   <Route
            path="/collaboration-requests"
            element={
              <ProtectedRoute>
                <CollaborationRequestsPage />
              </ProtectedRoute>
            }
          />


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