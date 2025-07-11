import React, { useState, useEffect, useRef } from 'react';
import { Lock, Key, ArrowLeft, AlertCircle, Eye, Unlock, Shield, ShieldAlert } from 'lucide-react';
import Titlebar from '../ui/Titlebar';
import { securityManager } from '../../utils/security';

const LoginScreen = ({ onLoginSuccess, currentFile, onBack, onNewDatabase, onOpenDatabase, onImportKeePass }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [securityStatus, setSecurityStatus] = useState({
    isLocked: false,
    isPermanentlyLocked: false,
    failedAttempts: 0,
    remainingAttempts: 10,
    lockoutDuration: 0
  });
  const [countdown, setCountdown] = useState(0);
  const showPasswordTimeoutRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [securityFilePath, setSecurityFilePath] = useState('security.encrypted');

  // Initialize security manager and check status
  useEffect(() => {
    const initializeSecurity = async () => {
      if (!currentFile) return;
      
      try {
        await securityManager.initialize();
        const status = securityManager.getSecurityStatus(currentFile);
        setSecurityStatus(status);
        
        if (status.lockoutDuration > 0) {
          setCountdown(Math.ceil(status.lockoutDuration / 1000));
        }
        
        setIsInitialized(true);
        
        // Get security config path
        if (window.electronAPI?.getSecurityConfigPath) {
          try {
            const path = await window.electronAPI.getSecurityConfigPath();
            setSecurityFilePath(path);
          } catch (error) {
            console.error('Failed to get security config path:', error);
          }
        }
      } catch (error) {
        console.error('Failed to initialize security:', error);
        setIsInitialized(true);
      }
    };
    
    initializeSecurity();
  }, [currentFile]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && securityStatus.isLocked) {
      // Refresh security status when countdown ends
      const refreshStatus = async () => {
        const status = securityManager.getSecurityStatus(currentFile);
        setSecurityStatus(status);
      };
      refreshStatus();
    }
    return () => clearTimeout(timer);
  }, [countdown, currentFile, securityStatus.isLocked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isInitialized) return;
    
    if (countdown > 0 || securityStatus.isLocked) return; // Still locked out
    
    if (password.trim()) {
      try {
        const success = await onLoginSuccess(password);
        if (success === false) {
          // Record failed attempt
          const result = await securityManager.recordFailedAttempt(currentFile);
          setSecurityStatus(result);
          
          if (result.isPermanentlyLocked) {
            setError(`Database permanently locked after ${result.failedAttempts} failed attempts. To unlock, delete the security configuration file and restart the application.`);
          } else if (result.isLocked) {
            const seconds = Math.ceil(result.lockoutDuration / 1000);
            setCountdown(seconds);
            setError(`Too many incorrect attempts. Please wait ${seconds} seconds before trying again.`);
          } else {
            setError(`Incorrect master password. ${result.remainingAttempts} attempts remaining.`);
          }
        } else {
          // Record successful attempt
          await securityManager.recordSuccessfulAttempt(currentFile);
          setError('');
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('An error occurred during login. Please try again.');
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

              {/* Security Status Display */}
              {isInitialized && securityStatus.failedAttempts > 0 && (
                <div className={`mb-4 p-3 rounded-lg animate-slide-up-delay-2 ${securityStatus.isPermanentlyLocked ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className={`flex items-start text-sm ${securityStatus.isPermanentlyLocked ? 'text-red-600' : 'text-yellow-600'}`}>
                    {securityStatus.isPermanentlyLocked ? (
                      <ShieldAlert className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      {securityStatus.isPermanentlyLocked ? (
                        <div>
                          <p className="font-semibold mb-1">Database Permanently Locked</p>
                          <p className="text-xs opacity-80">
                            Delete security file to unlock: <code className="bg-white px-1 rounded text-xs">{securityFilePath}</code>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">{securityStatus.failedAttempts} failed attempt{securityStatus.failedAttempts > 1 ? 's' : ''}</p>
                          <p className="text-xs opacity-80">{securityStatus.remainingAttempts} remaining before lockout</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Discrete error message for non-security errors */}
              {error && !securityStatus.isPermanentlyLocked && !error.includes('wait') && !error.includes('attempts') && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-slide-up-delay-3">
                  <div className="flex items-start text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      {error}
                    </div>
                  </div>
                </div>
              )}

          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up-delay-4">
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
                    disabled={countdown > 0 || securityStatus.isPermanentlyLocked}
                    className="w-full theme-input px-4 py-3 rounded-lg backdrop-blur-sm"
                    placeholder="Enter your master password"
                    required
                  />
                </div>
                
                {/* Discrete error hints below password field */}
                {error && (securityStatus.isPermanentlyLocked || error.includes('wait') || error.includes('attempts')) && (
                  <div className="mt-2 text-xs text-red-600 animate-slide-up-delay-4">
                    {securityStatus.isPermanentlyLocked ? (
                      "Database locked - see security notice above"
                    ) : error.includes('wait') ? (
                      `Please wait ${countdown}s before trying again`
                    ) : error.includes('attempts') ? (
                      `Incorrect password - ${securityStatus.remainingAttempts} attempts remaining`
                    ) : null}
                  </div>
                )}
                
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
              disabled={countdown > 0 || securityStatus.isPermanentlyLocked}
            >
              {securityStatus.isPermanentlyLocked ? 'Database Permanently Locked' : 
               countdown > 0 ? `Locked (${countdown}s)` : 'Unlock Database'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center animate-slide-up-delay-5">
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