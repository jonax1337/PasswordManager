import React, { useEffect } from 'react';
import WelcomeScreen from './components/screens/WelcomeScreen';
import LoginScreen from './components/screens/LoginScreen';
import CreateDatabaseScreen from './components/screens/CreateDatabaseScreen';
import MainInterface from './components/screens/MainInterface';
import UnsavedChangesDialog from './components/dialogs/UnsavedChangesDialog';
import MultiWindowDialog from './components/dialogs/MultiWindowDialog';
import LockAnimation from './components/ui/LockAnimation';
import KeePassImportDialog from './components/dialogs/KeePassImportDialog';
import KeePassImportSuccessDialog from './components/dialogs/KeePassImportSuccessDialog';
import MasterPasswordDialog from './components/dialogs/MasterPasswordDialog';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAppState } from './hooks/useAppState';
import { useDatabase } from './hooks/useDatabase';
import { useFileOperations } from './hooks/useFileOperations';
import { useDialogState } from './hooks/useDialogState';
import './App.css';

function App() {
  // Initialize custom hooks
  const appStateHook = useAppState();
  const databaseHook = useDatabase();
  const fileOpsHook = useFileOperations();
  const dialogsHook = useDialogState();

  // Handle startup actions from useAppState hook
  useEffect(() => {
    const handleStartupAction = (event) => {
      const { action, data, filePath } = event.detail;
      
      if (action === 'import-keepass') {
        dialogsHook.openKeePassImportDialog();
      } else if (action === 'load-file' || action === 'load-recent') {
        fileOpsHook.setPendingDatabaseData(data);
        fileOpsHook.setCurrentFile(filePath);
        if (action === 'load-recent') {
          appStateHook.setIsAutoLoaded(true);
        }
        appStateHook.goToLogin();
      }
    };

    window.addEventListener('startupAction', handleStartupAction);
    return () => window.removeEventListener('startupAction', handleStartupAction);
  }, []);

  // Menu event handlers and file opening
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
            const result = await fileOpsHook.loadDatabaseFile(filePath);
            if (result.success) {
              appStateHook.setIsAutoLoaded(false);
              appStateHook.goToLogin();
            }
          } catch (error) {
            console.error('Error opening file:', error);
          }
        };

        // Check if we have an active database or are in the process of opening one
        if (appStateHook.appState === 'authenticated') {
          await checkUnsavedChanges(doOpenFile);
        } else if (appStateHook.appState === 'login' || appStateHook.appState === 'create' || fileOpsHook.currentFile || fileOpsHook.pendingDatabaseData) {
          // Ask for confirmation if we're switching from another database
          await dialogsHook.openUnsavedChangesDialog(doOpenFile);
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
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || appStateHook.appState === 'authenticated') {
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
  }, [appStateHook.appState]);

  const checkUnsavedChanges = async (action) => {
    // Never show unsaved changes dialog unless we're in an authenticated database
    if (databaseHook.hasUnsavedChanges && appStateHook.appState === 'authenticated') {
      return await dialogsHook.openUnsavedChangesDialog(action);
    }
    action(); // Execute immediately if no unsaved changes or not in authenticated state
    return true;
  };

  const handleCreateNewDatabase = async () => {
    const doCreateNew = () => {
      appStateHook.goToCreate();
      fileOpsHook.clearCurrentFile();
      databaseHook.resetDatabase();
      appStateHook.setIsAutoLoaded(false);
    };

    // Check if this action was already completed via MultiWindow dialog
    if (dialogsHook.multiWindowActionCompleted) {
      dialogsHook.setMultiWindowActionCompleted(false);
      return;
    }

    // Check if we have an active database (authenticated) or are in the process of opening one
    if (appStateHook.appState === 'authenticated') {
      // Show multi-window dialog for authenticated state
      dialogsHook.openMultiWindowDialog('new-database');
    } else if (appStateHook.appState === 'login' || fileOpsHook.currentFile || fileOpsHook.pendingDatabaseData) {
      // Ask for confirmation if we're switching from another database
      return await dialogsHook.openUnsavedChangesDialog(doCreateNew);
    } else {
      // For create state or welcome state, just create new directly
      doCreateNew();
    }
  };

  const handleOpenExistingDatabase = async () => {
    const doOpenExisting = async () => {
      const result = await fileOpsHook.openDatabase();
      if (result.success && !result.canceled) {
        appStateHook.setIsAutoLoaded(false); // This is manual loading
        appStateHook.goToLogin();
      }
    };

    // Check if this action was already completed via MultiWindow dialog
    if (dialogsHook.multiWindowActionCompleted) {
      dialogsHook.setMultiWindowActionCompleted(false);
      return;
    }

    // Check if we have an active database (authenticated) or are in the process of opening one
    if (appStateHook.appState === 'authenticated') {
      // Show multi-window dialog for authenticated state
      dialogsHook.openMultiWindowDialog('open-database');
    } else if (appStateHook.appState === 'login' || fileOpsHook.currentFile || fileOpsHook.pendingDatabaseData) {
      // Ask for confirmation if we're switching from another database
      return await dialogsHook.openUnsavedChangesDialog(doOpenExisting);
    } else {
      // For create state or welcome state, just open directly
      await doOpenExisting();
    }
  };

  const handleDatabaseCreated = (password) => {
    fileOpsHook.setMasterPassword(password);
    databaseHook.createNewDatabase(password);
    fileOpsHook.setCurrentFile(null);
    appStateHook.goToAuthenticated();
  };

  const handleLoginSuccess = (password) => {
    const result = fileOpsHook.decryptDatabase(password);
    if (result.success) {
      databaseHook.loadDatabase(result.database);
      // Show unlock animation instead of immediate transition
      appStateHook.goToUnlocking();
      return true;
    } else {
      console.error('Decryption error:', result.error);
      return false;
    }
  };

  const handleSaveDatabase = async (forceDialog = false) => {
    let passwordToUse = fileOpsHook.masterPassword;
    
    // If no master password is set (e.g., after KeePass import), show dialog
    if (!passwordToUse) {
      passwordToUse = await dialogsHook.openMasterPasswordDialog();
      if (!passwordToUse) {
        return false; // User canceled
      }
      fileOpsHook.setMasterPassword(passwordToUse);
    }

    const result = await fileOpsHook.saveDatabase(databaseHook.database, forceDialog, passwordToUse);
    if (result.success) {
      databaseHook.markAsSaved(databaseHook.database);
      return true;
    } else if (result.canceled) {
      return false; // User canceled
    } else {
      alert('Failed to save database. Please try again.');
      return false;
    }
  };

  const handleSaveAsDatabase = async () => {
    return await handleSaveDatabase(true); // Force dialog for "Save As"
  };

  // Smart save: automatically uses "Save As" for new databases
  const handleSmartSave = async () => {
    // If no current file (new database or after import), automatically use Save As
    if (!fileOpsHook.currentFile) {
      return await handleSaveDatabase(true); // Force Save As dialog
    } else {
      return await handleSaveDatabase(false); // Normal save
    }
  };

  const handleBackToWelcome = async () => {
    const doBackToWelcome = () => {
      appStateHook.goToWelcome();
      fileOpsHook.clearCurrentFile();
      databaseHook.resetDatabase();
      appStateHook.setIsAutoLoaded(false);
      // Clear recent database when going back
      if (appStateHook.isAutoLoaded) {
        fileOpsHook.clearRecentDatabase();
      }
    };

    if (appStateHook.appState === 'authenticated' && databaseHook.hasUnsavedChanges) {
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

    if (appStateHook.appState === 'authenticated' && databaseHook.hasUnsavedChanges) {
      await checkUnsavedChanges(doCloseApp);
    } else {
      doCloseApp();
    }
  };

  const handleNewDatabase = async () => {
    await handleCreateNewDatabase();
  };

  const handleOpenDatabase = async () => {
    await handleOpenExistingDatabase();
  };

  // Multi-window dialog handlers
  const handleMultiWindowReplaceCurrentDatabase = async () => {
    const action = dialogsHook.handleMultiWindowReplaceCurrentDatabase();
    
    if (action === 'new-database') {
      // Reset to create new database
      appStateHook.goToCreate();
      fileOpsHook.clearCurrentFile();
      databaseHook.resetDatabase();
      appStateHook.setIsAutoLoaded(false);
    } else if (action === 'open-database') {
      // Trigger open database dialog
      const result = await fileOpsHook.openDatabase();
      if (result.success && !result.canceled) {
        appStateHook.setIsAutoLoaded(false);
        appStateHook.goToLogin();
      }
    } else if (action === 'import-keepass') {
      // Show KeePass import dialog
      dialogsHook.openKeePassImportDialog();
    }
  };

  // KeePass Import handlers
  const handleImportKeePass = async () => {
    const doImportKeePass = () => {
      dialogsHook.openKeePassImportDialog();
    };

    if (appStateHook.appState === 'authenticated') {
      // Show multi-window dialog for authenticated state
      dialogsHook.openMultiWindowDialog('import-keepass');
    } else if ((appStateHook.appState === 'login' && (fileOpsHook.currentFile || fileOpsHook.pendingDatabaseData)) || 
               (appStateHook.appState !== 'create' && (fileOpsHook.currentFile || fileOpsHook.pendingDatabaseData))) {
      // Ask for confirmation if we're switching from another database (but not in create mode)
      return await dialogsHook.openUnsavedChangesDialog(doImportKeePass);
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

    // Set the converted database as current
    databaseHook.setDatabase(standardDatabase);
    databaseHook.setLastSavedDatabase(null); // No saved state yet - this is a new import
    fileOpsHook.setCurrentFile(null); // No file yet, needs to be saved
    fileOpsHook.setMasterPassword(''); // Will need to set new master password when saving
    
    // Show success dialog
    dialogsHook.handleKeePassImportSuccess(stats);
    
    // Transition to authenticated state
    appStateHook.goToAuthenticated();
  };

  // Render different screens based on app state
  const renderMainContent = () => {
    switch (appStateHook.appState) {
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
            currentFile={fileOpsHook.currentFile}
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
            database={databaseHook.database}
            onAddEntry={databaseHook.addEntry}
            onUpdateEntry={databaseHook.updateEntry}
            onDeleteEntry={databaseHook.deleteEntry}
            onSave={handleSmartSave}
            onSaveAs={handleSaveAsDatabase}
            onClose={handleBackToWelcome}
            onCloseApp={handleCloseApp}
            onAddFolder={databaseHook.addFolder}
            onRenameFolder={databaseHook.renameFolder}
            onDeleteFolder={databaseHook.deleteFolder}
            onMoveFolder={databaseHook.moveFolder}
            onMoveEntry={databaseHook.moveEntryToFolder}
            onNewDatabase={handleNewDatabase}
            onOpenDatabase={handleOpenDatabase}
            currentFile={fileOpsHook.currentFile}
            hasUnsavedChanges={databaseHook.hasUnsavedChanges}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      {renderMainContent()}
      {appStateHook.showUnlockAnimation && <LockAnimation onAnimationComplete={appStateHook.handleAnimationComplete} />}
      <UnsavedChangesDialog
        isOpen={dialogsHook.showUnsavedDialog}
        onSave={() => dialogsHook.handleUnsavedDialogSave(handleSmartSave)}
        onDiscard={dialogsHook.handleUnsavedDialogDiscard}
        onCancel={dialogsHook.handleUnsavedDialogCancel}
      />
      <MultiWindowDialog
        isOpen={dialogsHook.showMultiWindowDialog}
        onOpenInNewWindow={dialogsHook.handleMultiWindowOpenInNewWindow}
        onReplaceCurrentDatabase={handleMultiWindowReplaceCurrentDatabase}
        onCancel={dialogsHook.handleMultiWindowCancel}
        action={dialogsHook.pendingMultiWindowAction}
        hasUnsavedChanges={databaseHook.hasUnsavedChanges}
      />
      <KeePassImportDialog
        isOpen={dialogsHook.showKeePassImportDialog}
        onClose={dialogsHook.handleKeePassImportDialogClose}
        onImportSuccess={handleKeePassImportSuccess}
      />
      <KeePassImportSuccessDialog
        isOpen={dialogsHook.showKeePassSuccessDialog}
        onClose={dialogsHook.handleKeePassSuccessDialogClose}
        stats={dialogsHook.importStats}
      />
      <MasterPasswordDialog
        isOpen={dialogsHook.showMasterPasswordDialog}
        onClose={dialogsHook.handleMasterPasswordCancel}
        onConfirm={dialogsHook.handleMasterPasswordConfirm}
        title="Set Master Password"
      />
    </ThemeProvider>
  );
}

export default App;