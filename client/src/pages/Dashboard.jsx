import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import ComingSoon from '../components/ComingSoon';

export default function Dashboard() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ThesisConnect Dashboard
          </h1>
          <div className="flex items-center gap-4">
            {user ? (
              <span className="text-white text-sm md:text-base">
                Welcome, {user.name || user.email}
              </span>
            ) : null}
            <button
              onClick={handleLogout}
              className="relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              aria-label="Log out of ThesisConnect"
            >
              Logout
              <span className="absolute inset-0 rounded-full border border-red-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <ComingSoon />
      </main>
    </div>
  );
}
