import React from 'react';
import { AlertTriangle, Save, X } from 'lucide-react';

const UnsavedChangesDialog = ({ isOpen, onSave, onDiscard, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mr-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold theme-text">
                Unsaved Changes
              </h3>
              <p className="text-sm theme-text-secondary">
                You have unsaved changes in your database.
              </p>
            </div>
          </div>

          <p className="theme-text-secondary mb-6">
            Do you want to save your changes before continuing?
          </p>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 theme-button-secondary rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onDiscard}
              className="px-4 py-2 bg-red-600 text-white hover:opacity-80 rounded-lg transition-colors flex items-center"
            >
              <X className="w-4 h-4 inline mr-1" />
              Don't Save
            </button>
            <button
              onClick={onSave}
              className="px-6 py-2 theme-button rounded-lg flex items-center"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;