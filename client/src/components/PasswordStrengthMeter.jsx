import React, { useMemo } from 'react';
import { colors } from '../styles/colors';
import { getStatusStyles } from '../styles/styleUtils';

/**
 * Calculate password strength score (0-5)
 * @param {string} password - The password to evaluate
 * @returns {number} Score from 0-5 indicating password strength
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let score = 0;
  
  // Length check (8+ chars)
  if (password.length >= 8) score += 1;
  
  // Contains lowercase
  if (/[a-z]/.test(password)) score += 1;
  
  // Contains uppercase
  if (/[A-Z]/.test(password)) score += 1;
  
  // Contains number
  if (/[0-9]/.test(password)) score += 1;
  
  // Contains special char
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  return score;
};

/**
 * Validate if a password meets minimum security requirements
 * @param {string} password - The password to validate
 * @returns {boolean} True if password meets minimum requirements
 */
export const validatePasswordStrength = (password) => {
  // Requires a minimum strength of 4 out of 5
  return calculatePasswordStrength(password) >= 4;
};

/**
 * PasswordStrengthMeter component to visually display password strength
 * @param {Object} props - Component props
 * @param {string} props.password - The password to evaluate
 */
const PasswordStrengthMeter = ({ password }) => {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  
  const strengthStatus = useMemo(() => {
    switch (strength) {
      case 0:
        return 'default';
      case 1:
        return 'error';
      case 2:
        return 'error';
      case 3:
        return 'warning';
      case 4:
        return 'info';
      case 5:
        return 'success';
      default:
        return 'default';
    }
  }, [strength]);
  
  const strengthColor = useMemo(() => {
    switch (strength) {
      case 0:
        return colors.text.muted;
      case 1:
        return getStatusStyles('error').color;
      case 2:
        return getStatusStyles('error').color;
      case 3:
        return getStatusStyles('warning').color;
      case 4:
        return getStatusStyles('info').color;
      case 5:
        return getStatusStyles('success').color;
      default:
        return colors.text.muted;
    }
  }, [strength]);
  
  if (!password) return null;
  
  // Get appropriate status style based on strength
  const getStatusBarStyle = () => {
    // Default background with low opacity
    const baseStyle = {
      backgroundColor: getStatusStyles(strengthStatus).backgroundColor || 'rgba(229, 231, 235, 0.2)',
      borderColor: getStatusStyles(strengthStatus).border
    };
    return baseStyle;
  };

  return (
    <div className="mt-2">
      {/* Progress bar container */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-transparent">
        <div 
          className="h-full transition-all duration-300"
          style={{ 
            width: `${(strength / 5) * 100}%`,
            backgroundColor: strengthColor,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        ></div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs font-medium" style={{ color: strengthColor }}>
          {strengthLabels[strength]}
        </span>
        <span className="text-xs" style={{ color: colors.text.muted }}>
          {password && strength < 5 ? "Keep going!" : "Perfect!"}
        </span>
      </div>
      
      {/* Requirements display */}
      {password && strength < 5 && (
        <div className="mt-2 text-xs rounded-md p-2" style={{ ...getStatusBarStyle(), color: colors.text.muted }}>
          <ul className="list-disc pl-4 space-y-1">
            {password.length < 8 && <li>At least 8 characters</li>}
            {!/[a-z]/.test(password) && <li>Include lowercase letters</li>}
            {!/[A-Z]/.test(password) && <li>Include uppercase letters</li>}
            {!/[0-9]/.test(password) && <li>Include numbers</li>}
            {!/[^A-Za-z0-9]/.test(password) && <li>Include special characters</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
