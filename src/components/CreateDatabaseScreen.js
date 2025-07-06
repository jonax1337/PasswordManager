import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { checkPasswordStrength } from '../utils/crypto';
import Titlebar from './Titlebar';

const CreateDatabaseScreen = ({ onDatabaseCreated, onBack, onNewDatabase, onOpenDatabase }) => {
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

    if (passwordStrength && passwordStrength.strength === 'weak') {
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
      case 'weak': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'strong': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStrengthBarColor = (strength) => {
    switch (strength) {
      case 'weak': return 'password-strength-weak';
      case 'medium': return 'password-strength-medium';
      case 'strong': return 'password-strength-strong';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen theme-bg flex flex-col">
      <Titlebar 
        onClose={handleCloseApp}
        showMenus={true}
        onNewDatabase={onNewDatabase}
        onOpenDatabase={onOpenDatabase}
      />
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-effect-strong rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center mb-6">
            <button
              onClick={onBack}
              className="p-2 theme-button-secondary rounded-lg transition-colors mr-3"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold theme-text">Create New Database</h1>
          </div>

          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-4 mx-auto">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <p className="theme-text-secondary">
              Set up your master password to secure your new password database. This password will be used to encrypt and decrypt all your stored passwords.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium theme-text mb-2">
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
                    <span className="text-sm theme-text-secondary">Password strength:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStrengthColor(passwordStrength.strength)}`}>
                      {passwordStrength.strength.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full theme-border rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStrengthBarColor(passwordStrength.strength)}`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium theme-text mb-2">
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

            <div className="border border-red-400 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-sm theme-text">
                  <strong>Important:</strong> Your master password cannot be recovered if forgotten. 
                  Make sure to choose a strong password that you will remember.
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!password || !confirmPassword || passwordStrength?.strength === 'weak'}
              className="w-full theme-button py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Create Database
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CreateDatabaseScreen;