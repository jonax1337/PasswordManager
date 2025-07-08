import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Minus, Square, X, FileText, FolderOpen, Save, Plus, Key, Sun, Moon, Palette, Heart, Upload } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Titlebar = ({ 
  title = 'Simple Password Manager',
  showMenus = false,
  onNewDatabase,
  onOpenDatabase,
  onSaveDatabase,
  onSaveAsDatabase,
  onAddEntry,
  onGeneratePassword,
  onImportKeePass,
  onClose,
  hasUnsavedChanges = false,
  currentFile = null
}) => {
  const { themes, currentTheme, changeTheme } = useTheme();
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [fileMenuPosition, setFileMenuPosition] = useState({ left: 0, top: 32 });
  const [editMenuPosition, setEditMenuPosition] = useState({ left: 0, top: 32 });
  const [styleMenuPosition, setStyleMenuPosition] = useState({ left: 0, top: 32 });

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose(); // Use app's close logic with unsaved changes handling
    } else if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  const handleFileMenuClick = (action) => {
    setShowFileMenu(false);
    action();
  };

  const handleEditMenuClick = (action) => {
    setShowEditMenu(false);
    action();
  };

  const handleStyleMenuClick = (themeName) => {
    setShowStyleMenu(false);
    changeTheme(themeName);
  };

  const getMenuPosition = (buttonRef) => {
    if (buttonRef && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.bottom + 4
      };
    }
    return { left: 0, top: 32 };
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowFileMenu(false);
      setShowEditMenu(false);
      setShowStyleMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="titlebar">
      {/* Left side - Menu items */}
      <div className="flex items-center gap-1">
        {showMenus && (
          <>
            {/* File Menu */}
            <div className="relative">
              <button 
                className="menu-button"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setFileMenuPosition({
                    left: rect.left,
                    top: rect.bottom + 4
                  });
                  setShowFileMenu(!showFileMenu);
                  setShowEditMenu(false);
                  setShowStyleMenu(false);
                }}
              >
                File
              </button>
            </div>

            {/* Edit Menu - only shown when a database is open */}
            {currentFile && (
              <div className="relative">
                <button 
                  className="menu-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setEditMenuPosition({
                      left: rect.left,
                      top: rect.bottom + 4
                    });
                    setShowEditMenu(!showEditMenu);
                    setShowFileMenu(false);
                    setShowStyleMenu(false);
                  }}
                >
                  Edit
                </button>
              </div>
            )}

            {/* Style Menu */}
            <div className="relative">
              <button 
                className="menu-button"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setStyleMenuPosition({
                    left: rect.left,
                    top: rect.bottom + 4
                  });
                  setShowStyleMenu(!showStyleMenu);
                  setShowFileMenu(false);
                  setShowEditMenu(false);
                }}
              >
                Style
              </button>
            </div>
          </>
        )}
      </div>

      {/* Center - Title */}
      <div className="titlebar-title">
        {title}
        {hasUnsavedChanges && <span className="text-orange-500 ml-1">•</span>}
      </div>

      {/* Right side - Window Controls */}
      <div className="window-controls">
        <button 
          className="window-control minimize" 
          onClick={handleMinimize}
          title="Minimize"
        >
          <Minus className="window-control-icon" />
        </button>
        <button 
          className="window-control maximize" 
          onClick={handleMaximize}
          title="Maximize"
        >
          <Square className="window-control-icon" />
        </button>
        <button 
          className="window-control close" 
          onClick={handleClose}
          title="Close"
        >
          <X className="window-control-icon" />
        </button>
      </div>

      {/* File Menu Dropdown - rendered as portal in document body */}
      {showFileMenu && ReactDOM.createPortal(
        <div className="menu-dropdown" style={fileMenuPosition}>
          {onNewDatabase && (
            <button
              className="menu-item"
              onClick={() => handleFileMenuClick(onNewDatabase)}
            >
              <FileText className="w-4 h-4" />
              New Database
              <span className="menu-shortcut">Ctrl+N</span>
            </button>
          )}
          {onOpenDatabase && (
            <button
              className="menu-item"
              onClick={() => handleFileMenuClick(onOpenDatabase)}
            >
              <FolderOpen className="w-4 h-4" />
              Open Database
              <span className="menu-shortcut">Ctrl+O</span>
            </button>
          )}
          {onImportKeePass && (
            <button
              className="menu-item"
              onClick={() => handleFileMenuClick(onImportKeePass)}
            >
              <Upload className="w-4 h-4" />
              Import KeePass Database
            </button>
          )}
          {onSaveDatabase && (
            <button
              className="menu-item"
              onClick={() => handleFileMenuClick(onSaveDatabase)}
            >
              <Save className="w-4 h-4" />
              {currentFile ? 'Save' : 'Save As...'}
              <span className="menu-shortcut">Ctrl+S</span>
              {hasUnsavedChanges && <span className="unsaved-indicator">•</span>}
            </button>
          )}
          {currentFile && onSaveAsDatabase && (
            <button
              className="menu-item"
              onClick={() => handleFileMenuClick(onSaveAsDatabase)}
            >
              <Save className="w-4 h-4" />
              Save As...
              <span className="menu-shortcut">Ctrl+Shift+S</span>
            </button>
          )}
        </div>,
        document.body
      )}

      {/* Edit Menu Dropdown - rendered as portal in document body */}
      {showEditMenu && ReactDOM.createPortal(
        <div className="menu-dropdown" style={editMenuPosition}>
          {onAddEntry && (
            <button
              className="menu-item"
              onClick={() => handleEditMenuClick(onAddEntry)}
            >
              <Plus className="w-4 h-4" />
              Add Entry
              <span className="menu-shortcut">Strg+Alt+Win+N</span>
            </button>
          )}
          {onGeneratePassword && (
            <button
              className="menu-item password-generator-button"
              onClick={() => handleEditMenuClick(onGeneratePassword)}
            >
              <Key className="w-4 h-4" />
              Generate Password
              <span className="menu-shortcut">Ctrl+G</span>
            </button>
          )}
        </div>,
        document.body
      )}

      {/* Style Menu Dropdown - rendered as portal in document body */}
      {showStyleMenu && ReactDOM.createPortal(
        <div className="menu-dropdown" style={styleMenuPosition}>
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              className={`menu-item ${currentTheme === key ? 'theme-surface theme-primary' : ''}`}
              onClick={() => handleStyleMenuClick(key)}
            >
              {key === 'cute' && <Heart className="w-4 h-4" />}
              {key === 'dark' && <Moon className="w-4 h-4" />}
              {key === 'light' && <Sun className="w-4 h-4" />}
              {key === 'system' && <Palette className="w-4 h-4" />}
              {theme.name}
              {currentTheme === key && <span className="ml-auto theme-primary">✓</span>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Titlebar;