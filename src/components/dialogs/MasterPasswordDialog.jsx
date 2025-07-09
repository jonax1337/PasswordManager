import React, { useState } from 'react';
import { Key, X, Eye, EyeOff, AlertCircle } from 'lucide-react';

const MasterPasswordDialog = ({ isOpen, onClose, onConfirm, title = "Set Master Password" }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!password) {
      setError('Please enter a master password');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    onConfirm(password);
    handleClose();
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md animate-slide-down max-h-[90vh] overflow-y-auto smooth-scroll scrollbar-cool">
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 theme-border border-b">
          <h2 className="text-base sm:text-lg md:text-xl font-bold theme-text">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Icon and Description */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-blue-100 rounded-full mb-2 sm:mb-3 md:mb-4">
              <Key className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600" />
            </div>
            <p className="text-xs sm:text-sm theme-text-secondary px-2">
              Set a strong master password to protect your database
            </p>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium theme-text mb-1.5 sm:mb-2">
              Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full theme-input px-3 sm:px-4 py-2 sm:py-3 rounded-lg pr-9 sm:pr-10 md:pr-12 text-sm sm:text-base"
                placeholder="Enter master password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 theme-text-secondary hover:opacity-80"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium theme-text mb-1.5 sm:mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full theme-input px-3 sm:px-4 py-2 sm:py-3 rounded-lg pr-9 sm:pr-10 md:pr-12 text-sm sm:text-base"
                placeholder="Confirm master password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 theme-text-secondary hover:opacity-80"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start p-2.5 sm:p-3 bg-red-50 theme-border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-red-700 break-words">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 theme-surface rounded-lg p-2.5 sm:p-3 md:p-4">
            <p className="text-xs sm:text-sm theme-text-secondary">
              <strong>Important:</strong> This password will encrypt your database. 
              Choose a strong password you can remember.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 theme-border border-t">
          <button
            onClick={handleClose}
            className="px-3 sm:px-4 py-2 theme-button-secondary rounded-lg font-medium transition-colors text-sm sm:text-base order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!password || !confirmPassword}
            className="px-3 sm:px-4 py-2 theme-button rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base order-1 sm:order-2"
          >
            Set Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterPasswordDialog;