import React from 'react';
import PropTypes from 'prop-types';

const Alert = ({ type = 'error', message, onClose, className = '' }) => {
  // Define style mappings for different alert types
  const typeStyles = {
    error: {
      container: 'bg-red-100 border-red-400 text-red-700',
      icon: 'text-red-700 text-xs bg-red-300 flex items-center justify-center rounded-full h-7 w-7',
    },
    success: {
      container: 'bg-green-100 border-green-400 text-green-700',
      icon: 'text-green-700 text-xl',
    },
    warning: {
      container: 'bg-yellow-100 border-yellow-400 text-yellow-700',
      icon: 'text-yellow-700 text-xl',
    },
    info: {
      container: 'bg-blue-100 border-blue-400 text-blue-700',
      icon: 'text-blue-700 text-xl',
    },
  };

  const { container, icon } = typeStyles[type] || typeStyles.error;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 md:max-w-lg w-full px-4 py-3 rounded border drop-shadow-md flex items-center ${container} ${className}`}
    >
      {/* Icon */}
      <div className={`mr-3 ${icon}`}>
        {type === 'error' && '❌'}
        {type === 'success' && '✅'}
        {type === 'warning' && '⚠️'}
        {type === 'info' && 'ℹ️'}
      </div>

      {/* Message */}
      <div className="flex-1">{message}</div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-sm font-bold bg-transparent focus:outline-none hover:opacity-70"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Prop validation
Alert.propTypes = {
  type: PropTypes.oneOf(['error', 'success', 'warning', 'info']),
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  className: PropTypes.string,
};

export default Alert;
