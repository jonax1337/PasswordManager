import React, { useState } from 'react';
import { Upload, X, FileText, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { importKeePassDatabase, validateKeePassFile, testKdbxWeb } from '../../utils/keepassImport';

const KeePassImportDialog = ({ isOpen, onClose, onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (!file) return;

    setError('');
    
    if (!validateKeePassFile(file)) {
      setError('Invalid file type. Please select a KeePass database file (.kdbx or .kdb).');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile || !password) {
      setError('Please select a file and enter the password.');
      return;
    }

    setIsImporting(true);
    setError('');

    // Test kdbxweb first
    console.log('Testing kdbxweb...');
    const kdbxTest = testKdbxWeb();
    if (!kdbxTest) {
      setError('KeePass library failed to load. Please refresh the page and try again.');
      setIsImporting(false);
      return;
    }

    try {
      console.log('Starting import with file:', selectedFile.name);
      const result = await importKeePassDatabase(selectedFile, password);
      console.log('Import result:', result);
      
      if (result.success) {
        console.log('Import successful, calling onImportSuccess');
        onImportSuccess(result.database, result.stats);
        handleClose();
      } else {
        console.error('Import failed:', result.error);
        setError(result.error || 'Failed to import database');
      }
    } catch (error) {
      console.error('Import error caught:', error);
      setError(`Import failed: ${error.message || 'An unexpected error occurred'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPassword('');
    setShowPassword(false);
    setError('');
    setIsImporting(false);
    setDragOver(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg animate-slide-down max-h-[90vh] overflow-y-auto smooth-scroll scrollbar-cool">
        <div className="flex items-center justify-between p-4 sm:p-6 theme-border border-b">
          <h2 className="text-lg sm:text-xl font-bold theme-text">Import KeePass Database</h2>
          <button
            onClick={handleClose}
            className="p-2 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-lg transition-colors"
            disabled={isImporting}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              Select KeePass Database File
            </label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all ${
                dragOver 
                  ? 'border-blue-500 bg-blue-50 theme-surface' 
                  : selectedFile 
                    ? 'border-green-500 bg-green-50 theme-surface' 
                    : 'theme-border hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".kdbx,.kdb"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isImporting}
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-500 mx-auto" />
                  <div>
                    <p className="font-medium theme-text text-sm sm:text-base truncate">{selectedFile.name}</p>
                    <p className="text-xs sm:text-sm theme-text-secondary">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 sm:w-12 sm:h-12 theme-text-secondary mx-auto" />
                  <div>
                    <p className="font-medium theme-text text-sm sm:text-base">
                      {dragOver ? 'Drop file here' : 'Choose file or drag and drop'}
                    </p>
                    <p className="text-xs sm:text-sm theme-text-secondary">
                      Supports .kdbx and .kdb files
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full theme-input px-3 sm:px-4 py-2 sm:py-3 rounded-lg pr-10 sm:pr-12 text-sm sm:text-base"
                placeholder="Enter your KeePass master password"
                disabled={isImporting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-secondary hover:opacity-80"
                disabled={isImporting}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start p-3 bg-red-50 theme-border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-red-700 break-words">{error}</p>
            </div>
          )}

          {/* Import Info */}
          <div className="bg-blue-50 theme-surface rounded-lg p-3 sm:p-4">
            <h4 className="font-medium theme-text mb-2 text-sm sm:text-base">What happens during import:</h4>
            <ul className="text-xs sm:text-sm theme-text-secondary space-y-1">
              <li>• Your KeePass entries will be converted to our format</li>
              <li>• Folder structure will be preserved</li>
              <li>• Custom fields will be added to notes</li>
              <li>• Original file remains unchanged</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 theme-border border-t">
          <button
            onClick={handleClose}
            className="px-3 sm:px-4 py-2 theme-button-secondary rounded-lg font-medium transition-colors text-sm sm:text-base"
            disabled={isImporting}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile || !password || isImporting}
            className="px-3 sm:px-4 py-2 theme-button rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isImporting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Database
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeePassImportDialog;