import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginPic from '../assets/loginPic.png';
import signupPic from '../assets/signupPic.png';

// 🎨 Theme Variables
const colors = {
  background: 'bg-gradient-to-b from-slate-900 to-gray-800',
  cardBg: 'bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800',
  inputBg: 'bg-slate-700/50',
  inputHover: 'hover:bg-slate-700/70',
  inputBorder: 'border-blue-400/30',
  labelText: 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent',
  buttonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600',
  buttonHover: 'hover:from-blue-700 hover:to-purple-700',
  text: 'text-white',
};

export default function Auth({ isSignup = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    domain: '',
    scholarLink: '',
    githubLink: '',
    role: 'student', // ✅ Default role set
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
        result = await register(formData); // ✅ full formData including role
      } else {
        result = await login({ email: formData.email, password: formData.password });
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'An unexpected error occurred');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${colors.background}`}>
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Image Side */}
        <div className="hidden md:flex justify-center">
          <img
            src={isSignup ? signupPic : loginPic}
            alt={isSignup ? 'Signup Illustration' : 'Login Illustration'}
            className="w-full max-w-xl rounded-3xl shadow-xl"
          />
        </div>

        {/* Form Side */}
        <div className={`p-8 rounded-2xl shadow-lg w-full border border-gray-200 relative ${colors.cardBg} ${colors.text}`}>
          <h2 className="text-3xl font-bold text-center mb-6 font-inter">
            {isSignup ? 'Create an Account' : 'Welcome Back'}
          </h2>

          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            {isSignup && (
              <>
                <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="University" name="university" value={formData.university} onChange={handleChange} />
                <Input label="Domain" name="domain" value={formData.domain} onChange={handleChange} />
                <Input label="Google Scholar Link" name="scholarLink" value={formData.scholarLink} onChange={handleChange} />
                <Input label="GitHub Link" name="githubLink" value={formData.githubLink} onChange={handleChange} />
                <div>
                  <label className={`block text-sm font-medium mb-1 ${colors.labelText}`}>
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className={`w-full border ${colors.inputBorder} p-3 rounded-lg bg-slate-700/50 text-white focus:outline-none`}
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-3 rounded-lg font-semibold transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : `${colors.buttonPrimary} ${colors.buttonHover} text-white`
              }`}
            >
              {isLoading ? (isSignup ? 'Signing Up...' : 'Logging In...') : isSignup ? 'Sign Up' : 'Login'}
            </button>

            {isSignup ? (
              <p className="text-center text-sm text-white/80">
                Already have an account?{' '}
                <a href="/login" className="text-blue-300 hover:underline">
                  Login
                </a>
              </p>
            ) : (
              <>
                <a href="#" className="text-sm text-blue-300 hover:underline text-right block">
                  Forgot Password?
                </a>
                <p className="text-center text-sm text-white/80">
                  No account?{' '}
                  <a href="/signup" className="text-blue-300 hover:underline">
                    Sign up
                  </a>
                </p>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

// 🧩 Reusable Input Component
function Input({ label, name, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-blue-400/30 p-3 rounded-lg bg-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
