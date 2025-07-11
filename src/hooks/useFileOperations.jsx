import { useState } from 'react';
import { encryptData, decryptData } from '../utils/crypto';

export const useFileOperations = () => {
  const [currentFile, setCurrentFile] = useState(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [pendingDatabaseData, setPendingDatabaseData] = useState(null);

  const loadDatabaseFile = async (filePath) => {
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.loadDatabaseFile(filePath);
        if (result.success) {
          setPendingDatabaseData(result);
          setCurrentFile(filePath);
          await window.electronAPI.setRecentDatabase(filePath);
          return result;
        }
        return result;
      } catch (error) {
        console.error('Error loading database file:', error);
        throw error;
      }
    }
    return { success: false, error: 'Electron API not available' };
  };

  const openDatabase = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.loadDatabase();
      if (result.success && !result.canceled) {
        setPendingDatabaseData(result);
        setCurrentFile(result.filePath);
        // Save as recent database
        await window.electronAPI.setRecentDatabase(result.filePath);
        return result;
      }
      return result;
    }
    return { success: false, error: 'Electron API not available' };
  };

  const saveDatabase = async (database, forceDialog = false, passwordToUse = null) => {
    const password = passwordToUse || masterPassword;
    
    if (window.electronAPI && password) {
      try {
        // Always use PBKDF2 encryption for all saves (automatic migration)
        // Legacy databases will be automatically upgraded to PBKDF2 on first save
        const shouldUseLegacy = false;
        const encryptedData = encryptData(JSON.stringify(database), password, shouldUseLegacy);
        
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
          return result;
        }
        return result;
      } catch (error) {
        console.error('Save error:', error);
        return { success: false, error: 'Failed to save database. Please try again.' };
      }
    }
    return { success: false, error: 'No password provided or Electron API not available' };
  };

  const decryptDatabase = (password) => {
    if (pendingDatabaseData) {
      try {
        const decryptResult = decryptData(pendingDatabaseData.data, password);
        const loadedDatabase = JSON.parse(decryptResult.data);
        setMasterPassword(password);
        
        // Update pending database data to include legacy flag
        setPendingDatabaseData({
          ...pendingDatabaseData,
          isLegacy: decryptResult.isLegacy
        });
        
        return { success: true, database: loadedDatabase };
      } catch (error) {
        console.error('Decryption error:', error);
        return { success: false, error: 'Invalid password' };
      }
    }
    return { success: false, error: 'No pending database data' };
  };

  const clearCurrentFile = () => {
    setCurrentFile(null);
    setMasterPassword('');
    setPendingDatabaseData(null);
  };

  const clearRecentDatabase = async () => {
    if (window.electronAPI) {
      await window.electronAPI.clearRecentDatabase();
    }
  };

  return {
    currentFile,
    setCurrentFile,
    masterPassword,
    setMasterPassword,
    pendingDatabaseData,
    setPendingDatabaseData,
    loadDatabaseFile,
    openDatabase,
    saveDatabase,
    decryptDatabase,
    clearCurrentFile,
    clearRecentDatabase
  };
};