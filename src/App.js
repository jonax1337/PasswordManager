import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import CreateDatabaseScreen from './components/CreateDatabaseScreen';
import MainInterface from './components/MainInterface';
import UnsavedChangesDialog from './components/UnsavedChangesDialog';
import MultiWindowDialog from './components/MultiWindowDialog';
import LockAnimation from './components/LockAnimation';
import KeePassImportDialog from './components/KeePassImportDialog';
import KeePassImportSuccessDialog from './components/KeePassImportSuccessDialog';
import MasterPasswordDialog from './components/MasterPasswordDialog';
import { ThemeProvider } from './contexts/ThemeContext';
import { encryptData, decryptData } from './utils/crypto';
import './App.css';

function App() {
  const [appState, setAppState] = useState('welcome'); // 'welcome', 'login', 'create', 'unlocking', 'authenticated'
  const [isAutoLoaded, setIsAutoLoaded] = useState(false); // Track if we auto-loaded a recent database
  const [hasInitialLoad, setHasInitialLoad] = useState(false); // Track if we've done the initial startup check
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [database, setDatabase] = useState({
    entries: [],
    folders: [
      {
        id: 'root',
        name: 'All Entries',
        path: '',
        children: [
          {
            id: 'general',
            name: 'General',
            path: 'General',
            icon: null,
            children: []
          }
        ]
      }
    ]
  });
  const [currentFile, setCurrentFile] = useState(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [pendingDatabaseData, setPendingDatabaseData] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedDatabase, setLastSavedDatabase] = useState(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingActionResolve, setPendingActionResolve] = useState(null);
  const [showMultiWindowDialog, setShowMultiWindowDialog] = useState(false);
  const [pendingMultiWindowAction, setPendingMultiWindowAction] = useState(null);
  const [showKeePassImportDialog, setShowKeePassImportDialog] = useState(false);
  const [showKeePassSuccessDialog, setShowKeePassSuccessDialog] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const [showMasterPasswordDialog, setShowMasterPasswordDialog] = useState(false);
  const [pendingSaveResolve, setPendingSaveResolve] = useState(null);
  const [multiWindowActionCompleted, setMultiWindowActionCompleted] = useState(false);

  // Track unsaved changes
  useEffect(() => {
    if (lastSavedDatabase) {
      const hasChanges = JSON.stringify(database) !== JSON.stringify(lastSavedDatabase);
      setHasUnsavedChanges(hasChanges);
    } else if (database.entries.length > 0 || (database.folders && database.folders.length > 1)) {
      // If no saved state but we have data (e.g., after import), mark as unsaved
      setHasUnsavedChanges(true);
    }
  }, [database, lastSavedDatabase]);

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
              setShowKeePassImportDialog(true);
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
                setPendingDatabaseData(result);
                setCurrentFile(pendingFile);
                setIsAutoLoaded(false); // Command line opening is not auto-loading
                await window.electronAPI.setRecentDatabase(pendingFile);
                setAppState('login');
                return;
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
                setPendingDatabaseData(result);
                setCurrentFile(recentPath);
                setIsAutoLoaded(true);
                setAppState('login');
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
    };

    checkStartupDatabase();
  }, [hasInitialLoad]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onMenuNewDatabase(async () => {
        await handleNewDatabase();
      });

      window.electronAPI.onMenuOpenDatabase(async () => {
        await handleOpenDatabase();
      });

      window.electronAPI.onMenuSaveDatabase(async () => {
        await handleSaveDatabase();
      });

      window.electronAPI.onMenuImportKeePass(async () => {
        await handleImportKeePass();
      });

      // Handle file opening when app is already running
      window.electronAPI.onOpenFile(async (event, filePath) => {
        const doOpenFile = async () => {
          try {
            const result = await window.electronAPI.loadDatabaseFile(filePath);
            if (result.success) {
              setPendingDatabaseData(result);
              setCurrentFile(filePath);
              setIsAutoLoaded(false);
              await window.electronAPI.setRecentDatabase(filePath);
              setAppState('login');
            }
          } catch (error) {
            console.error('Error opening file:', error);
          }
        };

        // Check if we have an active database or are in the process of opening one
        if (appState === 'authenticated') {
          await checkUnsavedChanges(doOpenFile);
        } else if (appState === 'login' || appState === 'create' || currentFile || pendingDatabaseData) {
          // Ask for confirmation if we're switching from another database
          setPendingAction(() => doOpenFile);
          setShowUnsavedDialog(true);
        } else {
          await doOpenFile();
        }
      });

      return () => {
        window.electronAPI.removeAllListeners('menu-new-database');
        window.electronAPI.removeAllListeners('menu-open-database');
        window.electronAPI.removeAllListeners('menu-save-database');
        window.electronAPI.removeAllListeners('menu-import-keepass');
        window.electronAPI.removeAllListeners('open-file');
      };
    }
  }, []);

  // Global keyboard shortcuts (only for non-authenticated states)
  useEffect(() => {
    const handleGlobalKeyDown = async (e) => {
      // Only handle shortcuts when not in input fields and not authenticated
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || appState === 'authenticated') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            await handleNewDatabase();
            break;
          case 'o':
            e.preventDefault();
            await handleOpenDatabase();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [appState]);

  const checkUnsavedChanges = async (action) => {
    if (hasUnsavedChanges) {
      return new Promise((resolve) => {
        setPendingAction(() => () => {
          resolve(true); // Resolve with true when action should proceed
          action();
        });
        // Store resolve function for cancel case
        setPendingActionResolve(() => resolve);
        setShowUnsavedDialog(true);
      });
    }
    action(); // Execute immediately if no unsaved changes
    return true;
  };

  const handleUnsavedDialogSave = async () => {
    try {
      const success = await handleSmartSave(); // Use smart save instead
      if (success) {
        // Only proceed if save was successful (not canceled)
        if (pendingAction) {
          pendingAction();
        }
        setShowUnsavedDialog(false);
        setPendingAction(null);
        setPendingActionResolve(null);
      }
      // If save was canceled or failed, keep the dialog open
    } catch (error) {
      console.error('Error saving database:', error);
      // Don't close dialog or execute pending action if save failed
    }
  };

  const handleUnsavedDialogDiscard = () => {
    if (pendingAction) {
      pendingAction();
    }
    setShowUnsavedDialog(false);
    setPendingAction(null);
    setPendingActionResolve(null);
  };

  const handleUnsavedDialogCancel = () => {
    // Resolve with false to indicate action was canceled
    if (pendingActionResolve) {
      pendingActionResolve(false);
    }
    setShowUnsavedDialog(false);
    setPendingAction(null);
    setPendingActionResolve(null);
  };

  const handleCreateNewDatabase = async () => {
    const doCreateNew = () => {
      setAppState('create');
      setCurrentFile(null);
      setPendingDatabaseData(null);
      setMasterPassword('');
      setHasUnsavedChanges(false);
      setLastSavedDatabase(null);
      setIsAutoLoaded(false);
    };

    // Check if this action was already completed via MultiWindow dialog
    if (multiWindowActionCompleted) {
      setMultiWindowActionCompleted(false);
      return;
    }

    // Check if we have an active database (authenticated) or are in the process of opening one (login, create states)
    if (appState === 'authenticated') {
      // Show multi-window dialog for authenticated state
      setPendingMultiWindowAction('new-database');
      setShowMultiWindowDialog(true);
    } else if (appState === 'login' || appState === 'create' || currentFile || pendingDatabaseData) {
      // Ask for confirmation if we're switching from another database
      return new Promise((resolve) => {
        setPendingAction(() => () => {
          resolve(true);
          doCreateNew();
        });
        setPendingActionResolve(() => resolve);
        setShowUnsavedDialog(true);
      });
    } else {
      doCreateNew();
    }
  };

  const handleOpenExistingDatabase = async () => {
    const doOpenExisting = async () => {
      if (window.electronAPI) {
        const result = await window.electronAPI.loadDatabase();
        if (result.success && !result.canceled) {
          setPendingDatabaseData(result);
          setCurrentFile(result.filePath);
          setIsAutoLoaded(false); // This is manual loading
          // Save as recent database
          await window.electronAPI.setRecentDatabase(result.filePath);
          setAppState('login');
        }
      }
    };

    // Check if this action was already completed via MultiWindow dialog
    if (multiWindowActionCompleted) {
      setMultiWindowActionCompleted(false);
      return;
    }

    // Check if we have an active database (authenticated) or are in the process of opening one (login, create states)
    if (appState === 'authenticated') {
      // Show multi-window dialog for authenticated state
      setPendingMultiWindowAction('open-database');
      setShowMultiWindowDialog(true);
    } else if (appState === 'login' || appState === 'create' || currentFile || pendingDatabaseData) {
      // Ask for confirmation if we're switching from another database
      return new Promise((resolve) => {
        setPendingAction(() => () => {
          resolve(true);
          doOpenExisting();
        });
        setPendingActionResolve(() => resolve);
        setShowUnsavedDialog(true);
      });
    } else {
      await doOpenExisting();
    }
  };

  const handleDatabaseCreated = (password) => {
    setMasterPassword(password);
    
    // Create a sample entry to demonstrate the app and ensure unsaved changes
    const sampleEntry = {
      id: Date.now().toString(),
      title: 'Welcome to Simple Password Manager',
      username: 'your-username@example.com',
      password: 'SamplePassword123!',
      url: 'https://example.com',
      folder: 'General',
      notes: 'This is a sample entry to get you started. You can edit or delete this entry and add your own passwords. Don\'t forget to save your database!',
      icon: null,
      createdAt: new Date(),
      modifiedAt: new Date()
    };

    const newDatabase = {
      entries: [sampleEntry], // Include the sample entry
      folders: [
        {
          id: 'root',
          name: 'All Entries',
          path: '',
          children: [
            {
              id: 'general',
              name: 'General',
              path: 'General',
              icon: null,
              children: []
            }
          ]
        }
      ]
    };
    
    setDatabase(newDatabase);
    setLastSavedDatabase(null); // Set to null so it's marked as unsaved (like import)
    setCurrentFile(null);
    setHasUnsavedChanges(false); // Will be set to true by useEffect due to lastSavedDatabase being null
    setAppState('authenticated');
  };

  const handleLoginSuccess = (password) => {
    if (pendingDatabaseData) {
      try {
        const decryptedData = decryptData(pendingDatabaseData.data, password);
        const loadedDatabase = JSON.parse(decryptedData);
        setDatabase(loadedDatabase);
        setLastSavedDatabase(loadedDatabase);
        setMasterPassword(password);
        setHasUnsavedChanges(false);
        // Show unlock animation instead of immediate transition
        setAppState('unlocking');
        setShowUnlockAnimation(true);
        setPendingDatabaseData(null);
      } catch (error) {
        console.error('Decryption error:', error);
        return false;
      }
    }
    return true;
  };
  
  const handleAnimationComplete = () => {
    setShowUnlockAnimation(false);
    setAppState('authenticated');
  };

  const handleNewDatabase = async () => {
    await handleCreateNewDatabase();
  };

  const handleOpenDatabase = async () => {
    await handleOpenExistingDatabase();
  };

  const handleSaveDatabase = async (forceDialog = false) => {
    let passwordToUse = masterPassword;
    
    // If no master password is set (e.g., after KeePass import), show dialog
    if (!passwordToUse) {
      return new Promise((resolve) => {
        setPendingSaveResolve(() => (password) => {
          if (password) {
            setMasterPassword(password);
            performSave(password, forceDialog).then(resolve);
          } else {
            resolve(false); // User canceled
          }
        });
        setShowMasterPasswordDialog(true);
      });
    }

    return await performSave(passwordToUse, forceDialog);
  };

  const performSave = async (passwordToUse, forceDialog = false) => {
    if (window.electronAPI && passwordToUse) {
      try {
        const encryptedData = encryptData(JSON.stringify(database), passwordToUse);
        
        let result;
        // If we have a current file path and not forcing dialog, save directly
        if (currentFile && !forceDialog) {
          // Save to existing file path without dialog
          result = await window.electronAPI.saveDatabase(encryptedData, currentFile);
        } else {
          // Show save dialog for new files, after import, or when forced (Save As)
          result = await window.electronAPI.saveDatabase(encryptedData);
        }
        
        if (result.success) {
          setCurrentFile(result.filePath);
          // Save as recent database
          await window.electronAPI.setRecentDatabase(result.filePath);
          setLastSavedDatabase(JSON.parse(JSON.stringify(database))); // Deep copy
          setHasUnsavedChanges(false);
          return true;
        } else if (result.canceled) {
          // User canceled the save dialog
          return false;
        }
      } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save database. Please try again.');
        return false;
      }
    }
    return false;
  };

  const handleSaveAsDatabase = async () => {
    return await handleSaveDatabase(true); // Force dialog for "Save As"
  };

  // Smart save: automatically uses "Save As" for new databases
  const handleSmartSave = async () => {
    // If no current file (new database or after import), automatically use Save As
    if (!currentFile) {
      return await handleSaveDatabase(true); // Force Save As dialog
    } else {
      return await handleSaveDatabase(false); // Normal save
    }
  };

  const handleBackToWelcome = async () => {
    const doBackToWelcome = () => {
      setAppState('welcome');
      setCurrentFile(null);
      setPendingDatabaseData(null);
      setMasterPassword('');
      setHasUnsavedChanges(false);
      setLastSavedDatabase(null);
      setIsAutoLoaded(false);
      // Clear recent database when going back
      if (isAutoLoaded && window.electronAPI) {
        window.electronAPI.clearRecentDatabase();
      }
    };

    if (appState === 'authenticated' && hasUnsavedChanges) {
      await checkUnsavedChanges(doBackToWelcome);
    } else {
      doBackToWelcome();
    }
  };

  const handleCloseApp = async () => {
    const doCloseApp = () => {
      if (window.electronAPI) {
        window.electronAPI.closeWindow();
      }
    };

    if (appState === 'authenticated' && hasUnsavedChanges) {
      await checkUnsavedChanges(doCloseApp);
    } else {
      doCloseApp();
    }
  };

  const addEntry = (entry) => {
    setDatabase(prev => ({
      ...prev,
      entries: [...prev.entries, { ...entry, id: Date.now() }]
    }));
  };

  const updateEntry = (id, updatedEntry) => {
    setDatabase(prev => ({
      ...prev,
      entries: prev.entries.map(entry => 
        entry.id === id ? { ...entry, ...updatedEntry } : entry
      )
    }));
  };

  const deleteEntry = (id) => {
    setDatabase(prev => ({
      ...prev,
      entries: prev.entries.filter(entry => entry.id !== id)
    }));
  };

  // Folder management functions
  const findFolderById = (folders, id) => {
    for (const folder of folders) {
      if (folder.id === id) return folder;
      if (folder.children) {
        const found = findFolderById(folder.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const addFolder = (parentId, folderName, icon = null) => {
    const newFolder = {
      id: Date.now().toString(),
      name: folderName,
      path: parentId === 'root' ? folderName : '', // Will be updated properly
      icon: icon,
      children: []
    };

    setDatabase(prev => {
      const updateFolders = (folders) => {
        return folders.map(folder => {
          if (folder.id === parentId) {
            // Update path for new folder
            newFolder.path = folder.path ? `${folder.path}/${folderName}` : folderName;
            return {
              ...folder,
              children: [...folder.children, newFolder]
            };
          }
          return {
            ...folder,
            children: folder.children ? updateFolders(folder.children) : []
          };
        });
      };

      return {
        ...prev,
        folders: updateFolders(prev.folders)
      };
    });
  };

  const renameFolder = (folderId, newName, icon = undefined) => {
    setDatabase(prev => {
      const updateFolders = (folders, parentPath = '') => {
        return folders.map(folder => {
          if (folder.id === folderId) {
            const newPath = parentPath ? `${parentPath}/${newName}` : newName;
            const updatedFolder = {
              ...folder,
              name: newName,
              path: newPath
            };
            // Only update icon if it's provided (undefined means keep existing)
            if (icon !== undefined) {
              updatedFolder.icon = icon;
            }
            return updatedFolder;
          }
          const currentPath = folder.path || folder.name;
          return {
            ...folder,
            children: folder.children ? updateFolders(folder.children, currentPath) : []
          };
        });
      };

      return {
        ...prev,
        folders: updateFolders(prev.folders)
      };
    });
  };

  const deleteFolder = (folderId) => {
    // Check if folder has entries
    const folderToDelete = findFolderById(database.folders, folderId);
    if (!folderToDelete) return;

    const hasEntries = database.entries.some(entry => 
      entry.folder && entry.folder.startsWith(folderToDelete.path)
    );

    if (hasEntries) {
      const shouldDelete = window.confirm(
        `This folder contains password entries. Are you sure you want to delete it? All entries in this folder will be moved to "General".`
      );
      if (!shouldDelete) return;

      // Move entries to General
      setDatabase(prev => ({
        ...prev,
        entries: prev.entries.map(entry => 
          entry.folder && entry.folder.startsWith(folderToDelete.path)
            ? { ...entry, folder: 'General' }
            : entry
        )
      }));
    }

    // Remove folder from tree
    setDatabase(prev => {
      const removeFolderFromTree = (folders) => {
        return folders.filter(folder => {
          if (folder.id === folderId) return false;
          return {
            ...folder,
            children: folder.children ? removeFolderFromTree(folder.children) : []
          };
        }).map(folder => ({
          ...folder,
          children: folder.children ? removeFolderFromTree(folder.children) : []
        }));
      };

      return {
        ...prev,
        folders: removeFolderFromTree(prev.folders)
      };
    });
  };

  // Multi-window dialog handlers
  const handleMultiWindowOpenInNewWindow = async () => {
    try {
      if (pendingMultiWindowAction === 'new-database') {
        await window.electronAPI.createNewDatabaseWindow();
      } else if (pendingMultiWindowAction === 'open-database') {
        await window.electronAPI.openDatabaseInNewWindow();
      } else if (pendingMultiWindowAction === 'import-keepass') {
        await window.electronAPI.importKeePassInNewWindow();
      }
    } catch (error) {
      console.error('Error opening in new window:', error);
    }
    setShowMultiWindowDialog(false);
    setPendingMultiWindowAction(null);
  };

  const handleMultiWindowReplaceCurrentDatabase = async () => {
    // User already chose "Replace Current Database" - execute directly without additional confirmation
    if (pendingMultiWindowAction === 'new-database') {
      // Reset to create new database
      setAppState('create');
      setCurrentFile(null);
      setPendingDatabaseData(null);
      setMasterPassword('');
      setHasUnsavedChanges(false);
      setLastSavedDatabase(null);
      setIsAutoLoaded(false);
      setMultiWindowActionCompleted(true); // Mark as completed to prevent double UnsavedChanges dialog
    } else if (pendingMultiWindowAction === 'open-database') {
      // Trigger open database dialog
      if (window.electronAPI) {
        const result = await window.electronAPI.loadDatabase();
        if (result.success && !result.canceled) {
          setPendingDatabaseData(result);
          setCurrentFile(result.filePath);
          setIsAutoLoaded(false);
          await window.electronAPI.setRecentDatabase(result.filePath);
          setAppState('login');
          setMultiWindowActionCompleted(true); // Mark as completed to prevent double UnsavedChanges dialog
        }
      }
    } else if (pendingMultiWindowAction === 'import-keepass') {
      // Show KeePass import dialog
      setShowKeePassImportDialog(true);
    }
    setShowMultiWindowDialog(false);
    setPendingMultiWindowAction(null);
  };

  const handleMultiWindowCancel = () => {
    setShowMultiWindowDialog(false);
    setPendingMultiWindowAction(null);
  };

  // KeePass Import handlers
  const handleImportKeePass = async () => {
    const doImportKeePass = () => {
      setShowKeePassImportDialog(true);
    };

    if (appState === 'authenticated') {
      // Show multi-window dialog for authenticated state
      setPendingMultiWindowAction('import-keepass');
      setShowMultiWindowDialog(true);
    } else if ((appState === 'login' && (currentFile || pendingDatabaseData)) || 
               (appState !== 'create' && (currentFile || pendingDatabaseData))) {
      // Ask for confirmation if we're switching from another database (but not in create mode)
      return new Promise((resolve) => {
        setPendingAction(() => () => {
          resolve(true);
          doImportKeePass();
        });
        setPendingActionResolve(() => resolve);
        setShowUnsavedDialog(true);
      });
    } else {
      // Direct import - no database exists yet (create mode) or no database loaded
      doImportKeePass();
    }
  };

  const handleKeePassImportSuccess = (importedDatabase, stats) => {
    // Convert imported database to our standard format with "All Entries" root
    const standardDatabase = {
      entries: importedDatabase.entries || [],
      folders: [
        {
          id: 'root',
          name: 'All Entries',
          path: '',
          children: [
            // Only add imported folders as children of root, no forced "General" folder
            ...(importedDatabase.folders || []).map(folder => ({
              ...folder,
              // Ensure imported folders are nested under the root structure
              path: folder.path || folder.name
            }))
          ]
        }
      ]
    };

    // Keep entry folder paths as they are from the import
    // Don't force entries into "General" - let them keep their original folder structure

    // Set the converted database as current
    setDatabase(standardDatabase);
    setLastSavedDatabase(null); // No saved state yet - this is a new import
    setCurrentFile(null); // No file yet, needs to be saved
    setMasterPassword(''); // Will need to set new master password when saving
    
    // Show success dialog
    setImportStats(stats);
    setShowKeePassSuccessDialog(true);
    
    // Transition to authenticated state
    setAppState('authenticated');
    
    // hasUnsavedChanges will be automatically set to true by the useEffect
  };

  const handleKeePassImportDialogClose = () => {
    setShowKeePassImportDialog(false);
  };

  const handleKeePassSuccessDialogClose = () => {
    setShowKeePassSuccessDialog(false);
    setImportStats(null);
  };

  // Master Password Dialog handlers
  const handleMasterPasswordConfirm = (password) => {
    if (pendingSaveResolve) {
      pendingSaveResolve(password);
      setPendingSaveResolve(null);
    }
    setShowMasterPasswordDialog(false);
  };

  const handleMasterPasswordCancel = () => {
    if (pendingSaveResolve) {
      pendingSaveResolve(null);
      setPendingSaveResolve(null);
    }
    setShowMasterPasswordDialog(false);
  };

  // Render different screens based on app state
  const renderMainContent = () => {
    switch (appState) {
      case 'welcome':
        return (
          <WelcomeScreen
            onCreateNew={handleCreateNewDatabase}
            onOpenExisting={handleOpenExistingDatabase}
            onImportKeePass={handleImportKeePass}
          />
        );
      
      case 'create':
        return (
          <CreateDatabaseScreen
            onDatabaseCreated={handleDatabaseCreated}
            onBack={handleBackToWelcome}
            onNewDatabase={handleNewDatabase}
            onOpenDatabase={handleOpenDatabase}
            onImportKeePass={handleImportKeePass}
          />
        );
      
      case 'login':
        return (
          <LoginScreen 
            onLoginSuccess={handleLoginSuccess}
            onBack={handleBackToWelcome}
            currentFile={currentFile}
            onNewDatabase={handleNewDatabase}
            onOpenDatabase={handleOpenDatabase}
            onImportKeePass={handleImportKeePass}
          />
        );
      
      case 'unlocking':
        return null; // Return null for unlocking state as the animation is shown separately
      
      case 'authenticated':
        return (
          <MainInterface
            database={database}
            onAddEntry={addEntry}
            onUpdateEntry={updateEntry}
            onDeleteEntry={deleteEntry}
            onSave={handleSmartSave}
            onSaveAs={handleSaveAsDatabase}
            onClose={handleBackToWelcome}
            onCloseApp={handleCloseApp}
            onAddFolder={addFolder}
            onRenameFolder={renameFolder}
            onDeleteFolder={deleteFolder}
            onNewDatabase={handleNewDatabase}
            onOpenDatabase={handleOpenDatabase}
            currentFile={currentFile}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      {renderMainContent()}
      {showUnlockAnimation && <LockAnimation onAnimationComplete={handleAnimationComplete} />}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onSave={handleUnsavedDialogSave}
        onDiscard={handleUnsavedDialogDiscard}
        onCancel={handleUnsavedDialogCancel}
      />
      <MultiWindowDialog
        isOpen={showMultiWindowDialog}
        onOpenInNewWindow={handleMultiWindowOpenInNewWindow}
        onReplaceCurrentDatabase={handleMultiWindowReplaceCurrentDatabase}
        onCancel={handleMultiWindowCancel}
        action={pendingMultiWindowAction}
        hasUnsavedChanges={hasUnsavedChanges}
      />
      <KeePassImportDialog
        isOpen={showKeePassImportDialog}
        onClose={handleKeePassImportDialogClose}
        onImportSuccess={handleKeePassImportSuccess}
      />
      <KeePassImportSuccessDialog
        isOpen={showKeePassSuccessDialog}
        onClose={handleKeePassSuccessDialogClose}
        stats={importStats}
      />
      <MasterPasswordDialog
        isOpen={showMasterPasswordDialog}
        onClose={handleMasterPasswordCancel}
        onConfirm={handleMasterPasswordConfirm}
        title="Set Master Password"
      />
    </ThemeProvider>
  );
}

export default App;