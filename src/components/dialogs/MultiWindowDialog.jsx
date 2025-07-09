import React from 'react';
import { FileText, FolderOpen, ExternalLink, Replace, Upload } from 'lucide-react';

const MultiWindowDialog = ({ 
  isOpen, 
  onOpenInNewWindow, 
  onReplaceCurrentDatabase, 
  onCancel,
  action, // 'new-database', 'open-database', or 'import-keepass'
  hasUnsavedChanges = false
}) => {
  if (!isOpen) return null;

  const getActionDetails = () => {
    switch (action) {
      case 'new-database':
        return {
          text: 'create a new database',
          title: 'Create New Database',
          icon: <FileText className="w-6 h-6 text-blue-600" />
        };
      case 'open-database':
        return {
          text: 'open a database',
          title: 'Open Database',
          icon: <FolderOpen className="w-6 h-6 text-green-600" />
        };
      case 'import-keepass':
        return {
          text: 'import from KeePass',
          title: 'Import from KeePass',
          icon: <Upload className="w-6 h-6 text-orange-600" />
        };
      default:
        return {
          text: 'perform this action',
          title: 'Action',
          icon: <FileText className="w-6 h-6 text-blue-600" />
        };
    }
  };

  const { text: actionText, title: actionTitle, icon: actionIcon } = getActionDetails();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-lg animate-slide-down">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mr-4">
              {actionIcon}
            </div>
            <div>
              <h3 className="text-lg font-semibold theme-text">
                {actionTitle}
              </h3>
              <p className="text-sm theme-text-secondary">
                You already have a database open
              </p>
            </div>
          </div>

          <p className="theme-text-secondary mb-6">
            You want to {actionText}. Choose one of the following options:
            {hasUnsavedChanges && (
              <span className="block mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm">
                <strong>⚠️ Warning:</strong> You have unsaved changes that will be lost if you replace the current database.
              </span>
            )}
          </p>

          <div className="flex flex-col gap-3">
            {/* Open in New Window - Primary Action */}
            <button
              onClick={onOpenInNewWindow}
              className="w-full p-4 theme-button rounded-lg transition-colors flex items-center justify-between hover:scale-[1.02] transform"
            >
              <div className="flex items-center">
                <ExternalLink className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Open in New Window</div>
                  <div className="text-sm opacity-80">Keep current database open - work with both simultaneously</div>
                </div>
              </div>
              <div className="text-xs opacity-60 bg-white bg-opacity-20 px-2 py-1 rounded">
                Recommended
              </div>
            </button>

            {/* Replace Current Database */}
            <button
              onClick={onReplaceCurrentDatabase}
              className={`w-full p-4 rounded-lg transition-colors flex items-center ${
                hasUnsavedChanges 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'theme-button-secondary'
              }`}
            >
              <Replace className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Replace Current Database</div>
                <div className="text-sm opacity-80">
                  {hasUnsavedChanges ? 'Close current database (unsaved changes will be lost)' : 'Close current database and open new one'}
                </div>
              </div>
            </button>

            {/* Cancel */}
            <button
              onClick={onCancel}
              className="w-full p-2 theme-button-secondary rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiWindowDialog;