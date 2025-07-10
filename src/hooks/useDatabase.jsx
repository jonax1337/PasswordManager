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

  const moveFolder = (folderId, targetFolderId, position = 'into') => {
    console.log('moveFolder called:', { folderId, targetFolderId, position });
    
    setDatabase(prev => {
      console.log('Current database folders:', JSON.stringify(prev.folders, null, 2));
      // Find and remove the folder from its current location
      let folderToMove = null;
      let targetFolder = null;
      let targetParent = null;
      let targetIndex = -1;
      
      const removeFolderFromTree = (folders) => {
        console.log('Searching in folders:', folders.map(f => ({ id: f.id, name: f.name })));
        
        const result = [];
        for (const folder of folders) {
          console.log('Checking folder:', { id: folder.id, name: folder.name, searchingFor: folderId });
          
          if (folder.id === folderId) {
            console.log('FOUND! Folder to move:', folder);
            folderToMove = { ...folder };
            // Don't add to result - this removes it
          } else {
            const updatedFolder = { ...folder };
            if (folder.children && folder.children.length > 0) {
              updatedFolder.children = removeFolderFromTree(folder.children);
            }
            result.push(updatedFolder);
          }
        }
        
        console.log('Result after processing:', result.map(f => ({ id: f.id, name: f.name })));
        return result;
      };
      
      // Find target folder and its parent
      const findTargetInfo = (folders, parent = null) => {
        for (let i = 0; i < folders.length; i++) {
          const folder = folders[i];
          if (folder.id === targetFolderId) {
            targetFolder = folder;
            targetParent = parent;
            targetIndex = i;
            return true;
          }
          if (folder.children && findTargetInfo(folder.children, folder)) {
            return true;
          }
        }
        return false;
      };
      
      // Update paths recursively
      const updatePaths = (folderObj, newBasePath) => {
        const newPath = newBasePath ? `${newBasePath}/${folderObj.name}` : folderObj.name;
        const updatedFolder = { ...folderObj, path: newPath };
        if (updatedFolder.children) {
          updatedFolder.children = updatedFolder.children.map(child => updatePaths(child, newPath));
        }
        return updatedFolder;
      };
      
      // Add folder to new location based on position
      const addFolderToTree = (folders) => {
        return folders.map(folder => {
          if (position === 'into' && folder.id === targetFolderId) {
            // Move INTO the target folder
            const updatedFolder = updatePaths(folderToMove, folder.path);
            return {
              ...folder,
              children: [...(folder.children || []), updatedFolder]
            };
          } else if (position === 'above' && targetParent && folder.id === targetParent.id) {
            // Move ABOVE the target folder (same parent)
            const updatedFolder = updatePaths(folderToMove, folder.path);
            const newChildren = [...(folder.children || [])];
            newChildren.splice(targetIndex, 0, updatedFolder);
            return {
              ...folder,
              children: newChildren
            };
          } else if (position === 'below' && targetParent && folder.id === targetParent.id) {
            // Move BELOW the target folder (same parent)
            const updatedFolder = updatePaths(folderToMove, folder.path);
            const newChildren = [...(folder.children || [])];
            newChildren.splice(targetIndex + 1, 0, updatedFolder);
            return {
              ...folder,
              children: newChildren
            };
          }
          
          if (folder.children) {
            return {
              ...folder,
              children: addFolderToTree(folder.children)
            };
          }
          
          return folder;
        });
      };
      
      // Handle root-level reordering
      const addToRoot = (folders) => {
        if (position === 'above' && !targetParent) {
          const updatedFolder = updatePaths(folderToMove, '');
          const newFolders = [...folders];
          newFolders.splice(targetIndex, 0, updatedFolder);
          return newFolders;
        } else if (position === 'below' && !targetParent) {
          const updatedFolder = updatePaths(folderToMove, '');
          const newFolders = [...folders];
          newFolders.splice(targetIndex + 1, 0, updatedFolder);
          return newFolders;
        }
        return addFolderToTree(folders);
      };
      
      // Start the search from the root's children, not from the root array
      console.log('Starting removal process...');
      const rootFolder = prev.folders[0];
      console.log('Root folder:', rootFolder);
      console.log('Root folder children:', rootFolder.children);
      
      const updatedRootChildren = removeFolderFromTree(rootFolder.children);
      console.log('Updated root children after removal:', updatedRootChildren);
      
      const foldersWithoutMoved = [{
        ...rootFolder,
        children: updatedRootChildren
      }];
      console.log('Folders after removal:', foldersWithoutMoved);
      
      if (!folderToMove) {
        console.log('ERROR: Folder to move not found after removal process:', folderId);
        return prev;
      }
      
      console.log('Found folder to move:', folderToMove);
      
      findTargetInfo(foldersWithoutMoved);
      console.log('Target info found:', { targetFolder, targetParent, targetIndex });
      
      let foldersWithMoved;
      if ((position === 'above' || position === 'below') && !targetParent) {
        // Handle root level reordering
        const rootFolders = foldersWithoutMoved[0]?.children || [];
        const targetIdx = rootFolders.findIndex(f => f.id === targetFolderId);
        if (targetIdx !== -1) {
          const updatedFolder = updatePaths(folderToMove, '');
          const newChildren = [...rootFolders];
          const insertIndex = position === 'above' ? targetIdx : targetIdx + 1;
          newChildren.splice(insertIndex, 0, updatedFolder);
          foldersWithMoved = [{
            ...foldersWithoutMoved[0],
            children: newChildren
          }];
        } else {
          foldersWithMoved = addToRoot(foldersWithoutMoved);
        }
      } else {
        foldersWithMoved = addToRoot(foldersWithoutMoved);
      }
      
      console.log('Final folders structure:', foldersWithMoved);
      
      return {
        ...prev,
        folders: foldersWithMoved
      };
    });
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
    moveFolder,
    resetDatabase,
    loadDatabase,
    createNewDatabase,
    markAsSaved
  };
};