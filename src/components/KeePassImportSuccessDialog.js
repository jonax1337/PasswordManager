import React from 'react';
import { CheckCircle, X, FileText, Folder, Users } from 'lucide-react';

const KeePassImportSuccessDialog = ({ isOpen, onClose, stats }) => {
  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md animate-slide-down max-h-[90vh] overflow-y-auto smooth-scroll scrollbar-cool">
        <div className="flex items-center justify-between p-4 sm:p-6 theme-border border-b">
          <h2 className="text-lg sm:text-xl font-bold theme-text">Import Successful!</h2>
          <button
            onClick={onClose}
            className="p-2 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Success Icon */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h3 className="text-base sm:text-lg font-medium theme-text mb-2">
              KeePass Database Imported Successfully
            </h3>
            <p className="text-xs sm:text-sm theme-text-secondary">
              Your data has been converted and is ready to use
            </p>
          </div>

          {/* Import Statistics */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-medium theme-text text-sm sm:text-base">Import Summary</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 theme-surface rounded-lg">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm theme-text-secondary">Entries</p>
                  <p className="font-medium theme-text text-sm sm:text-base">{stats.entriesImported}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 theme-surface rounded-lg">
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full">
                  <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm theme-text-secondary">Folders</p>
                  <p className="font-medium theme-text text-sm sm:text-base">{stats.foldersImported}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 theme-surface rounded-lg">
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm theme-text-secondary">Source File</p>
                <p className="font-medium theme-text text-sm sm:text-base truncate">{stats.sourceFile}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 theme-surface rounded-lg p-3 sm:p-4">
            <h4 className="font-medium theme-text mb-2 text-sm sm:text-base">Next Steps:</h4>
            <ul className="text-xs sm:text-sm theme-text-secondary space-y-1">
              <li>• Review your imported entries and folders</li>
              <li>• Set up a new master password for this database</li>
              <li>• Save your database to complete the import</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 sm:p-6 theme-border border-t">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 theme-button rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeePassImportSuccessDialog;