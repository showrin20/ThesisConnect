// src/App.jsx or similar
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import ComingSoon from './components/ComingSoon';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth isSignup={true} />} />
        <Route path="/dashboard" element={<ComingSoon />} />
        <Route path="/" element={<div>Home Page</div>} /> {/* Replace with your home component */}
      </Routes>
    </Router>
  );
}

export default App;