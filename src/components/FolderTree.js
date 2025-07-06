import React, { useState } from 'react';
import { Folder, FolderOpen, FolderPlus, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import FolderNameDialog from './FolderNameDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const FolderTree = ({ folders, selectedFolder, onFolderSelect, onAddFolder, onRenameFolder, onDeleteFolder, entryCount }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folderDialogType, setFolderDialogType] = useState('create'); // 'create' or 'rename'
  const [pendingParentId, setPendingParentId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getFolderEntryCount = (folderPath) => {
    if (folderPath === '') return entryCount; // Root folder shows all entries
    // TODO: Implement actual counting based on folder path
    return 0;
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

  const handleFolderDialogConfirm = (folderName) => {
    if (folderDialogType === 'create' && pendingParentId) {
      onAddFolder(pendingParentId, folderName);
      setExpandedFolders(prev => new Set([...prev, pendingParentId])); // Expand parent
    } else if (folderDialogType === 'rename' && renamingFolder) {
      onRenameFolder(renamingFolder, folderName);
      setRenamingFolder(null);
    }
    setShowFolderDialog(false);
    setPendingParentId(null);
  };

  const handleFolderDialogCancel = () => {
    setShowFolderDialog(false);
    setPendingParentId(null);
    setRenamingFolder(null);
  };

  const handleRename = (folder) => {
    setRenamingFolder(folder.id);
    setRenameValue(folder.name);
    setFolderDialogType('rename');
    setShowFolderDialog(true);
    setShowContextMenu(null);
  };

  const handleRenameSubmit = (folderId) => {
    if (renameValue.trim() && renameValue.trim() !== '') {
      onRenameFolder(folderId, renameValue.trim());
    }
    setRenamingFolder(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingFolder(null);
    setRenameValue('');
  };

  const handleDelete = (folder) => {
    setShowContextMenu(null);
    setFolderToDelete(folder);
    setDeleteConfirmOpen(true);
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolder === folder.path;
    const hasChildren = folder.children && folder.children.length > 0;
    const folderEntryCount = getFolderEntryCount(folder.path);

    return (
      <div key={folder.id}>
        <div 
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors cursor-pointer group ${
            isSelected
              ? 'theme-surface theme-primary'
              : 'theme-text-secondary'
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onContextMenu={(e) => handleRightClick(e, folder)}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="p-0.5 hover:opacity-80 theme-button-secondary rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          <div 
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => onFolderSelect(folder.path)}
          >
            {isSelected || isExpanded ? (
              <FolderOpen className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 flex-shrink-0" />
            )}
            
            <span className="group-hover:font-bold truncate text-sm theme-text transition-all">{folder.name}</span>
            
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
        if (renamingFolder) {
          handleRenameCancel();
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [renamingFolder]);

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

  const currentFolder = getCurrentFolder();

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
                onClick={() => handleRename(currentFolder)}
              >
                Rename
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
        title={folderDialogType === 'create' ? 'Create Folder' : 'Rename Folder'}
        confirmText={folderDialogType === 'create' ? 'Create' : 'Rename'}
        initialValue={folderDialogType === 'rename' ? renameValue : ''}
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