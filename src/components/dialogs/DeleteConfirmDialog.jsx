import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const DeleteConfirmDialog = ({ 
  isOpen, 
  onDelete, 
  onCancel, 
  title = 'Confirm Deletion', 
  message = 'Are you sure you want to delete this item?', 
  itemName = '', 
  deleteButtonText = 'Delete',
  isFolder = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-md animate-slide-down">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold theme-text">{title}</h3>
              <p className="text-sm theme-text-secondary">
                {itemName ? `"${itemName}"` : 'This item'} will be permanently deleted.
              </p>
            </div>
          </div>

          <p className="theme-text-secondary mb-6">
            {message}
          </p>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 theme-button-secondary hover:opacity-80 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white hover:opacity-80 rounded-lg transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              {deleteButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
