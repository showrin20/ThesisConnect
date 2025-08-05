import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginPic from '../assets/loginPic.png';
import signupPic from '../assets/signupPic.png';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getCardStyles, getGradientTextStyles } from '../styles/styleUtils';

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
        // Log the role being sent
        console.log('Registering with role:', formData.role);
        result = await register(formData); // ✅ full formData including role
      } else {
        result = await login({ email: formData.email, password: formData.password });
      }

      if (result.success) {
        // Redirect based on user role
        const userRole = result.user?.role || 'student';
        switch (userRole) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'mentor':
            navigate('/mentor-dashboard');
            break;
          case 'student':
          default:
            navigate('/dashboard');
            break;
        }
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" 
         style={{ background: colors.gradients.background.page }}>
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
        <div className="p-8 rounded-2xl shadow-lg w-full border relative" style={getCardStyles('glass')}>
          <h2 className="text-3xl font-bold text-center mb-6 font-inter" style={getGradientTextStyles('primary')}>
            {isSignup ? 'Create an Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="text-center mb-4 p-3 rounded-lg" style={{ 
              backgroundColor: colors.status.error.background,
              color: colors.status.error.text,
              border: `1px solid ${colors.status.error.border}`
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            {isSignup && (
              <>
                <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="University" name="university" value={formData.university} onChange={handleChange} />
                <Input label="Domain" name="domain" value={formData.domain} onChange={handleChange} />
                <Input label="Google Scholar Link" name="scholarLink" value={formData.scholarLink} onChange={handleChange} />
                <Input label="GitHub Link" name="githubLink" value={formData.githubLink} onChange={handleChange} />
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Role <span style={{ color: colors.status.error.text }}>*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg transition-all duration-200"
                    style={getInputStyles()}
                    onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                    onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                  </select>
                </div>
              </>
            )}

            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-3 rounded-lg font-semibold transition-all duration-200"
              style={isLoading ? {
                backgroundColor: colors.button.outline.background,
                color: colors.text.muted,
                cursor: 'not-allowed'
              } : getButtonStyles('primary')}
              onMouseEnter={!isLoading ? (e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' }) : undefined}
              onMouseLeave={!isLoading ? (e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' }) : undefined}
            >
              {isLoading ? (isSignup ? 'Signing Up...' : 'Logging In...') : isSignup ? 'Sign Up' : 'Login'}
            </button>

            {isSignup ? (
              <p className="text-center text-sm" style={{ color: colors.text.secondary }}>
                Already have an account?{' '}
                <a href="/login" className="transition-colors" style={{ color: colors.primary.blue[400] }}
                   onMouseEnter={(e) => e.target.style.color = colors.primary.blue[300]}
                   onMouseLeave={(e) => e.target.style.color = colors.primary.blue[400]}>
                  Login
                </a>
              </p>
            ) : (
              <>
                <a href="#" className="text-sm text-right block transition-colors" style={{ color: colors.primary.blue[400] }}
                   onMouseEnter={(e) => e.target.style.color = colors.primary.blue[300]}
                   onMouseLeave={(e) => e.target.style.color = colors.primary.blue[400]}>
                  Forgot Password?
                </a>
                <p className="text-center text-sm" style={{ color: colors.text.secondary }}>
                  No account?{' '}
                  <a href="/signup" className="transition-colors" style={{ color: colors.primary.blue[400] }}
                     onMouseEnter={(e) => e.target.style.color = colors.primary.blue[300]}
                     onMouseLeave={(e) => e.target.style.color = colors.primary.blue[400]}>
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
      <label htmlFor={name} className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
        {label} {required && <span style={{ color: colors.status.error.text }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-3 rounded-lg transition-all duration-200"
        style={getInputStyles()}
        onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
        onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
      />
    </div>
  );
}
