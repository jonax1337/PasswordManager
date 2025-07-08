import React from 'react';
import { Plus, FolderOpen, Shield, ShieldCheck, Upload } from 'lucide-react';
import Titlebar from './Titlebar';

const WelcomeScreen = ({ onCreateNew, onOpenExisting, onImportKeePass }) => {
  const handleCloseApp = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <div className="h-screen theme-bg flex flex-col overflow-hidden">
      <Titlebar 
        showMenus={true} 
        onClose={handleCloseApp}
        onNewDatabase={onCreateNew}
        onOpenDatabase={onOpenExisting}
        onImportKeePass={onImportKeePass}
      />
      <div className="flex-1 overflow-y-auto smooth-scroll scrollbar-cool">
        <div className="min-h-full flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl py-2 sm:py-4">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 sm:mb-6 animate-slide-up">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold theme-text mb-3 sm:mb-4 animate-slide-up-delay-1">Simple Password Manager</h1>
              <p className="text-sm sm:text-base lg:text-lg theme-text-secondary max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto px-2 animate-slide-up-delay-2">
                Secure, modern, and intuitive password management for all your accounts
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto">
              {/* Create New Database */}
              <div 
                onClick={onCreateNew}
                className="glass-effect-strong rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center hover:scale-105 transition-all duration-300 cursor-pointer group hover:shadow-xl animate-slide-up-delay-3"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold theme-text mb-2 sm:mb-3 lg:mb-4 group-hover:text-green-600 transition-colors duration-300">Create New Database</h2>
                <p className="text-xs sm:text-sm lg:text-base theme-text-secondary px-1 sm:px-2 group-hover:theme-text transition-colors duration-300">
                  Start fresh with a new password database. Set up your master password and begin securing your accounts.
                </p>
              </div>

              {/* Open Existing Database */}
              <div 
                onClick={onOpenExisting}
                className="glass-effect-strong rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center hover:scale-105 transition-all duration-300 cursor-pointer group hover:shadow-xl animate-slide-up-delay-4"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold theme-text mb-2 sm:mb-3 lg:mb-4 group-hover:text-purple-600 transition-colors duration-300">Open Existing Database</h2>
                <p className="text-xs sm:text-sm lg:text-base theme-text-secondary px-1 sm:px-2 group-hover:theme-text transition-colors duration-300">
                  Access your existing password database. Select your database file and enter your master password.
                </p>
              </div>

              {/* Import from KeePass */}
              <div 
                onClick={onImportKeePass}
                className="glass-effect-strong rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center hover:scale-105 transition-all duration-300 cursor-pointer group hover:shadow-xl animate-slide-up-delay-5 sm:col-start-1 sm:col-end-3 sm:mx-auto sm:max-w-sm lg:col-start-auto lg:col-end-auto lg:mx-0 lg:max-w-none"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold theme-text mb-2 sm:mb-3 lg:mb-4 group-hover:text-orange-600 transition-colors duration-300">Import from KeePass</h2>
                <p className="text-xs sm:text-sm lg:text-base theme-text-secondary px-1 sm:px-2 group-hover:theme-text transition-colors duration-300">
                  Import your existing KeePass database file. Convert your KDBX file to our format.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;