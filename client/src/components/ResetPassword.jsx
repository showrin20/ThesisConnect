import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import PasswordStrengthMeter, { validatePasswordStrength } from './PasswordStrengthMeter';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getCardStyles, getGradientTextStyles, getStatusStyles } from '../styles/styleUtils';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordError, setPasswordError] = useState('');
  const { resetToken } = useParams();
  const { resetPassword } = useAuth();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    if (!resetToken) {
      setMessage({
        type: 'error',
        text: 'Invalid reset token. Please request a new password reset link.'
      });
    }
  }, [resetToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'password') {
      setPassword(value);
      if (value && !validatePasswordStrength(value)) {
        setPasswordError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
      } else {
        setPasswordError('');
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!password || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please enter both password fields' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (!validatePasswordStrength(password)) {
      setPasswordError('Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await resetPassword(resetToken, password);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Your password has been reset successfully! You will be redirected to the login page.' 
        });
        showSuccess('Password reset successful');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to reset password. Please try again.' 
        });
        showError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'An unexpected error occurred' 
      });
      showError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" 
         style={{ background: colors.gradients.background.page }}>
      <div className="max-w-md w-full">
        <div className="p-8 rounded-2xl shadow-lg w-full border relative" style={getCardStyles('glass')}>
          <h2 className="text-3xl font-bold text-center mb-6 font-inter" style={getGradientTextStyles('primary')}>
            Reset Password
          </h2>
          
          <p className="text-center mb-6" style={{ color: colors.text.secondary }}>
            Please enter your new password below.
          </p>

          {message.text && (
            <div className="mb-6 flex items-start" style={getStatusStyles(message.type)}>
              <div className="mr-3 font-bold">{message.type === 'success' ? '✓' : '✕'}</div>
              <div className="flex-1">{message.text}</div>
              <button 
                onClick={() => setMessage({ type: '', text: '' })}
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                New Password <span style={{ color: colors.status.error.text }}>*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={getInputStyles()}
                onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
              />
              <PasswordStrengthMeter password={password} />
              {password && validatePasswordStrength(password) ? (
                <div className="mt-2 flex items-center text-xs" style={{...getStatusStyles('success'), padding: '8px 12px'}}>
                  <div className="mr-2 font-bold">✓</div>
                  <div>Strong password</div>
                </div>
              ) : (
                <p className="mt-1 text-xs" style={{ color: colors.text.muted }}>
                  Password must have 8+ chars, uppercase, lowercase, number, and special character
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                Confirm Password <span style={{ color: colors.status.error.text }}>*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={getInputStyles()}
                onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
              />
              {password && confirmPassword && (
                password === confirmPassword ? (
                  <div className="mt-2 flex items-center text-xs" style={{...getStatusStyles('success'), padding: '8px 12px'}}>
                    <div className="mr-2 font-bold">✓</div>
                    <div>Passwords match</div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center text-xs" style={{...getStatusStyles('error'), padding: '8px 12px'}}>
                    <div className="mr-2 font-bold">✕</div>
                    <div>Passwords don't match</div>
                  </div>
                )
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !resetToken}
              className="w-full p-3 rounded-lg font-semibold transition-all duration-200"
              style={(isSubmitting || !resetToken) ? {
                backgroundColor: colors.button.outline.background,
                color: colors.text.muted,
                cursor: 'not-allowed'
              } : getButtonStyles('primary')}
              onMouseEnter={(!isSubmitting && resetToken) ? (e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' }) : undefined}
              onMouseLeave={(!isSubmitting && resetToken) ? (e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' }) : undefined}
            >
              {isSubmitting ? 'Resetting Password...' : 'Set New Password'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sm transition"
              style={{ color: colors.primary.blue[400] }}
              onMouseEnter={(e) => e.target.style.color = colors.primary.blue[300]}
              onMouseLeave={(e) => e.target.style.color = colors.primary.blue[400]}>
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
