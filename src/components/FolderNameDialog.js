import React, { useState, useEffect } from 'react';
import { X, Folder } from 'lucide-react';

const FolderNameDialog = ({ isOpen, title, initialValue = '', onConfirm, onCancel }) => {
  const [folderName, setFolderName] = useState(initialValue);
  const [error, setError] = useState('');

  useEffect(() => {
    setFolderName(initialValue);
    setError('');
  }, [initialValue, isOpen]);

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
    
    onConfirm(trimmedName);
    setFolderName('');
    setError('');
  };

  const handleCancel = () => {
    setFolderName('');
    setError('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 theme-border border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-opacity-20 theme-bg-primary rounded-lg">
              <Folder className="w-5 h-5 theme-primary" />
            </div>
            <h2 className="text-lg font-semibold theme-text">{title}</h2>
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
            <label htmlFor="folderName" className="block text-sm font-medium theme-text mb-2">
              Folder Name
            </label>
            <input
              id="folderName"
              type="text"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                setError('');
              }}
              className={`w-full theme-input px-3 py-2 rounded-lg ${
                error ? 'border-red-300' : ''
              }`}
              placeholder="Enter folder name..."
              autoFocus
              maxLength={50}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 hover:opacity-80 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim()}
              className="px-6 py-2 theme-button rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderNameDialog;