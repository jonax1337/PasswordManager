import { useState } from 'react';

export const useDialogState = () => {
  // Unsaved Changes Dialog
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingActionResolve, setPendingActionResolve] = useState(null);

  // Multi Window Dialog
  const [showMultiWindowDialog, setShowMultiWindowDialog] = useState(false);
  const [pendingMultiWindowAction, setPendingMultiWindowAction] = useState(null);
  const [multiWindowActionCompleted, setMultiWindowActionCompleted] = useState(false);

  // KeePass Import Dialogs
  const [showKeePassImportDialog, setShowKeePassImportDialog] = useState(false);
  const [showKeePassSuccessDialog, setShowKeePassSuccessDialog] = useState(false);
  const [importStats, setImportStats] = useState(null);

  // Master Password Dialog
  const [showMasterPasswordDialog, setShowMasterPasswordDialog] = useState(false);
  const [pendingSaveResolve, setPendingSaveResolve] = useState(null);

  const openUnsavedChangesDialog = (action) => {
    return new Promise((resolve) => {
      setPendingAction(() => () => {
        resolve(true); // Resolve with true when action should proceed
        action();
      });
      // Store resolve function for cancel case
      setPendingActionResolve(() => resolve);
      setShowUnsavedDialog(true);
    });
  };

  const handleUnsavedDialogSave = async (saveFunction) => {
    try {
      const success = await saveFunction(); // Use provided save function
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

  const openMultiWindowDialog = (action) => {
    setPendingMultiWindowAction(action);
    setShowMultiWindowDialog(true);
  };

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

  const handleMultiWindowReplaceCurrentDatabase = () => {
    setShowMultiWindowDialog(false);
    setMultiWindowActionCompleted(true);
    return pendingMultiWindowAction;
  };

  const handleMultiWindowCancel = () => {
    setShowMultiWindowDialog(false);
    setPendingMultiWindowAction(null);
  };

  const openKeePassImportDialog = () => {
    setShowKeePassImportDialog(true);
  };

  const handleKeePassImportDialogClose = () => {
    setShowKeePassImportDialog(false);
  };

  const handleKeePassImportSuccess = (stats) => {
    setImportStats(stats);
    setShowKeePassSuccessDialog(true);
    setShowKeePassImportDialog(false);
  };

  const handleKeePassSuccessDialogClose = () => {
    setShowKeePassSuccessDialog(false);
    setImportStats(null);
  };

  const openMasterPasswordDialog = () => {
    return new Promise((resolve) => {
      setPendingSaveResolve(() => resolve);
      setShowMasterPasswordDialog(true);
    });
  };

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

  return {
    // Unsaved Changes Dialog
    showUnsavedDialog,
    setShowUnsavedDialog,
    pendingAction,
    setPendingAction,
    pendingActionResolve,
    setPendingActionResolve,
    openUnsavedChangesDialog,
    handleUnsavedDialogSave,
    handleUnsavedDialogDiscard,
    handleUnsavedDialogCancel,

    // Multi Window Dialog
    showMultiWindowDialog,
    setShowMultiWindowDialog,
    pendingMultiWindowAction,
    setPendingMultiWindowAction,
    multiWindowActionCompleted,
    setMultiWindowActionCompleted,
    openMultiWindowDialog,
    handleMultiWindowOpenInNewWindow,
    handleMultiWindowReplaceCurrentDatabase,
    handleMultiWindowCancel,

    // KeePass Import Dialogs
    showKeePassImportDialog,
    setShowKeePassImportDialog,
    showKeePassSuccessDialog,
    setShowKeePassSuccessDialog,
    importStats,
    setImportStats,
    openKeePassImportDialog,
    handleKeePassImportDialogClose,
    handleKeePassImportSuccess,
    handleKeePassSuccessDialogClose,

    // Master Password Dialog
    showMasterPasswordDialog,
    setShowMasterPasswordDialog,
    pendingSaveResolve,
    setPendingSaveResolve,
    openMasterPasswordDialog,
    handleMasterPasswordConfirm,
    handleMasterPasswordCancel
  };
};