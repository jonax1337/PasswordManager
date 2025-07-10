import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Globe } from 'lucide-react';
import IconRenderer from './IconRenderer';
import DeleteConfirmDialog from '../dialogs/DeleteConfirmDialog';
import CopyButton from './CopyButton';

const EntryList = ({ entries, onEditEntry, onDeleteEntry, onReorderEntries, selectedFolderId, searchTerm }) => {
  const [showPasswords, setShowPasswords] = React.useState({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [entryToDelete, setEntryToDelete] = React.useState(null);
  const [draggedEntry, setDraggedEntry] = React.useState(null);
  const [dragOverEntry, setDragOverEntry] = React.useState(null);
  const [dropPosition, setDropPosition] = React.useState('after'); // 'before' or 'after'
  
  // Virtual scrolling state
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const scrollContainerRef = useRef(null);
  const ITEM_HEIGHT = 340; // Estimated height of each entry card (lg:min-h-[340px])
  const BUFFER_SIZE = 10; // Render extra items outside visible area

  // Memoize callbacks for better performance
  const togglePasswordVisibility = useCallback((entryId) => {
    setShowPasswords(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  }, []);

  const handleCopySuccess = useCallback((text, type) => {
    // Hier könnte in Zukunft Logging oder andere Aktionen durchgeführt werden
    console.log(`${type} copied to clipboard`);
  }, []);

  const openInExternalBrowser = useCallback((url) => {
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
  }, []);

  // Handle drag start with target checking
  const handleDragStart = useCallback((e, entry) => {
    // Check if the target or any parent has cursor-text style
    const hasTextCursor = (element) => {
      if (!element) return false;
      const computedStyle = window.getComputedStyle(element);
      return computedStyle.cursor === 'text' || 
             element.tagName === 'INPUT' || 
             element.tagName === 'TEXTAREA' ||
             element.classList.contains('cursor-text') ||
             element.closest('.cursor-text');
    };

    // Prevent dragging if clicking on text areas or buttons
    if (hasTextCursor(e.target) || 
        e.target.tagName === 'BUTTON' ||
        e.target.closest('button')) {
      e.preventDefault();
      return;
    }

    setDraggedEntry(entry);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'entry',
      entryId: entry.id,
      entryTitle: entry.title
    }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);
  // Virtual scrolling: calculate which entries to render
  const shouldVirtualize = entries.length > 50; // Start virtualizing with 50+ entries
  
  // Memoized grid layout calculation
  const gridInfo = useMemo(() => {
    if (containerDimensions.width === 0) return { columns: 3, itemsPerRow: 3 };
    
    const containerWidth = containerDimensions.width - 48; // Account for padding
    const minCardWidth = 300; // Minimum width of an entry card
    const gap = 24; // Gap between cards (lg:gap-6)
    
    const columns = Math.max(1, Math.floor((containerWidth + gap) / (minCardWidth + gap)));
    return { columns, itemsPerRow: columns };
  }, [containerDimensions.width]);

  const displayedEntries = useMemo(() => {
    if (!shouldVirtualize) {
      return entries;
    }

    const { itemsPerRow } = gridInfo;
    const startRow = Math.floor(visibleRange.start / itemsPerRow);
    const endRow = Math.ceil(visibleRange.end / itemsPerRow);
    
    const startIndex = Math.max(0, startRow * itemsPerRow);
    const endIndex = Math.min(entries.length, endRow * itemsPerRow);
    
    return entries.slice(startIndex, endIndex);
  }, [entries, visibleRange, shouldVirtualize, gridInfo]);

  // Handle scroll for virtual scrolling with debouncing for smoother experience
  const handleScroll = useCallback(() => {
    if (!shouldVirtualize || !scrollContainerRef.current || gridInfo.itemsPerRow === 0) return;

    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    
    const { itemsPerRow } = gridInfo;
    const rowHeight = ITEM_HEIGHT + 24; // Card height + gap
    
    const visibleStartRow = Math.floor(scrollTop / rowHeight);
    const visibleEndRow = Math.ceil((scrollTop + containerHeight) / rowHeight);
    
    // Generous buffer - render 3 screen heights before and after
    const screenRows = Math.ceil(containerHeight / rowHeight);
    const bufferRows = screenRows * 3;
    
    const startIndex = Math.max(0, (visibleStartRow - bufferRows) * itemsPerRow);
    const endIndex = Math.min(entries.length, (visibleEndRow + bufferRows) * itemsPerRow);
    
    // Only update if change is significant to reduce flickering
    const currentStart = visibleRange.start;
    const currentEnd = visibleRange.end;
    
    if (Math.abs(startIndex - currentStart) > itemsPerRow || 
        Math.abs(endIndex - currentEnd) > itemsPerRow) {
      setVisibleRange({ start: startIndex, end: endIndex });
    }
  }, [shouldVirtualize, entries.length, visibleRange.start, visibleRange.end, gridInfo]);

  // Set up ResizeObserver to track container size changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Set up scroll listener with throttling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !shouldVirtualize) return;

    let rafId = null;
    const throttledScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    container.addEventListener('scroll', throttledScroll, { passive: true });
    // Initial calculation
    handleScroll();

    return () => {
      container.removeEventListener('scroll', throttledScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [handleScroll, shouldVirtualize]);

  // Recalculate visible range when entries change or grid layout changes
  useEffect(() => {
    if (shouldVirtualize && containerDimensions.width > 0) {
      handleScroll();
    }
  }, [entries.length, handleScroll, shouldVirtualize, gridInfo.itemsPerRow, containerDimensions.width]);

  // Clear drag states when dragged entry is no longer in current folder
  useEffect(() => {
    if (draggedEntry && !entries.find(entry => entry.id === draggedEntry.id)) {
      // Dragged entry was moved to another folder, clear drag states
      setDraggedEntry(null);
      setDragOverEntry(null);
      setDropPosition('after');
    }
  }, [entries, draggedEntry]);

  // Memoize entry rendering to prevent unnecessary re-renders
  const renderEntry = useCallback((entry) => {
    return (
      <div
        key={entry.id}
        className={`entry-card theme-card rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 hover:shadow-md transition-all group cursor-pointer flex flex-col min-h-[280px] sm:min-h-[300px] md:min-h-[320px] lg:min-h-[340px] select-none ${
          dragOverEntry === entry.id ? (
            dropPosition === 'before' 
              ? 'border-t-4 border-blue-400 bg-blue-50' 
              : 'border-b-4 border-blue-400 bg-blue-50'
          ) : ''
        } ${
          draggedEntry && draggedEntry.id === entry.id ? 'opacity-50' : ''
        }`}
        onDoubleClick={() => onEditEntry(entry)}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, entry)}
        onDragEnd={() => {
          setDraggedEntry(null);
          setDragOverEntry(null);
          setDropPosition('after');
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (draggedEntry && draggedEntry.id !== entry.id) {
            e.dataTransfer.dropEffect = 'move';
            setDragOverEntry(entry.id);
            
            // Calculate drop position based on mouse Y position
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            const elementHeight = rect.height;
            
            if (mouseY < elementHeight * 0.5) {
              setDropPosition('before');
            } else {
              setDropPosition('after');
            }
          }
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverEntry(null);
            setDropPosition('after');
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          
          if (draggedEntry && draggedEntry.id !== entry.id && onReorderEntries) {
            onReorderEntries(draggedEntry.id, entry.id, dropPosition);
          }
          
          // Clear all drag states immediately
          setDraggedEntry(null);
          setDragOverEntry(null);
          setDropPosition('after');
        }}
        onMouseDown={(e) => {
          // Additional check on mousedown to prevent drag if over text areas
          const hasTextCursor = (element) => {
            if (!element) return false;
            const computedStyle = window.getComputedStyle(element);
            return computedStyle.cursor === 'text' || 
                   element.tagName === 'INPUT' || 
                   element.tagName === 'TEXTAREA' ||
                   element.classList.contains('cursor-text') ||
                   element.closest('.cursor-text');
          };
          
          if (hasTextCursor(e.target)) {
            e.currentTarget.draggable = false;
            // Re-enable draggable after a short delay
            setTimeout(() => {
              if (e.currentTarget) {
                e.currentTarget.draggable = true;
              }
            }, 100);
          }
        }}
      >
        {/* Header with icon, title and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center min-w-0 flex-1 pl-0 -ml-1.5 drag-handle cursor-move">
            <div className="flex-shrink-0 w-8 h-8 theme-surface rounded-lg flex items-center justify-center">
              <IconRenderer icon={entry.icon} className="w-5 h-5 theme-text-secondary" />
            </div>
            <h3 className="ml-1.5 text-sm font-semibold theme-text truncate select-none">{entry.title}</h3>
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
              className="flex-1 px-2 py-1 theme-input rounded-md text-xs min-w-0 select-text cursor-text"
              placeholder="No username"
              onMouseEnter={(e) => {
                const entryCard = e.currentTarget.closest('.entry-card');
                if (entryCard) entryCard.draggable = false;
              }}
              onMouseLeave={(e) => {
                const entryCard = e.currentTarget.closest('.entry-card');
                if (entryCard) entryCard.draggable = true;
              }}
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
              className="flex-1 px-2 py-1 theme-input rounded-md text-xs min-w-0 select-text cursor-text"
              placeholder="No password"
              onMouseEnter={(e) => {
                const entryCard = e.currentTarget.closest('.entry-card');
                if (entryCard) entryCard.draggable = false;
              }}
              onMouseLeave={(e) => {
                const entryCard = e.currentTarget.closest('.entry-card');
                if (entryCard) entryCard.draggable = true;
              }}
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
          <div 
            className="overflow-y-auto smooth-scroll scrollbar-thin theme-input rounded-md p-2 flex-1 min-h-[60px] max-h-[120px] sm:max-h-[100px] md:max-h-[120px] lg:max-h-[140px]"
            onMouseEnter={(e) => {
              const entryCard = e.currentTarget.closest('.entry-card');
              if (entryCard) entryCard.draggable = false;
            }}
            onMouseLeave={(e) => {
              const entryCard = e.currentTarget.closest('.entry-card');
              if (entryCard) entryCard.draggable = true;
            }}
          >
            {entry.notes ? (
              <p className="text-[11px] theme-text-secondary whitespace-pre-wrap leading-relaxed break-words select-text cursor-text" title={entry.notes}>
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
    );
  }, [draggedEntry, dragOverEntry, dropPosition, showPasswords, handleDragStart, onEditEntry, onReorderEntries, openInExternalBrowser, handleCopySuccess]);

  // Empty state component - moved after all hooks to avoid Hooks rule violation
  const EmptyState = () => (
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
  );

  // Calculate total height for virtual scrolling spacer
  const totalHeight = useMemo(() => {
    if (!shouldVirtualize || gridInfo.itemsPerRow === 0) return 'auto';
    
    const { itemsPerRow } = gridInfo;
    const totalRows = Math.ceil(entries.length / itemsPerRow);
    const rowHeight = ITEM_HEIGHT + 24; // Card height + gap
    
    return totalRows * rowHeight;
  }, [entries.length, shouldVirtualize, gridInfo.itemsPerRow]);

  return (
    <>
      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-auto smooth-scroll scrollbar-cool"
          style={{ height: '100%' }}
        >
          <div className="p-3 sm:p-4 lg:p-6">
            {shouldVirtualize ? (
              <div style={{ height: totalHeight, position: 'relative' }}>
                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6"
                  style={{
                    position: 'absolute',
                    top: `${Math.floor(visibleRange.start / gridInfo.itemsPerRow) * (ITEM_HEIGHT + 24)}px`,
                    width: '100%'
                  }}
                >
                  {displayedEntries.map(entry => renderEntry(entry))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                {displayedEntries.map(entry => renderEntry(entry))}
              </div>
            )}
          </div>
        </div>
      )}
      
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