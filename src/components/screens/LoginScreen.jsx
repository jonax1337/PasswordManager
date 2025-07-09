import React, { useState, useEffect, useRef } from 'react';
import { Lock, Key, ArrowLeft, AlertCircle, Eye, Unlock } from 'lucide-react';
import Titlebar from '../ui/Titlebar';

const LoginScreen = ({ onLoginSuccess, currentFile, onBack, onNewDatabase, onOpenDatabase, onImportKeePass }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const showPasswordTimeoutRef = useRef(null);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && lockoutTime > 0) {
      setLockoutTime(0);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const calculateLockoutTime = () => {
    // Exponential backoff for lockout times
    if (failedAttempts < 3) return 0;
    if (failedAttempts === 3) return 5;
    if (failedAttempts === 4) return 15;
    if (failedAttempts === 5) return 30;
    return Math.min(Math.pow(2, failedAttempts - 3) * 30, 600); // Max 10 minutes
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (countdown > 0) return; // Still locked out
    
    if (password.trim()) {
      const success = onLoginSuccess(password);
      if (success === false) {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        
        const newLockoutTime = calculateLockoutTime();
        if (newLockoutTime > 0) {
          setLockoutTime(newLockoutTime);
          setCountdown(newLockoutTime);
          setError(`Too many incorrect attempts. Please wait ${newLockoutTime} seconds before trying again.`);
        } else {
          setError(`Incorrect master password. Please try again. (${newFailedAttempts} failed ${newFailedAttempts === 1 ? 'attempt' : 'attempts'})`);
        }
        
        // Keep the password value so user can correct typos
      } 
    }
  };

  const handleCloseApp = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
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
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold theme-text text-center flex-1">Unlock Database</h1>
              </div>

              <div className="text-center mb-4 sm:mb-6 animate-slide-up-delay-2">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-2 sm:mb-3">
                  <Unlock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <p className="text-sm sm:text-base theme-text-secondary">Enter your master password to unlock your database</p>
                {currentFile && (
                  <p className="text-xs sm:text-sm theme-text mt-2 theme-surface rounded-lg px-2 sm:px-3 py-1 sm:py-2">
                    {currentFile.split('/').pop()}
                  </p>
                )}
              </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up-delay-3">
            <div className="relative">
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium theme-text mb-2">
                Master Password
              </label>
              <div className="relative">
                <div className="flex items-center relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Key className="w-5 h-5 theme-text-secondary" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error && !error.includes('wait')) {
                        setError('');
                      }
                    }}
                    disabled={countdown > 0}
                    className="w-full theme-input px-4 py-3 rounded-lg backdrop-blur-sm"
                    placeholder="Enter your master password"
                    required
                  />
                </div>
                <button
                  type="button"
                  onMouseDown={() => {
                    setShowPassword(true);
                    // Clear any existing timeout
                    if (showPasswordTimeoutRef.current) {
                      clearTimeout(showPasswordTimeoutRef.current);
                    }
                  }}
                  onMouseUp={() => {
                    showPasswordTimeoutRef.current = setTimeout(() => setShowPassword(false), 100);
                  }}
                  onMouseLeave={() => {
                    showPasswordTimeoutRef.current = setTimeout(() => setShowPassword(false), 100);
                  }}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 theme-text-secondary hover:opacity-80 p-1"
                  aria-label="Show password"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full theme-button py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={countdown > 0}
            >
              {countdown > 0 ? `Locked (${countdown}s)` : 'Unlock Database'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center animate-slide-up-delay-4">
            <p className="text-xs sm:text-sm theme-text-secondary">
              Wrong database? <button onClick={onBack} className="text-blue-600 hover:opacity-80 underline">Go back</button> to select a different one.
            </p>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;