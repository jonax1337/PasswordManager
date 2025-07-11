import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileKey, Eye, EyeOff, AlertCircle, CheckCircle, Upload, FileLock2, FileLock, File, FilePlus, FilePlus2 } from 'lucide-react';
import { checkPasswordStrength } from '../../utils/crypto';
import Titlebar from '../ui/Titlebar';
import { useTheme } from '../../contexts/ThemeContext';

const CreateDatabaseScreen = ({ onDatabaseCreated, onBack, onNewDatabase, onOpenDatabase, onImportKeePass }) => {
  const { themes, actualTheme } = useTheme();
  const themeColors = themes[actualTheme]?.colors || themes.light.colors;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const handleCloseApp = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Master password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordStrength && (passwordStrength.strength === 'very-weak' || passwordStrength.strength === 'weak')) {
      newErrors.password = 'Please choose a stronger password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onDatabaseCreated(password);
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'very-weak': return `strength-very-weak`;
      case 'weak': return `strength-weak`;
      case 'medium': return `strength-medium`;
      case 'strong': return `strength-strong`;
      case 'very-strong': return `strength-very-strong`;
      default: return `theme-text-secondary bg-opacity-10 theme-border`;
    }
  };

  const getStrengthBarColor = (strength) => {
    switch (strength) {
      case 'very-weak': return 'strength-bar-very-weak';
      case 'weak': return 'strength-bar-weak';
      case 'medium': return 'strength-bar-medium';
      case 'strong': return 'strength-bar-strong';
      case 'very-strong': return 'strength-bar-very-strong';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="h-screen theme-bg flex flex-col overflow-hidden">
      <Titlebar 
        onClose={handleCloseApp}
        showMenus={true}
        onNewDatabase={onNewDatabase}
        onOpenDatabase={onOpenDatabase}
        onImportKeePass={onImportKeePass}
      />
      <div className="flex-1 overflow-y-auto smooth-scroll scrollbar-cool">
        <div className="min-h-full flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-sm sm:max-w-md py-2 sm:py-4">
            <div className="glass-effect-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl animate-slide-up">
              <div className="relative flex items-center mb-3 sm:mb-4 animate-slide-up-delay-1">
                <button
                  onClick={onBack}
                  className="absolute left-0 p-2 theme-button-secondary rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold theme-text text-center flex-1">Create New Database</h1>
              </div>

              <div className="mb-3 sm:mb-4 text-center animate-slide-up-delay-2">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-2 sm:mb-3 mx-auto">
                  <FilePlus2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <p className="text-sm sm:text-base theme-text-secondary">
                  Set up your master password to secure your new password database. This password will be used to encrypt and decrypt all your stored passwords.
                </p>
              </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 animate-slide-up-delay-3">
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium theme-text mb-2">
                Master Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full theme-input px-4 py-3 rounded-lg backdrop-blur-sm ${
                    errors.password ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter your master password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-secondary hover:opacity-80"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </div>
              )}
              
              {passwordStrength && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm theme-text-secondary">Security:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStrengthColor(passwordStrength.strength)}`}>
                      {passwordStrength.strength.replace('-', ' ').toUpperCase()} • {passwordStrength.encryptionBits} bits
                    </span>
                  </div>
                  <div className="w-full rounded-full border relative" style={{ 
                    backgroundColor: actualTheme === 'dark' ? '#1f2937' : actualTheme === 'cute' ? '#fdf2f8' : '#f8fafc',
                    borderColor: themeColors.border,
                    height: '8px',
                    padding: 0,
                    overflow: 'hidden'
                  }}>
                    <div 
                      className={`absolute top-0 left-0 bottom-0 ${getStrengthBarColor(passwordStrength.strength)}`}
                      style={{ 
                        width: `${Math.min((passwordStrength.entropy / 100) * 100, 100)}%`,
                        borderRadius: 'inherit'
                      }}
                    />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs theme-text-secondary list-disc list-inside">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium theme-text mb-2">
                Confirm Master Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full theme-input px-4 py-3 rounded-lg backdrop-blur-sm ${
                    errors.confirmPassword ? 'border-red-300' : ''
                  }`}
                  placeholder="Confirm your master password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-secondary hover:opacity-80"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </div>
              )}
              {!errors.confirmPassword && confirmPassword && password === confirmPassword && (
                <div className="flex items-center mt-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Passwords match
                </div>
              )}
            </div>

            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start text-blue-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Important Notice</p>
                  <p className="text-xs opacity-80">
                    Your master password cannot be recovered if forgotten. 
                    Choose a strong password that you will remember.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!password || !confirmPassword || passwordStrength?.strength === 'very-weak' || passwordStrength?.strength === 'weak'}
              className="w-full theme-button py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Create Database
            </button>
          </form>

          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t theme-border animate-slide-up-delay-4">
            <div className="text-center">
              <p className="text-xs sm:text-sm theme-text-secondary mb-2 sm:mb-3">
                Already have a KeePass database?
              </p>
              <button
                onClick={onImportKeePass}
                className="w-full theme-button-secondary py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                Import from KeePass
              </button>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDatabaseScreen;