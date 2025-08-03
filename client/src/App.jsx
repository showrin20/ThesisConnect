import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import ProjectHub from './pages/ProjectHub';
import Publications from './pages/Publication';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Auth from './components/Auth';

// Component to conditionally render navbar
function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/dashboard' || location.pathname === '/settings';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-800">
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? "" : "pt-36"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth isSignup={true} />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
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
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectHub />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;