import React, { useState } from 'react';
import { Hash, FolderPlus } from 'lucide-react';
import FolderTree from './FolderTree';
import FolderNameDialog from './FolderNameDialog';

const Sidebar = ({ folders, selectedFolder, onFolderSelect, onAddFolder, onRenameFolder, onDeleteFolder, entryCount }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showFolderDialog, setShowFolderDialog] = useState(false);

  const handleRightClick = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleAddRootFolder = () => {
    setShowFolderDialog(true);
    setShowContextMenu(false);
  };

  const handleFolderDialogConfirm = (folderName) => {
    onAddFolder('root', folderName);
    setShowFolderDialog(false);
  };

  const handleFolderDialogCancel = () => {
    setShowFolderDialog(false);
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="w-full h-full theme-surface shadow-lg theme-border border-r flex flex-col overflow-hidden">
      <div className="header-height px-3 sm:px-4 lg:px-6 theme-border border-b flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-base lg:text-lg font-semibold theme-text">Folders</h2>
          <button
            onClick={handleAddRootFolder}
            className="p-1.5 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-lg transition-colors"
            title="Add new folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        className="flex-1 overflow-auto p-3 lg:p-4 smooth-scroll scrollbar-cool"
        onContextMenu={handleRightClick}
      >
        <FolderTree
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={onFolderSelect}
          onAddFolder={onAddFolder}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
          entryCount={entryCount}
        />
      </div>

      {/* Sidebar Context Menu */}
      {showContextMenu && (
        <div 
          className="fixed theme-surface rounded-lg shadow-lg theme-border border py-1 min-w-40"
          style={{ 
            left: Math.min(contextMenuPosition.x, window.innerWidth - 160), 
            top: Math.min(contextMenuPosition.y, window.innerHeight - 50),
            transform: 'translate(0, 0)'
          }}
        >
          <button
            className="w-full px-3 py-1.5 text-left text-sm theme-text hover:opacity-80 flex items-center gap-2"
            onClick={handleAddRootFolder}
          >
            <FolderPlus className="w-3 h-3" />
            Add New Folder
          </button>
        </div>
      )}

      {/* Folder Name Dialog */}
      <FolderNameDialog
        isOpen={showFolderDialog}
        title="Create New Folder"
        onConfirm={handleFolderDialogConfirm}
        onCancel={handleFolderDialogCancel}
      />

      <div className="p-3 lg:p-6 theme-border border-t">
        <div className="theme-card rounded-lg p-3 lg:p-4">
          <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
            <Hash className="w-4 h-4 lg:w-5 lg:h-5 theme-primary flex-shrink-0" />
            <span className="font-medium theme-text text-sm lg:text-base">Statistics</span>
          </div>
          <div className="space-y-1.5 lg:space-y-2 text-xs lg:text-sm">
            <div className="flex justify-between items-center">
              <span className="theme-text-secondary">Total Entries:</span>
              <span className="font-medium theme-primary">{entryCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="theme-text-secondary">Folders:</span>
              <span className="font-medium theme-primary">{folders[0]?.children?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;