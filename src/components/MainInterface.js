import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import EntryList from './EntryList';
import EntryForm from './EntryForm';
import PasswordGenerator from './PasswordGenerator';
import Titlebar from './Titlebar';
import IconRenderer from './IconRenderer';
import { Search, Plus, Save, Key, X, ChevronDown, Folder, FolderClosed } from 'lucide-react';

const MainInterface = ({ database, onAddEntry, onUpdateEntry, onDeleteEntry, onSave, onSaveAs, currentFile, hasUnsavedChanges, onClose, onCloseApp, onAddFolder, onRenameFolder, onDeleteFolder, onNewDatabase, onOpenDatabase }) => {
  const [selectedFolder, setSelectedFolder] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [folderDropdownOpen, setFolderDropdownOpen] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState(database.entries);
  
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

  useEffect(() => {
    let filtered = database.entries;

    if (selectedFolder !== '') {
      filtered = filtered.filter(entry => entry.folder === selectedFolder);
    }

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEntries(filtered);
  }, [database.entries, selectedFolder, searchTerm]);

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
      // Handle Escape key to close search overlay
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
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
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, onSave, onSaveAs, onNewDatabase, onOpenDatabase]);

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

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setIsFormOpen(true);
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
      {/* Sidebar - always visible */}
      <div className="block w-64 xl:w-72 flex-shrink-0">
        <div className="h-full smooth-scroll scrollbar-cool">
          <Sidebar
            folders={database.folders}
            selectedFolder={selectedFolder}
            onFolderSelect={setSelectedFolder}
            onAddFolder={onAddFolder}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            entryCount={database.entries.length}
          />
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
                {currentFile ? currentFile.replace(/^.*[\\\/]/, '') : 'New Database'}
                {hasUnsavedChanges && <span className="text-orange-500 ml-1 lg:ml-2">•</span>}
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
                <Plus className="w-4 h-4 sm:w-4 sm:h-4" />
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
            selectedFolder={selectedFolder}
            searchTerm={searchTerm}
          />
        </main>
      </div>

      {isFormOpen && (
        <EntryForm
          entry={selectedEntry}
          folders={database.folders}
          currentFolder={selectedFolder} 
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
                          setIsSearchOpen(false);
                          // Could scroll to entry or open it
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