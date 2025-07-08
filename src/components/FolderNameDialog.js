import React, { useState, useEffect } from 'react';
import { X, Folder, Smile } from 'lucide-react';
import IconPicker from './IconPicker';
import IconRenderer from './IconRenderer';

const FolderNameDialog = ({ isOpen, title, confirmText = 'Create', initialValue = '', initialIcon = null, onConfirm, onCancel }) => {
  const [folderName, setFolderName] = useState(initialValue);
  const [selectedIcon, setSelectedIcon] = useState(initialIcon);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFolderName(initialValue);
      setSelectedIcon(initialIcon);
      setError('');
    }
  }, [initialValue, initialIcon, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = folderName.trim();
    
    if (!trimmedName) {
      setError('Folder name cannot be empty');
      return;
    }
    
    if (trimmedName.includes('/')) {
      setError('Folder name cannot contain "/"');
      return;
    }
    
    onConfirm(trimmedName, selectedIcon);
    setFolderName('');
    setSelectedIcon(null);
    setError('');
  };

  const handleCancel = () => {
    setFolderName('');
    setSelectedIcon(null);
    setError('');
    onCancel();
  };

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon);
    setShowIconPicker(false);
  };

  const handleRemoveIcon = () => {
    setSelectedIcon(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-md animate-slide-down">
        <div className="flex items-center justify-between p-6 theme-border border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold theme-text">{title}</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="folderName" className="block text-xs sm:text-sm font-medium theme-text mb-2">
              Folder Name
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className="flex items-center justify-center w-10 h-10 theme-surface theme-border border rounded-lg hover:opacity-80 transition-colors flex-shrink-0"
              >
                {selectedIcon ? (
                  <IconRenderer icon={selectedIcon} className="w-5 h-5" />
                ) : (
                  <Smile className="w-5 h-5 theme-text-secondary" />
                )}
              </button>
              <input
                id="folderName"
                type="text"
                value={folderName}
                onChange={(e) => {
                  setFolderName(e.target.value);
                  setError('');
                }}
                className={`flex-1 theme-input px-3 py-2 rounded-lg text-sm sm:text-base ${
                  error ? 'border-red-300' : ''
                }`}
                placeholder="Enter folder name..."
                autoFocus
                maxLength={50}
              />
            </div>
            {selectedIcon && (
              <button
                type="button"
                onClick={handleRemoveIcon}
                className="text-xs theme-text-secondary hover:text-red-600 transition-colors mt-2"
              >
                Remove icon
              </button>
            )}
            {error && (
              <p className="mt-2 text-xs sm:text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 hover:opacity-80 rounded-lg text-xs sm:text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim()}
              className="px-6 py-2 theme-button rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>

      {showIconPicker && (
        <IconPicker
          selectedIcon={selectedIcon}
          onIconSelect={handleIconSelect}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
};

export default FolderNameDialog;