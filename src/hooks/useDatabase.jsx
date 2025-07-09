import { useState, useEffect } from 'react';

export const useDatabase = () => {
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

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedDatabase, setLastSavedDatabase] = useState(null);

  // Check if database is in default state (no real changes)
  const isDefaultDatabase = (db) => {
    return db.entries.length === 0 && 
           db.folders.length === 1 && 
           db.folders[0].id === 'root' && 
           db.folders[0].children.length === 1 && 
           db.folders[0].children[0].id === 'general' &&
           db.folders[0].children[0].icon === null;
  };

  // Track unsaved changes
  useEffect(() => {
    if (lastSavedDatabase) {
      const hasChanges = JSON.stringify(database) !== JSON.stringify(lastSavedDatabase);
      setHasUnsavedChanges(hasChanges);
    } else if (!isDefaultDatabase(database)) {
      // If no saved state but we have data (e.g., after import), mark as unsaved
      setHasUnsavedChanges(true);
    } else {
      // Default database should not be considered as having unsaved changes
      setHasUnsavedChanges(false);
    }
  }, [database, lastSavedDatabase]);

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

  const resetDatabase = () => {
    setDatabase({
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
    setLastSavedDatabase(null);
    setHasUnsavedChanges(false);
  };

  const loadDatabase = (databaseData) => {
    setDatabase(databaseData);
    setLastSavedDatabase(databaseData);
    setHasUnsavedChanges(false);
  };

  const createNewDatabase = (password) => {
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
    setHasUnsavedChanges(false); // Will be set to true by useEffect due to lastSavedDatabase being null
  };

  const markAsSaved = (savedDatabase) => {
    setLastSavedDatabase(JSON.parse(JSON.stringify(savedDatabase))); // Deep copy
    setHasUnsavedChanges(false);
  };

  return {
    database,
    setDatabase,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    lastSavedDatabase,
    setLastSavedDatabase,
    isDefaultDatabase,
    addEntry,
    updateEntry,
    deleteEntry,
    findFolderById,
    addFolder,
    renameFolder,
    deleteFolder,
    resetDatabase,
    loadDatabase,
    createNewDatabase,
    markAsSaved
  };
};