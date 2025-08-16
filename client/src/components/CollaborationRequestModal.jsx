import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Send, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CollaborationRequestModal = ({ 
  isOpen, 
  onClose, 
  recipient, 
  onSend, 
  loading = false 
}) => {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState('');

  const defaultMessage = `Hi ${recipient?.name || 'there'},

I'm interested in collaborating with you on academic projects. I think our skills and interests align well, and we could create something amazing together!

Looking forward to connecting with you.

Best regards!`;

  React.useEffect(() => {
    if (isOpen) {
      setMessage(defaultMessage);
      setMessageError('');
    }
  }, [isOpen, recipient]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) {
      setMessageError('Please enter a message');
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
    onSend(trimmedMessage);
  };

  if (!isOpen) return null;

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
                {recipient?.profileImage ? (
                  <img
                    src={recipient.profileImage}
                    alt={recipient.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={20} style={{ color: colors.primary?.blue?.[500] || '#3b82f6' }} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                  Send Collaboration Request
                </h3>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  To {recipient?.name || 'User'}
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
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text.secondary }}>
                Message *
                <span className="text-xs opacity-70 ml-2">
                  ({message.length}/500 characters)
                </span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a personalized message..."
                rows={8}
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

            {/* Recipient Info */}
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
                  Sending to:
                </span>
              </div>
              <div className="mt-1 text-sm" style={{ color: colors.text.secondary }}>
                <strong>{recipient?.name}</strong>
                {recipient?.department && ` • ${recipient.department}`}
                {recipient?.university && ` • ${recipient.university}`}
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
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="flex-1 flex items-center justify-center py-2 px-4 rounded-lg transition-all font-medium disabled:opacity-50"
              style={{
                backgroundColor: colors.primary?.blue?.[500] || '#3b82f6',
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
                  <Send size={16} className="mr-2" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CollaborationRequestModal;
