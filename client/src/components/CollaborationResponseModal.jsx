import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Check, X as XIcon, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../axios';

const CollaborationResponseModal = ({ 
  isOpen, 
  onClose, 
  request, 
  onRespond, 
  loading = false,
  projectId = null
}) => {
  const { colors } = useTheme();
  const [responseType, setResponseType] = useState('accepted'); // 'accepted' or 'declined'
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState('');

  const defaultMessages = {
    accepted: `Hi ${request?.requester?.name || 'there'},

I'm excited to accept your collaboration request! I believe we can work well together and create something amazing.

Looking forward to collaborating with you!

Best regards!`,
    declined: `Hi ${request?.requester?.name || 'there'},

Thank you for your collaboration request. Unfortunately, I'm not able to collaborate at this time due to my current commitments.

I appreciate your interest and wish you the best with your projects!

Best regards!`
  };

  React.useEffect(() => {
    if (isOpen && request) {
      setMessage(defaultMessages[responseType]);
      setMessageError('');
    }
  }, [isOpen, request, responseType]);

  const handleRespond = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) {
      setMessageError('Please enter a response message');
      return;
    }
    
    if (trimmedMessage.length < 10) {
      setMessageError('Message must be at least 10 characters long');
      return;
    }
    
    if (trimmedMessage.length > 500) {
      setMessageError('Message must be under 500 characters');
      return;
    }
    
    setMessageError('');
    
    try {
      // If accepted and we have a projectId, add the user as a collaborator
      if (responseType === 'accepted' && projectId) {
        try {
          await axios.post(`/projects/${projectId}/collaborators`, {
            collaboratorId: request.requester._id
          });
          console.log('Successfully added collaborator to project');
        } catch (collabErr) {
          console.error('Error adding collaborator to project:', collabErr);
          // Don't fail the whole operation if adding collaborator fails
        }
      }
      
      // Call the parent onRespond function
      onRespond(responseType, trimmedMessage);
    } catch (error) {
      console.error('Error in handleRespond:', error);
    }
  };

  const handleResponseTypeChange = (type) => {
    setResponseType(type);
    setMessage(defaultMessages[type]);
    setMessageError('');
  };

  if (!isOpen || !request) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg rounded-xl border shadow-xl"
          style={{
            backgroundColor: colors.background.card,
            borderColor: colors.border.secondary
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border.secondary }}>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}20` }}
              >
                {request.requester?.profileImage ? (
                  <img
                    src={request.requester.profileImage}
                    alt={request.requester.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={20} style={{ color: colors.primary?.blue?.[500] || '#3b82f6' }} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                  Respond to Collaboration
                </h3>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  From {request.requester?.name || 'User'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: `${colors.text.secondary}10`,
                color: colors.text.secondary
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Original Request */}
            <div 
              className="p-4 rounded-lg border mb-6"
              style={{
                backgroundColor: `${colors.text?.muted || '#6b7280'}10`,
                borderColor: `${colors.text?.muted || '#6b7280'}30`
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle size={14} style={{ color: colors.text?.muted || '#6b7280' }} />
                <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
                  Original Request:
                </span>
              </div>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                "{request.message}"
              </p>
            </div>

            {/* Response Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-3" style={{ color: colors.text.secondary }}>
                Your Response *
              </label>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleResponseTypeChange('accepted')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm`}
                  style={{
                    backgroundColor: responseType === 'accepted' 
                      ? `${colors.accent?.green?.[500] || '#22c55e'}20` 
                      : 'transparent',
                    borderColor: responseType === 'accepted' 
                      ? colors.accent?.green?.[500] || '#22c55e'
                      : colors.border.secondary,
                    color: responseType === 'accepted' 
                      ? colors.accent?.green?.[500] || '#22c55e'
                      : colors.text.secondary
                  }}
                >
                  <Check size={16} className="mr-2" />
                  Accept
                </button>
                <button
                  onClick={() => handleResponseTypeChange('declined')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm`}
                  style={{
                    backgroundColor: responseType === 'declined' 
                      ? `${colors.accent?.red?.[500] || '#ef4444'}20` 
                      : 'transparent',
                    borderColor: responseType === 'declined' 
                      ? colors.accent?.red?.[500] || '#ef4444'
                      : colors.border.secondary,
                    color: responseType === 'declined' 
                      ? colors.accent?.red?.[500] || '#ef4444'
                      : colors.text.secondary
                  }}
                >
                  <XIcon size={16} className="mr-2" />
                  Decline
                </button>
              </div>
            </div>

            {/* Response Message */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                Response Message *
                <span className="text-xs opacity-70 ml-2">
                  ({message.length}/500 characters)
                </span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your response message..."
                rows={6}
                className="w-full p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: colors.background.glass,
                  color: colors.text.primary,
                  borderColor: messageError ? colors.status?.error : colors.border.secondary,
                  focusRingColor: colors.primary?.blue?.[500] || '#3b82f6'
                }}
              />
              {messageError && (
                <p className="text-xs mt-1" style={{ color: colors.status?.error }}>
                  {messageError}
                </p>
              )}
            </div>

            {/* Requester Info */}
            <div 
              className="p-3 rounded-lg border mb-4"
              style={{
                backgroundColor: `${colors.primary?.blue?.[500] || '#3b82f6'}10`,
                borderColor: `${colors.primary?.blue?.[500] || '#3b82f6'}30`
              }}
            >
              <div className="flex items-center space-x-2">
                <MessageCircle size={14} style={{ color: colors.primary?.blue?.[500] || '#3b82f6' }} />
                <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
                  Responding to:
                </span>
              </div>
              <div className="mt-1 text-sm" style={{ color: colors.text.secondary }}>
                <strong>{request.requester?.name}</strong>
                {request.requester?.department && ` • ${request.requester.department}`}
                {request.requester?.university && ` • ${request.requester.university}`}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex space-x-3 p-6 border-t" style={{ borderColor: colors.border.secondary }}>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: colors.text.secondary,
                borderColor: colors.border.secondary
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleRespond}
              disabled={loading || !message.trim()}
              className="flex-1 flex items-center justify-center py-2 px-4 rounded-lg transition-all font-medium disabled:opacity-50"
              style={{
                backgroundColor: responseType === 'accepted' 
                  ? colors.accent?.green?.[500] || '#22c55e'
                  : colors.accent?.red?.[500] || '#ef4444',
                color: 'white'
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  {responseType === 'accepted' ? (
                    <Check size={16} className="mr-2" />
                  ) : (
                    <XIcon size={16} className="mr-2" />
                  )}
                  {responseType === 'accepted' ? 'Accept & Respond' : 'Decline & Respond'}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CollaborationResponseModal;
