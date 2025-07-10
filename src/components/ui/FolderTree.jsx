import React, { useState, useMemo } from 'react';
import { Folder, FolderOpen, FolderPlus, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import FolderNameDialog from '../dialogs/FolderNameDialog';
import DeleteConfirmDialog from '../dialogs/DeleteConfirmDialog';
import IconRenderer from './IconRenderer';

const FolderTree = ({ folders, selectedFolderId, onFolderSelect, onAddFolder, onEditFolder, onRenameFolder, onDeleteFolder, onMoveFolder, onMoveEntry, entries }) => {
  // For backward compatibility, use onRenameFolder if onEditFolder is not provided
  const handleEditFolder = onEditFolder || onRenameFolder;
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [editingFolder, setEditingFolder] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folderDialogType, setFolderDialogType] = useState('create'); // 'create' or 'edit'
  const [pendingParentId, setPendingParentId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [draggedFolder, setDraggedFolder] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'into', 'above', 'below'
  const [draggedEntry, setDraggedEntry] = useState(null);

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Helper function to find folder by ID in the folder tree
  const findFolderById = (folderList, targetId) => {
    for (const folder of folderList) {
      if (folder.id === targetId) return folder;
      if (folder.children) {
        const found = findFolderById(folder.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  // Memoize entry counts for performance with large databases - optimized
  const entryCountCache = useMemo(() => {
    const cache = new Map();
    
    if (!entries || entries.length === 0) return cache;
    
    // Build entry lookup by folder for O(1) access
    const entryFolderMap = new Map();
    entries.forEach(entry => {
      const folderId = entry.folderId || entry.folder;
      if (!entryFolderMap.has(folderId)) {
        entryFolderMap.set(folderId, []);
      }
      entryFolderMap.get(folderId).push(entry);
    });

    // Build folder path lookup for legacy entries
    const folderPathMap = new Map();
    const buildPathMap = (folderList) => {
      folderList.forEach(folder => {
        folderPathMap.set(folder.path, folder.id);
        if (folder.children) {
          buildPathMap(folder.children);
        }
      });
    };
    buildPathMap(folders);
    
    // Calculate counts efficiently
    const calculateCounts = (folderList) => {
      folderList.forEach(folder => {
        if (folder.id === 'root') {
          cache.set(folder.id, 0);
        } else {
          let count = 0;
          
          // Direct ID match entries
          const directEntries = entryFolderMap.get(folder.id) || [];
          count += directEntries.length;
          
          // Legacy path-based entries
          const pathEntries = entryFolderMap.get(folder.path) || [];
          count += pathEntries.length;
          
          // Add children counts recursively
          if (folder.children) {
            folder.children.forEach(child => {
              calculateCounts([child]); // Calculate child first
              count += cache.get(child.id) || 0;
            });
          }
          
          cache.set(folder.id, count);
        }
      });
    };
    
    calculateCounts(folders);
    return cache;
  }, [entries, folders]);

  // Fast lookup function
  const getFolderEntryCount = (folder) => {
    return entryCountCache.get(folder.id) || 0;
  };

  // Check if targetFolder is a descendant (child/grandchild/etc.) of sourceFolder
  const isDescendantOf = (sourceFolder, targetFolderId, folderList) => {
    if (!sourceFolder || !sourceFolder.children) return false;
    
    const checkChildren = (children) => {
      for (const child of children) {
        if (child.id === targetFolderId) {
          return true; // Found target in children
        }
        if (child.children && checkChildren(child.children)) {
          return true; // Found in grandchildren
        }
      }
      return false;
    };
    
    return checkChildren(sourceFolder.children);
  };

  // Check if a folder drop is valid (prevent dropping into own descendants)
  const isValidFolderDrop = (draggedFolderId, targetFolderId, position) => {
    if (!draggedFolder || draggedFolderId === targetFolderId) {
      return false; // Can't drop on self
    }
    
    // Prevent dropping above/below the root folder
    if (targetFolderId === 'root' && (position === 'above' || position === 'below')) {
      return false; // Can't move folders outside the root hierarchy
    }
    
    if (position === 'into') {
      // Can't drop into own descendants
      return !isDescendantOf(draggedFolder, targetFolderId, folders);
    }
    
    return true; // Other above/below positions are valid
  };

  const handleRightClick = (e, folder) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(folder.id);
  };

  const handleAddSubfolder = (parentId) => {
    setPendingParentId(parentId);
    setFolderDialogType('create');
    setShowFolderDialog(true);
    setShowContextMenu(null);
  };

  const handleFolderDialogConfirm = (folderName, folderIcon) => {
    if (folderDialogType === 'create' && pendingParentId) {
      onAddFolder(pendingParentId, folderName, folderIcon);
      setExpandedFolders(prev => new Set([...prev, pendingParentId])); // Expand parent
    } else if (folderDialogType === 'edit' && editingFolder) {
      handleEditFolder(editingFolder, folderName, folderIcon);
      setEditingFolder(null);
    }
    setShowFolderDialog(false);
    setPendingParentId(null);
  };

  const handleFolderDialogCancel = () => {
    setShowFolderDialog(false);
    setPendingParentId(null);
    setEditingFolder(null);
  };

  const handleEdit = (folder) => {
    setEditingFolder(folder.id);
    setEditValue(folder.name);
    setFolderDialogType('edit');
    setShowFolderDialog(true);
    setShowContextMenu(null);
  };

  const handleEditSubmit = (folderId) => {
    if (editValue.trim() && editValue.trim() !== '') {
      handleEditFolder(folderId, editValue.trim());
    }
    setEditingFolder(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingFolder(null);
    setEditValue('');
  };

  const handleDelete = (folder) => {
    setShowContextMenu(null);
    setFolderToDelete(folder);
    setDeleteConfirmOpen(true);
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;
    const folderEntryCount = getFolderEntryCount(folder);

    return (
      <div key={folder.id} className="relative">
        {/* Drop indicator for above position */}
        {dragOverFolder === folder.id && dropPosition === 'above' && !draggedEntry && (
          <div 
            className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full z-10"
            style={{ left: `${8 + level * 16}px` }}
          />
        )}
        
        <div 
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors group relative ${
            folder.id === 'root' ? 'cursor-default' : 'cursor-pointer'
          } ${
            isSelected
              ? 'theme-surface theme-primary'
              : 'theme-text-secondary'
          } ${
            dragOverFolder === folder.id ? (
              draggedEntry ? 
                'theme-button-hover border-2 border-green-400 border-dashed' :
              dropPosition === 'into' 
                ? 'theme-button-hover border-2 border-blue-400 border-dashed' 
                : 'theme-button-hover'
            ) : ''
          } ${
            draggedFolder && !isValidFolderDrop(draggedFolder.id, folder.id, dropPosition) && dragOverFolder === folder.id ?
              'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onContextMenu={(e) => handleRightClick(e, folder)}
          draggable={folder.id !== 'root'} // Root folder cannot be dragged
          onDragStart={(e) => {
            if (folder.id === 'root') {
              e.preventDefault();
              return;
            }
            setDraggedFolder(folder);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={() => {
            setDraggedFolder(null);
            setDragOverFolder(null);
            setDropPosition(null);
            setDraggedEntry(null);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            
            // Check if it's a dragged entry
            const dragData = e.dataTransfer.getData('text/plain');
            let isEntryDrag = false;
            try {
              const data = JSON.parse(dragData);
              if (data.type === 'entry') {
                isEntryDrag = true;
                setDraggedEntry(data);
              }
            } catch (error) {
              // Not JSON data, ignore
            }
            
            if ((draggedFolder && draggedFolder.id !== folder.id) || isEntryDrag) {
              if (isEntryDrag) {
                // Entries can always be dropped into folders
                e.dataTransfer.dropEffect = 'move';
                setDragOverFolder(folder.id);
                setDropPosition('into');
              } else {
                // For folders, calculate drop position and validate
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseY = e.clientY - rect.top;
                const elementHeight = rect.height;
                const relativeY = mouseY / elementHeight;
                
                // Use hysteresis to prevent jumping between positions
                let newPosition = dropPosition;
                
                if (relativeY < 0.2) {
                  newPosition = 'above';
                } else if (relativeY > 0.8) {
                  newPosition = 'below';
                } else if (relativeY >= 0.3 && relativeY <= 0.7) {
                  newPosition = 'into';
                }
                
                // Validate the drop before allowing it
                if (isValidFolderDrop(draggedFolder.id, folder.id, newPosition)) {
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverFolder(folder.id);
                  setDropPosition(newPosition);
                } else {
                  e.dataTransfer.dropEffect = 'none';
                  setDragOverFolder(null);
                  setDropPosition(null);
                }
              }
            }
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setDragOverFolder(null);
              setDropPosition(null);
              setDraggedEntry(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            
            // Check if it's an entry being dropped
            const dragData = e.dataTransfer.getData('text/plain');
            try {
              const data = JSON.parse(dragData);
              if (data.type === 'entry' && onMoveEntry) {
                onMoveEntry(data.entryId, folder.id);
              }
            } catch (error) {
              // Handle folder drops with validation
              if (draggedFolder && draggedFolder.id !== folder.id && onMoveFolder) {
                // Double-check validation before executing move
                if (isValidFolderDrop(draggedFolder.id, folder.id, dropPosition)) {
                  if (dropPosition === 'into') {
                    onMoveFolder(draggedFolder.id, folder.id, 'into');
                  } else if (dropPosition === 'above') {
                    onMoveFolder(draggedFolder.id, folder.id, 'above');
                  } else if (dropPosition === 'below') {
                    onMoveFolder(draggedFolder.id, folder.id, 'below');
                  }
                }
              }
            }
            
            setDragOverFolder(null);
            setDropPosition(null);
            setDraggedEntry(null);
          }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="flex items-center justify-center w-4 h-4 hover:opacity-80 theme-button-secondary rounded transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4 flex-shrink-0" />
          )}

          <div 
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => onFolderSelect(folder.id)}
            onDoubleClick={() => {
              if (hasChildren) {
                toggleFolder(folder.id);
              }
            }}
          >
            {folder.icon ? (
              <IconRenderer icon={folder.icon} className="w-4 h-4 flex-shrink-0" />
            ) : (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 flex-shrink-0" />
              ) : (
                <Folder className="w-4 h-4 flex-shrink-0" />
              )
            )}
            
            <span className={`truncate text-sm theme-text transition-all ${isSelected ? 'font-bold' : 'group-hover:font-bold'}`}>{folder.name}</span>
            
            {folderEntryCount > 0 && (
              <span className="ml-auto text-xs theme-surface theme-text-secondary px-1.5 py-0.5 rounded-full flex-shrink-0">
                {folderEntryCount}
              </span>
            )}
          </div>

          <button
            className="p-1 opacity-0 group-hover:opacity-100 hover:opacity-80 theme-button-secondary rounded transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setContextMenuPosition({ x: e.clientX, y: e.clientY });
              setShowContextMenu(showContextMenu === folder.id ? null : folder.id);
            }}
            title="Folder options"
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>
        
        {/* Drop indicator for below position */}
        {dragOverFolder === folder.id && dropPosition === 'below' && !draggedEntry && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full z-10"
            style={{ left: `${8 + level * 16}px` }}
          />
        )}

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div>
            {folder.children.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Close context menu when clicking outside or pressing Escape
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(null);
    };
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowContextMenu(null);
        if (editingFolder) {
          handleEditCancel();
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingFolder]);

  // Get current folder for context menu
  const getCurrentFolder = () => {
    const findFolder = (folderList, id) => {
      for (const folder of folderList) {
        if (folder.id === id) return folder;
        if (folder.children) {
          const found = findFolder(folder.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    return showContextMenu ? findFolder(folders, showContextMenu) : null;
  };

  const getEditingFolder = () => {
    const findFolder = (folderList, id) => {
      for (const folder of folderList) {
        if (folder.id === id) return folder;
        if (folder.children) {
          const found = findFolder(folder.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    return editingFolder ? findFolder(folders, editingFolder) : null;
  };

  const currentFolder = getCurrentFolder();
  const editingFolderObject = getEditingFolder();

  return (
    <div className="relative">
      {folders.map(folder => renderFolder(folder))}
      
      {/* Context Menu - rendered at the top level */}
      {showContextMenu && currentFolder && (
        <div 
          className="fixed theme-surface rounded-lg shadow-lg theme-border border py-1 min-w-40"
          style={{ 
            left: Math.min(contextMenuPosition.x, window.innerWidth - 160), 
            top: Math.min(contextMenuPosition.y, window.innerHeight - 120),
            transform: 'translate(0, 0)'
          }}
        >
          <button
            className="w-full px-3 py-1.5 text-left text-sm theme-text hover:opacity-80 flex items-center gap-2"
            onClick={() => handleAddSubfolder(currentFolder.id)}
          >
            <FolderPlus className="w-3 h-3" />
            Add Subfolder
          </button>
          {currentFolder.id !== 'root' && (
            <>
              <button
                className="w-full px-3 py-1.5 text-left text-sm theme-text hover:opacity-80"
                onClick={() => handleEdit(currentFolder)}
              >
                Edit
              </button>
              <button
                className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:opacity-80"
                onClick={() => handleDelete(currentFolder)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
      
      <FolderNameDialog
        isOpen={showFolderDialog}
        onConfirm={handleFolderDialogConfirm}
        onCancel={handleFolderDialogCancel}
        title={folderDialogType === 'create' ? 'Create Folder' : 'Edit Folder'}
        confirmText={folderDialogType === 'create' ? 'Create' : 'Update'}
        initialValue={folderDialogType === 'edit' ? editValue : ''}
        initialIcon={folderDialogType === 'edit' && editingFolderObject ? editingFolderObject.icon : null}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onDelete={() => {
          if (folderToDelete) {
            onDeleteFolder(folderToDelete.id);
          }
          setDeleteConfirmOpen(false);
          setFolderToDelete(null);
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setFolderToDelete(null);
        }}
        title="Delete Folder"
        message="This will delete the folder and all its contents. This action cannot be undone."
        itemName={folderToDelete?.name}
        deleteButtonText="Delete Folder"
      />
    </div>
  );
};

export default FolderTree;