import { useState } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getCardStyles, getGradientTextStyles, getStatusStyles } from '../styles/styleUtils';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { forgotPassword } = useAuth();
  const { showSuccess, showError } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'If that email exists in our system, we have sent a password reset link. Please check your email.' 
        });
        showSuccess('Password reset email sent');
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to send password reset email. Please try again.' 
        });
        showError(result.error || 'Failed to send password reset email');
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
            Forgot Password
          </h2>
          
          <p className="text-center mb-6" style={{ color: colors.text.secondary }}>
            Enter your email address and we'll send you a link to reset your password.
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                Email Address <span style={{ color: colors.status.error.text }}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 rounded-lg transition-all duration-200"
                style={getInputStyles()}
                onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full p-3 rounded-lg font-semibold transition-all duration-200"
              style={isSubmitting ? {
                backgroundColor: colors.button.outline.background,
                color: colors.text.muted,
                cursor: 'not-allowed'
              } : getButtonStyles('primary')}
              onMouseEnter={!isSubmitting ? (e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1.02)' }) : undefined}
              onMouseLeave={!isSubmitting ? (e) => Object.assign(e.target.style, getButtonStyles('primary'), { transform: 'scale(1)' }) : undefined}
            >
              {isSubmitting ? 'Sending Email...' : 'Reset Password'}
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
