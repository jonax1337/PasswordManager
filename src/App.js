import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import CreateDatabaseScreen from './components/CreateDatabaseScreen';
import MainInterface from './components/MainInterface';
import UnsavedChangesDialog from './components/UnsavedChangesDialog';
import LockAnimation from './components/LockAnimation';
import { ThemeProvider } from './contexts/ThemeContext';
import { encryptData, decryptData } from './utils/crypto';
import './App.css';

function App() {
  const [appState, setAppState] = useState('welcome'); // 'welcome', 'login', 'create', 'unlocking', 'authenticated'
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

  // Track unsaved changes
  useEffect(() => {
    if (lastSavedDatabase) {
      const hasChanges = JSON.stringify(database) !== JSON.stringify(lastSavedDatabase);
      setHasUnsavedChanges(hasChanges);
    }
  }, [database, lastSavedDatabase]);

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

      return () => {
        window.electronAPI.removeAllListeners('menu-new-database');
        window.electronAPI.removeAllListeners('menu-open-database');
        window.electronAPI.removeAllListeners('menu-save-database');
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
      const success = await handleSaveDatabase();
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
    };

    if (appState === 'authenticated') {
      await checkUnsavedChanges(doCreateNew);
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
          setAppState('login');
        }
      }
    };

    if (appState === 'authenticated') {
      await checkUnsavedChanges(doOpenExisting);
    } else {
      await doOpenExisting();
    }
  };

  const handleDatabaseCreated = (password) => {
    setMasterPassword(password);
    const newDatabase = {
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
              children: []
            }
          ]
        }
      ]
    };
    setDatabase(newDatabase);
    setLastSavedDatabase(newDatabase);
    setCurrentFile(null);
    setHasUnsavedChanges(false);
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
    if (window.electronAPI && masterPassword) {
      try {
        const encryptedData = encryptData(JSON.stringify(database), masterPassword);
        
        let result;
        // If we have a current file path and not forcing dialog, save directly
        if (currentFile && !forceDialog) {
          // Save to existing file path without dialog
          result = await window.electronAPI.saveDatabase(encryptedData, currentFile);
        } else {
          // Show save dialog for new files or when forced
          result = await window.electronAPI.saveDatabase(encryptedData);
        }
        
        if (result.success) {
          setCurrentFile(result.filePath);
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

  const handleBackToWelcome = async () => {
    const doBackToWelcome = () => {
      setAppState('welcome');
      setCurrentFile(null);
      setPendingDatabaseData(null);
      setMasterPassword('');
      setHasUnsavedChanges(false);
      setLastSavedDatabase(null);
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

  const addFolder = (parentId, folderName) => {
    const newFolder = {
      id: Date.now().toString(),
      name: folderName,
      path: parentId === 'root' ? folderName : '', // Will be updated properly
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

  const renameFolder = (folderId, newName) => {
    setDatabase(prev => {
      const updateFolders = (folders, parentPath = '') => {
        return folders.map(folder => {
          if (folder.id === folderId) {
            const newPath = parentPath ? `${parentPath}/${newName}` : newName;
            return {
              ...folder,
              name: newName,
              path: newPath
            };
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

  // Render different screens based on app state
  const renderMainContent = () => {
    switch (appState) {
      case 'welcome':
        return (
          <WelcomeScreen
            onCreateNew={handleCreateNewDatabase}
            onOpenExisting={handleOpenExistingDatabase}
          />
        );
      
      case 'create':
        return (
          <CreateDatabaseScreen
            onDatabaseCreated={handleDatabaseCreated}
            onBack={handleBackToWelcome}
            onNewDatabase={handleNewDatabase}
            onOpenDatabase={handleOpenDatabase}
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
            onSave={handleSaveDatabase}
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
    </ThemeProvider>
  );
}

export default App;