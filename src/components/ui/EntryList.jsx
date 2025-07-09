import React from 'react';
import { Edit, Trash2, Globe } from 'lucide-react';
import IconRenderer from './IconRenderer';
import DeleteConfirmDialog from '../dialogs/DeleteConfirmDialog';
import CopyButton from './CopyButton';

const EntryList = ({ entries, onEditEntry, onDeleteEntry, selectedFolderId, searchTerm }) => {
  const [showPasswords, setShowPasswords] = React.useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [entryToDelete, setEntryToDelete] = React.useState(null);
  
  // Funktion zum Öffnen von URLs im Standard-Browser
  const openInExternalBrowser = (url) => {
    try {
      // Prüfen, ob wir in einer Electron-Umgebung sind
      if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
        window.electronAPI.openExternal(url);
      } else {
        // Fallback für Nicht-Electron-Umgebungen (z.B. Dev-Modus, Tests)
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.warn('Fehler beim Öffnen der URL:', error);
      // Notfall-Fallback
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const togglePasswordVisibility = (entryId) => {
    setShowPasswords(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

  // Die copyToClipboard-Funktion wird durch die CopyButton-Komponente ersetzt
  const handleCopySuccess = (text, type) => {
    // Hier könnte in Zukunft Logging oder andere Aktionen durchgeführt werden
    console.log(`${type} copied to clipboard`);
  };


  if (entries.length === 0) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 theme-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 theme-text-secondary" />
            </div>
            <h3 className="text-lg font-medium theme-text mb-2">
              {searchTerm ? 'No entries found' : 'No entries yet'}
            </h3>
            <p className="theme-text-secondary">
              {searchTerm 
                ? `No entries match "${searchTerm}"`
                : 'Create your first password entry to get started'
              }
            </p>
          </div>
        </div>
        
        <DeleteConfirmDialog
          isOpen={deleteConfirmOpen}
          onDelete={() => {
            if (entryToDelete) {
              onDeleteEntry(entryToDelete.id);
            }
            setDeleteConfirmOpen(false);
            setEntryToDelete(null);
          }}
          onCancel={() => {
            setDeleteConfirmOpen(false);
            setEntryToDelete(null);
          }}
          title="Delete Entry"
          message="This action cannot be undone. Are you sure you want to delete this entry?"
          itemName={entryToDelete?.title}
          deleteButtonText="Delete Entry"
        />
      </>
    );
  }

  return (
    <>
      <div className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="entry-card theme-card rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 hover:shadow-md transition-all group cursor-pointer flex flex-col min-h-[280px] sm:min-h-[300px] md:min-h-[320px] lg:min-h-[340px]"
              onDoubleClick={() => onEditEntry(entry)}
            >
              {/* Header with icon, title and actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center min-w-0 flex-1 pl-0 -ml-1.5">
                  <div className="flex-shrink-0 w-8 h-8 theme-surface rounded-lg flex items-center justify-center">
                    <IconRenderer icon={entry.icon} className="w-5 h-5 theme-text-secondary" />
                  </div>
                  <h3 className="ml-1.5 text-sm font-semibold theme-text truncate">{entry.title}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditEntry(entry)}
                    className="p-1.5 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-md transition-colors"
                    title="Edit entry"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEntryToDelete(entry);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 theme-text-secondary hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* URL - always present but conditionally visible */}
              <div className="flex items-center gap-2 text-xs theme-text-secondary mb-3 min-h-[16px]">
                {entry.url ? (
                  <>
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    <button 
                      onClick={() => openInExternalBrowser(entry.url)} 
                      className="theme-primary hover:opacity-80 hover:underline truncate text-left"
                      title={entry.url}
                    >
                      {entry.url}
                    </button>
                  </>
                ) : (
                  <span className="opacity-50">No URL</span>
                )}
              </div>

            {/* Main content area - flex grow to fill available space */}
            <div className="flex-1 flex flex-col space-y-2 min-h-0">
              {/* Username field */}
              <div className="space-y-0.5">
                <label className="text-xs font-medium theme-text-secondary">Username</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={entry.username || ''}
                    readOnly
                    className="flex-1 px-2 py-1 theme-input rounded-md text-xs min-w-0"
                    placeholder="No username"
                  />
                  {entry.username && (
                    <CopyButton
                      textToCopy={entry.username}
                      label="Copy username"
                      size={3}
                      className="flex-shrink-0"
                      onCopied={(text) => handleCopySuccess(text, 'username')}
                    />
                  )}
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-0.5">
                <label className="text-xs font-medium theme-text-secondary">Password</label>
                <div className="flex items-center gap-1">
                  <input
                    type={showPasswords[entry.id] ? 'text' : 'password'}
                    value={entry.password || ''}
                    readOnly
                    className="flex-1 px-2 py-1 theme-input rounded-md text-xs min-w-0"
                    placeholder="No password"
                  />
                  {entry.password && (
                    <div className="flex gap-0.5 flex-shrink-0">
                      <CopyButton
                        textToCopy={entry.password}
                        label="Copy password"
                        size={3}
                        onCopied={(text) => handleCopySuccess(text, 'password')}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Notes section - responsive design */}
              <div className="flex flex-col min-h-0 flex-1 mt-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium theme-text-secondary flex-shrink-0">Notes</label>
                  {entry.notes && 
                    <span className="text-[10px] theme-text-tertiary">
                      {entry.notes.length > 100 ? `${entry.notes.length} chars` : ''}
                    </span>
                  }
                </div>
                <div className="overflow-y-auto smooth-scroll scrollbar-thin theme-input rounded-md p-2 flex-1 min-h-[60px] max-h-[120px] sm:max-h-[100px] md:max-h-[120px] lg:max-h-[140px]">
                  {entry.notes ? (
                    <p className="text-[11px] theme-text-secondary whitespace-pre-wrap leading-relaxed break-words" title={entry.notes}>
                      {entry.notes}
                    </p>
                  ) : (
                    <p className="text-[11px] theme-text-secondary opacity-50 italic flex items-center justify-center h-full">
                      No notes
                    </p>
                  )}
                </div>
              </div>
            </div>
            </div>
          ))}
        </div>
      </div>
      
      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        onDelete={() => {
          if (entryToDelete) {
            onDeleteEntry(entryToDelete.id);
          }
          setDeleteConfirmOpen(false);
          setEntryToDelete(null);
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setEntryToDelete(null);
        }}
        title="Delete Entry"
        message="This action cannot be undone. Are you sure you want to delete this entry?"
        itemName={entryToDelete?.title}
        deleteButtonText="Delete Entry"
      />
    </>
  );
};



export default EntryList;