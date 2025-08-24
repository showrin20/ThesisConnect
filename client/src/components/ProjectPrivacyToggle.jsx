import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Lock, Globe } from 'lucide-react';
import projectService from '../services/projectService';

/**
 * A component to toggle project privacy
 */
const ProjectPrivacyToggle = ({ projectId, isPrivate, onToggle, size = 'normal' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentState, setCurrentState] = useState(isPrivate);

  // Classes for different sizes
  const sizes = {
    small: {
      button: 'p-1 text-xs',
      icon: 14,
      text: 'hidden'
    },
    normal: {
      button: 'px-3 py-2 text-sm',
      icon: 16,
      text: 'ml-2'
    },
    large: {
      button: 'px-4 py-2 text-base',
      icon: 20,
      text: 'ml-2'
    }
  };
  
  const sizeClass = sizes[size] || sizes.normal;

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    try {
      const newState = !currentState;
      const response = await projectService.toggleProjectPrivacy(projectId, newState);
      setCurrentState(newState);
      if (onToggle) onToggle(newState, response.data);
    } catch (err) {
      setError(err.message || 'Failed to update privacy');
      console.error('Error toggling project privacy:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center justify-center rounded-md border transition-all duration-200 ${
          sizeClass.button
        } ${
          currentState
            ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
            : 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200'
        } ${loading ? 'opacity-50 cursor-wait' : ''}`}
        title={currentState ? 'Make project public' : 'Make project private'}
      >
        {currentState ? (
          <>
            <Lock size={sizeClass.icon} />
            <span className={sizeClass.text}>{loading ? 'Updating...' : 'Private'}</span>
          </>
        ) : (
          <>
            <Globe size={sizeClass.icon} />
            <span className={sizeClass.text}>{loading ? 'Updating...' : 'Public'}</span>
          </>
        )}
      </button>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

ProjectPrivacyToggle.propTypes = {
  projectId: PropTypes.string.isRequired,
  isPrivate: PropTypes.bool,
  onToggle: PropTypes.func,
  size: PropTypes.oneOf(['small', 'normal', 'large'])
};

ProjectPrivacyToggle.defaultProps = {
  isPrivate: false,
  size: 'normal'
};

export default ProjectPrivacyToggle;
