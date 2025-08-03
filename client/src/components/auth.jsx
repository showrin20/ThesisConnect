import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth({ isSignup = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    domain: '',
    scholarLink: '',
    githubLink: '',
    keywords: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, login, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    clearError();

    try {
      let result;
      
      if (isSignup) {
        const userData = {
          ...formData,
          keywords: formData.keywords
            ? formData.keywords.split(',').map((kw) => kw.trim()).filter(Boolean)
            : [],
        };
        result = await register(userData);
      } else {
        result = await login({ email: formData.email, password: formData.password });
      }

      if (result.success) {
        // Navigate to dashboard on success
        navigate('/dashboard');
      } else {
        setError(result.error || 'An unexpected error occurred');
      }
    } catch (err) {
      console.error('🔴 Auth error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-gray-800">
      <div className="card relative bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800 text-white rounded-xl shadow-2xl p-8 w-full max-w-4xl mx-4 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r text-white opacity-50 animate-pulse"></div>
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-white mb-8">
            {isSignup ? 'Sign Up' : 'Login'}
          </h2>

          {error && (
            <p className="text-red-400 text-sm text-white text-center mb-6 bg-red-900/30 p-3 rounded-lg" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            {isSignup && (
              <>
                <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="University" name="university" value={formData.university} onChange={handleChange} />
                <Input label="Domain" name="domain" value={formData.domain} onChange={handleChange} />
                <Input label="Google Scholar Link" name="scholarLink" value={formData.scholarLink} onChange={handleChange} />
                <Input label="GitHub Link" name="githubLink" value={formData.githubLink} onChange={handleChange} />
                <Input
                  label="Keywords (comma-separated)"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  placeholder="e.g., AI, Robotics, IoT"
                />
              </>
            )}
            
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />

            <div className="col-span-1 md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`relative w-full font-medium p-3 rounded-full shadow-lg transition-all duration-300 ${
                  isLoading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105'
                } text-white`}
                aria-label={isSignup ? 'Sign up for ThesisConnect' : 'Log in to ThesisConnect'}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isSignup ? 'Signing Up...' : 'Logging In...'}
                  </span>
                ) : (
                  isSignup ? 'Sign Up' : 'Login'
                )}
                {!isLoading && (
                  <span className="absolute inset-0 rounded-full border border-blue-400/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, type = 'text', required = false, placeholder }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="block text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full p-3 bg-slate-700/50 border border-blue-400/30 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-slate-700/70"
      />
    </div>
  );
}
