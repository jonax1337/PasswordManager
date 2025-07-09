import { useState, useEffect } from 'react';

export const useAppState = () => {
  const [appState, setAppState] = useState('welcome');
  const [isAutoLoaded, setIsAutoLoaded] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  // Check for command line file or recent database on startup - only once
  useEffect(() => {
    const checkStartupDatabase = async () => {
      if (window.electronAPI && !hasInitialLoad) {
        setHasInitialLoad(true);
        try {
          // First check for startup action (e.g., import-keepass)
          const startupAction = await window.electronAPI.getStartupAction();
          if (startupAction) {
            // If we have any startup action, skip recent file loading and handle the action
            if (startupAction === 'import-keepass') {
              // This will be handled by the parent component
              return { action: 'import-keepass' };
            }
            // Add other startup actions here as needed
            return; // Exit early - don't load recent files when we have a specific startup action
          }
          
          // Then check for command line file
          const pendingFile = await window.electronAPI.getPendingFile();
          if (pendingFile) {
            try {
              const result = await window.electronAPI.loadDatabaseFile(pendingFile);
              if (result.success) {
                setIsAutoLoaded(false); // Command line opening is not auto-loading
                await window.electronAPI.setRecentDatabase(pendingFile);
                setAppState('login');
                return { action: 'load-file', data: result, filePath: pendingFile };
              }
            } catch (error) {
              console.error('Error loading command line file:', error);
            }
          }
          
          // If no command line file, check for recent database
          const recentPath = await window.electronAPI.getRecentDatabase();
          if (recentPath) {
            // Load the database file data without dialog
            try {
              const result = await window.electronAPI.loadDatabaseFile(recentPath);
              if (result.success) {
                setIsAutoLoaded(true);
                setAppState('login');
                return { action: 'load-recent', data: result, filePath: recentPath };
              } else {
                // File doesn't exist anymore, clear recent database
                await window.electronAPI.clearRecentDatabase();
              }
            } catch (error) {
              // File doesn't exist anymore, clear recent database
              await window.electronAPI.clearRecentDatabase();
            }
          }
        } catch (error) {
          console.error('Error checking startup database:', error);
        }
      }
      return null;
    };

    checkStartupDatabase().then(result => {
      if (result && result.action) {
        // Emit custom event for parent to handle
        const event = new CustomEvent('startupAction', { detail: result });
        window.dispatchEvent(event);
      }
    });
  }, [hasInitialLoad]);

  const handleAnimationComplete = () => {
    setShowUnlockAnimation(false);
    setAppState('authenticated');
  };

  const goToWelcome = () => {
    setAppState('welcome');
    setIsAutoLoaded(false);
  };

  const goToCreate = () => {
    setAppState('create');
    setIsAutoLoaded(false);
  };

  const goToLogin = () => {
    setAppState('login');
  };

  const goToUnlocking = () => {
    setAppState('unlocking');
    setShowUnlockAnimation(true);
  };

  const goToAuthenticated = () => {
    setAppState('authenticated');
  };

  return {
    appState,
    setAppState,
    isAutoLoaded,
    setIsAutoLoaded,
    hasInitialLoad,
    setHasInitialLoad,
    showUnlockAnimation,
    setShowUnlockAnimation,
    handleAnimationComplete,
    goToWelcome,
    goToCreate,
    goToLogin,
    goToUnlocking,
    goToAuthenticated
  };
};