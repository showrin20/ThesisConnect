import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

import { useAuth } from '../context/AuthContext';
import loginPic from '../assets/loginPic.png';
import signupPic from '../assets/signupPic.png';
import PasswordStrengthMeter, { validatePasswordStrength } from './PasswordStrengthMeter';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getCardStyles, getGradientTextStyles, getStatusStyles } from '../styles/styleUtils';

export default function Auth({ isSignup = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    domain: '',
    scholarLink: '',
    githubLink: '',
    role: 'student',  });

  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, login, loginWithGoogle, clearError } = useAuth();
  const navigate = useNavigate();

  // Using the imported validatePasswordStrength function from PasswordStrengthMeter

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate password if the field is being changed and we're signing up
    if (name === 'password' && isSignup) {
      if (value && !validatePasswordStrength(value)) {
        setPasswordError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    setIsLoading(true);
    clearError();

    // Password validation for signup
    if (isSignup && !validatePasswordStrength(formData.password)) {
      setPasswordError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
      setIsLoading(false);
      return;
    }

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

  // Google login handlers
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError('');
      clearError();

      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google login decoded info:', decoded);

      const result = await loginWithGoogle({
        token: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        role: isSignup ? formData.role : 'student'
      });

      if (result.success) {
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
        setError(result.error || 'Failed to login with Google');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to login with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    setError('Google login failed. Please try again.');
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
            <div className="mb-4 flex items-start" style={getStatusStyles('error')}>
              <div className="mr-3 font-bold">✕</div>
              <div className="flex-1">{error}</div>
              <button 
                onClick={() => setError('')}
                className="ml-2 text-sm hover:opacity-75"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}
          
          {passwordError && (
            <div className="mb-4 flex items-start" style={getStatusStyles('warning')}>
              <div className="mr-3 font-bold">⚠</div>
              <div className="flex-1">{passwordError}</div>
              <button 
                onClick={() => setPasswordError('')}
                className="ml-2 text-sm hover:opacity-75"
                aria-label="Dismiss"
              >
                ×
              </button>
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
            <div>
              <Input 
                label="Password" 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              {isSignup && (
                <>
                  <PasswordStrengthMeter password={formData.password} />
                  {formData.password && validatePasswordStrength(formData.password) ? (
                    <div className="mt-2 flex items-center text-xs" style={{...getStatusStyles('success'), padding: '8px 12px'}}>
                      <div className="mr-2 font-bold">✓</div>
                      <div>Strong password</div>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs" style={{ color: colors.text.muted }}>
                      Password must have 8+ chars, uppercase, lowercase, number, and special character
                    </p>
                  )}
                </>
              )}
            </div>

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

            <Link
  to="/login"
  className="transition"
  style={{ color: colors.primary.blue[400] }}
  onMouseEnter={(e) => e.target.style.color = colors.primary.blue[300]}
  onMouseLeave={(e) => e.target.style.color = colors.primary.blue[400]}>
  Login
</Link>

            
              </p>
              
              
      

            ) : (
              <>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-right block transition-colors" 
                  style={{ color: colors.primary.blue[400] }}
                  onMouseEnter={(e) => e.target.style.color = colors.primary.blue[300]}
                  onMouseLeave={(e) => e.target.style.color = colors.primary.blue[400]}>
                  Forgot Password?
                </Link>
                <p className="text-center text-sm" style={{ color: colors.text.secondary }}>
                  No account?{' '}
                  <Link
                    to="/signup"
                    className="transition"
                    style={{ color: colors.primary.blue[400] }}
                    onMouseEnter={(e) => e.target.style.color = colors.primary.blue[300]}
                    onMouseLeave={(e) => e.target.style.color = colors.primary.blue[400]}>
                    Signup
                  </Link>
                </p>
              </>
            )}
          </form>
          <div className="my-4">
            <div className="flex items-center">
              <div className="flex-grow border-t" style={{ borderColor: colors.border.light }}></div>
              <span className="px-4 text-sm" style={{ color: colors.text.secondary }}>OR</span>
              <div className="flex-grow border-t" style={{ borderColor: colors.border.light }}></div>
            </div>
            <div className="text-center text-sm" style={{ color: colors.text.secondary }}>
              {isSignup ? 'Sign up with Google' : 'Sign in with Google'}
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                width="100%"
                text={isSignup ? "signup_with" : "signin_with"}
                shape="rectangular"
                logo_alignment="center"
              />
            </div>
          </div>
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
