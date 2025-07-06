import React from 'react';
import { Plus, FolderOpen, Shield, ShieldCheck } from 'lucide-react';
import Titlebar from './Titlebar';

const WelcomeScreen = ({ onCreateNew, onOpenExisting }) => {
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
      />
      <div className="flex-1 overflow-y-auto smooth-scroll scrollbar-cool">
        <div className="min-h-full flex items-center justify-center p-3 sm:p-4 lg:p-8">
          <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl py-8 sm:py-12 lg:py-16">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 sm:mb-6">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold theme-text mb-3 sm:mb-4">Simple Password Manager</h1>
              <p className="text-base sm:text-lg lg:text-xl theme-text-secondary max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto px-2">
                Secure, modern, and intuitive password management for all your accounts
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
              {/* Create New Database */}
              <div 
                onClick={onCreateNew}
                className="glass-effect-strong rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 text-center hover:scale-105 transition-all duration-300 cursor-pointer group hover:shadow-xl"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold theme-text mb-3 sm:mb-4 group-hover:text-green-600 transition-colors duration-300">Create New Database</h2>
                <p className="text-sm sm:text-base theme-text-secondary px-2 group-hover:theme-text transition-colors duration-300">
                  Start fresh with a new password database. Set up your master password and begin securing your accounts.
                </p>
              </div>

              {/* Open Existing Database */}
              <div 
                onClick={onOpenExisting}
                className="glass-effect-strong rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 text-center hover:scale-105 transition-all duration-300 cursor-pointer group hover:shadow-xl"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold theme-text mb-3 sm:mb-4 group-hover:text-purple-600 transition-colors duration-300">Open Existing Database</h2>
                <p className="text-sm sm:text-base theme-text-secondary px-2 group-hover:theme-text transition-colors duration-300">
                  Access your existing password database. Select your database file and enter your master password.
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