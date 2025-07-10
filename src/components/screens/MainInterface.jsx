import React, { useState, useEffect } from 'react';
import Sidebar from '../ui/Sidebar';
import EntryList from '../ui/EntryList';
import EntryForm from '../dialogs/EntryForm';
import PasswordGenerator from '../dialogs/PasswordGenerator';
import Titlebar from '../ui/Titlebar';
import IconRenderer from '../ui/IconRenderer';
import { Search, Plus, Save, Key, X, ChevronDown, Folder, FolderOpen, PlusCircle } from 'lucide-react';

const MainInterface = ({ database, onAddEntry, onUpdateEntry, onDeleteEntry, onSave, onSaveAs, currentFile, hasUnsavedChanges, onClose, onCloseApp, onAddFolder, onRenameFolder, onDeleteFolder, onMoveFolder, onMoveEntry, onReorderEntries, onNewDatabase, onOpenDatabase }) => {
  const [selectedFolderId, setSelectedFolderId] = useState('root');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [folderDropdownOpen, setFolderDropdownOpen] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState(database.entries);
  const [openedFromSearch, setOpenedFromSearch] = useState(false);
  
  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default 256px (equivalent to w-64)
  const [isResizing, setIsResizing] = useState(false);
  
  // Load sidebar width from settings on mount
  useEffect(() => {
    const loadSidebarWidth = async () => {
      if (window.electronAPI) {
        try {
          const savedWidth = await window.electronAPI.getSetting('sidebarWidth', 256);
          setSidebarWidth(savedWidth);
        } catch (error) {
          console.error('Error loading sidebar width:', error);
        }
      }
    };
    loadSidebarWidth();
  }, []);

  // Save sidebar width when it changes
  const saveSidebarWidth = async (width) => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.setSetting('sidebarWidth', width);
      } catch (error) {
        console.error('Error saving sidebar width:', error);
      }
    }
  };

  // Handle sidebar resizing
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    const minWidth = 200;
    const maxWidth = 500;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      saveSidebarWidth(sidebarWidth);
    }
  };

  // Add global mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, sidebarWidth]);
  
  // Flache Liste aller Ordner erstellen (rekursiv)
  const getAllFolders = () => {
    const result = [];
    
    const extractFolders = (folders, level = 0) => {
      if (!folders) return;
      
      for (const folder of folders) {
        if (folder.path) {
          result.push({
            ...folder,
            level // Füge Level-Information für Einrückung hinzu
          });
        }
        
        if (folder.children && folder.children.length > 0) {
          extractFolders(folder.children, level + 1);
        }
      }
    };
    
    extractFolders(database.folders);
    return result;
  };

  // Finde den ausgewählten Ordner und sein Icon
  const getSelectedFolderIcon = () => {
    if (!selectedFolderId || selectedFolderId === 'root') return null;
    
    const allFolders = getAllFolders();
    const folder = allFolders.find(f => f.id === selectedFolderId);
    return folder?.icon || null;
  };

  // Finde den ausgewählten Ordner für Display
  const getSelectedFolderForDisplay = () => {
    if (!selectedFolderId || selectedFolderId === 'root') return null;
    
    const allFolders = getAllFolders();
    return allFolders.find(f => f.id === selectedFolderId);
  };

  // Helper function to get folder from ID (for backward compatibility)
  const getFolderFromId = (folderId) => {
    if (!folderId) return null;
    
    const allFolders = getAllFolders();
    return allFolders.find(f => f.id === folderId || f.path === folderId);
  };

  useEffect(() => {
    let filtered = database.entries;

    if (searchTerm) {
      // Global search - search across ALL entries, ignore folder selection
      filtered = filtered.filter(entry => {
        const entryFolder = getFolderFromId(entry.folderId || entry.folder);
        return (
          entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entryFolder && entryFolder.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    } else if (selectedFolderId !== 'root') {
      // Only filter by folder if NOT searching and not root
      filtered = filtered.filter(entry => (entry.folderId || entry.folder) === selectedFolderId);
    }

    setFilteredEntries(filtered);
  }, [database.entries, selectedFolderId, searchTerm]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onMenuAddEntry(() => {
        setIsFormOpen(true);
        setSelectedEntry(null);
      });

      window.electronAPI.onMenuGeneratePassword(() => {
        setIsGeneratorOpen(true);
      });

      return () => {
        window.electronAPI.removeAllListeners('menu-add-entry');
        window.electronAPI.removeAllListeners('menu-generate-password');
      };
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle Escape and Enter keys to close search overlay
      if ((e.key === 'Escape' || e.key === 'Enter') && isSearchOpen) {
        setIsSearchOpen(false);
        return;
      }

      // Don't handle shortcuts if focus is on input elements or if dialogs are open
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || 
          isFormOpen || isGeneratorOpen) {
        return;
      }

      // Handle keyboard shortcuts with Ctrl/Cmd
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              // Ctrl+Shift+S = Save As
              if (onSaveAs) {
                onSaveAs();
              }
            } else {
              // Ctrl+S = Save
              onSave();
            }
            break;
          case 'n':
            e.preventDefault();
            if (onNewDatabase) {
              onNewDatabase();
            }
            break;
          case 'o':
            e.preventDefault();
            if (onOpenDatabase) {
              onOpenDatabase();
            }
            break;
          case 'n':
            // Strg+Alt+Win+N für Add Entry
            if (e.ctrlKey && e.altKey && e.metaKey) {
              e.preventDefault();
              handleAddEntry();
            }
            break;
          case 'g':
            e.preventDefault();
            setIsGeneratorOpen(true);
            break;
          case 'f':
            e.preventDefault();
            setIsSearchOpen(true);
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isFormOpen, isGeneratorOpen, onSave, onSaveAs, onNewDatabase, onOpenDatabase]);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Schließe Dropdowns nur, wenn nicht auf sie geklickt wurde
      if (!e.target.closest('.folder-dropdown') && !e.target.closest('.folder-dropdown-toggle')) {
        setFolderDropdownOpen(false);
      }
      // Schließe Password Generator nur wenn nicht auf ihn geklickt wurde
      if (!e.target.closest('.password-generator-modal') && !e.target.closest('.password-generator-button')) {
        setIsGeneratorOpen(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleAddEntry = () => {
    setSelectedEntry(null);
    setIsFormOpen(true);
  };

  const handleEditEntry = (entry, fromSearch = false) => {
    setSelectedEntry(entry);
    setIsFormOpen(true);
    // Set openedFromSearch flag based on the source
    setOpenedFromSearch(fromSearch);
  };

  const handleFormSubmit = (entryData) => {
    if (selectedEntry) {
      onUpdateEntry(selectedEntry.id, entryData);
    } else {
      onAddEntry(entryData);
    }
    setIsFormOpen(false);
    setSelectedEntry(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedEntry(null);
    
    // If opened from search, go back to search
    if (openedFromSearch) {
      setIsSearchOpen(true);
      setOpenedFromSearch(false);
    }
  };

  return (
    <div className="flex flex-col h-screen theme-bg overflow-hidden">
      <Titlebar 
        title={currentFile ? currentFile.split('/').pop() : 'New Database'}
        showMenus={true}
        onNewDatabase={onNewDatabase}
        onOpenDatabase={onOpenDatabase}
        onSaveDatabase={onSave}
        onSaveAsDatabase={onSaveAs}
        onAddEntry={handleAddEntry}
        onGeneratePassword={() => setIsGeneratorOpen(true)}
        onClose={onCloseApp}
        hasUnsavedChanges={hasUnsavedChanges}
        currentFile={currentFile}
      />
      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - resizable */}
      <div 
        className="block flex-shrink-0 relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        <div className="h-full smooth-scroll scrollbar-cool">
          <Sidebar
            folders={database.folders}
            selectedFolderId={selectedFolderId}
            onFolderSelect={setSelectedFolderId}
            onAddFolder={onAddFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onMoveFolder={onMoveFolder}
            onMoveEntry={onMoveEntry}
            entries={database.entries}
          />
        </div>
        
        {/* Resize handle */}
        <div 
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize transition-colors ${
            isResizing 
              ? 'bg-blue-500 bg-opacity-70' 
              : 'bg-transparent hover:bg-gray-300 hover:bg-opacity-50'
          }`}
          onMouseDown={handleMouseDown}
          title="Drag to resize sidebar"
        >
          <div className={`absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-8 rounded-l transition-colors ${
            isResizing 
              ? 'bg-blue-500' 
              : 'bg-gray-400 opacity-30'
          }`}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - fixed height to match sidebar */}
        <header className="header-height theme-surface shadow-sm theme-border border-b px-3 sm:px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center justify-between gap-1 sm:gap-2 lg:gap-4 w-full">
            {/* Left side - Title */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold theme-text truncate">
                {searchTerm ? (
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{searchTerm}</span>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 p-1 hover:opacity-80 theme-button-secondary rounded transition-colors"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {selectedFolderId && selectedFolderId !== 'root' ? (
                      <>
                        {getSelectedFolderIcon() ? (
                          <IconRenderer 
                            icon={getSelectedFolderIcon()} 
                            className="w-4 h-4 sm:w-5 sm:h-5" 
                          />
                        ) : (
                          <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                        <span>{getSelectedFolderForDisplay()?.name}</span>
                      </>
                    ) : (
                      <>
                        {currentFile ? currentFile.replace(/^.*[\\\/]/, '') : 'New Database'}
                      </>
                    )}
                    {hasUnsavedChanges && <span className="text-orange-500 ml-1 lg:ml-2">•</span>}
                  </span>
                )}
              </h1>
            </div>

            {/* Right side - Action buttons (responsive sizing) */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button 
                className="p-2 sm:p-3 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-lg transition-colors"
                onClick={() => setIsSearchOpen(true)}
                title="Search entries"
              >
                <Search className="w-4 h-4 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={handleAddEntry}
                className="p-2 sm:p-3 theme-button rounded-lg"
                title="Add new entry"
              >
                <PlusCircle className="w-4 h-4 sm:w-4 sm:h-4" />
              </button>
              
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="p-2 sm:p-3 theme-button rounded-lg transition-colors password-generator-button"
                title="Generate password"
              >
                <Key className="w-4 h-4 sm:w-4 sm:h-4" />
              </button>
              
              <button
                onClick={() => {
                  onSave();
                }}
                className={`p-2 sm:p-3 rounded-lg transition-colors ${
                  hasUnsavedChanges 
                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                    : 'theme-button'
                }`}
                title={hasUnsavedChanges ? 'Save changes' : 'Save database'}
              >
                <Save className="w-4 h-4 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Mobile sidebar toggle removed - sidebar is always visible */}
        </header>

        {/* Main content area - scrollable with cool custom scrollbar */}
        <main className="flex-1 overflow-auto smooth-scroll scrollbar-cool">
          <EntryList
            entries={filteredEntries}
            onEditEntry={handleEditEntry}
            onDeleteEntry={onDeleteEntry}
            onReorderEntries={onReorderEntries}
            selectedFolderId={selectedFolderId}
            searchTerm={searchTerm}
          />
        </main>
      </div>

      {isFormOpen && (
        <EntryForm
          entry={selectedEntry}
          folders={database.folders}
          currentFolderId={selectedFolderId} 
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}

      {isGeneratorOpen && (
        <PasswordGenerator
          onClose={() => setIsGeneratorOpen(false)}
        />
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50">
          <div className="theme-surface rounded-xl shadow-2xl w-full max-w-2xl mt-20 animate-slide-down">
            <div className="flex items-center p-6 theme-border border-b">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 theme-text-secondary" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="theme-input pl-10 pr-4 py-3 rounded-lg w-full text-lg"
                  autoFocus
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="ml-4 p-2 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Quick search results preview with custom scrollbar */}
            {searchTerm && (
              <div className="p-6 max-h-96 overflow-auto smooth-scroll scrollbar-cool">
                <h3 className="text-sm font-medium theme-text mb-3">
                  Search Results ({filteredEntries.length})
                </h3>
                {filteredEntries.length > 0 ? (
                  <div className="space-y-2">
                    {filteredEntries.slice(0, 5).map(entry => (
                      <div
                        key={entry.id}
                        className="flex items-center space-x-3 p-3 hover:opacity-80 theme-button-secondary rounded-lg cursor-pointer"
                        onClick={() => {
                          setOpenedFromSearch(true);
                          setIsSearchOpen(false); // Close search when opening entry
                          handleEditEntry(entry);
                        }}
                      >
                        <div className="w-10 h-10 theme-surface rounded-lg flex items-center justify-center">
                          <IconRenderer icon={entry.icon} className="w-5 h-5 theme-text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium theme-text truncate">{entry.title}</p>
                          <p className="text-sm theme-text-secondary truncate">{entry.username}</p>
                        </div>
                        <span className="text-xs theme-text-secondary theme-surface px-2 py-1 rounded-full">
                          {entry.folder}
                        </span>
                      </div>
                    ))}
                    {filteredEntries.length > 5 && (
                      <p className="text-center text-sm theme-text-secondary py-2">
                        and {filteredEntries.length - 5} more results...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center theme-text-secondary py-8">
                    No entries found for "{searchTerm}"
                  </p>
                )}
              </div>
            )}
            
            {!searchTerm && (
              <div className="p-6 text-center theme-text-secondary">
                <Search className="w-12 h-12 mx-auto mb-3 theme-text-secondary" />
                <p>Start typing to search your password entries...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default MainInterface;