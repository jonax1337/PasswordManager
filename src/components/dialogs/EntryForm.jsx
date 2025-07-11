import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Shuffle, Copy, Smile, ChevronDown, Folder } from 'lucide-react';
import { generatePassword, checkPasswordStrength } from '../../utils/crypto';
import { useTheme } from '../../contexts/ThemeContext';
import IconPicker from './IconPicker';
import IconRenderer from '../ui/IconRenderer';

const EntryForm = ({ entry, folders, currentFolderId, onSubmit, onClose }) => {
  const { themes, actualTheme } = useTheme();
  const themeColors = themes[actualTheme]?.colors || themes.light.colors;
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    folderId: 'general', // Default folder ID
    notes: '',
    icon: null
  });

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);

  // Extract all folders for the dropdown, excluding root "All Entries"
  const getAllFolders = (folders, result = [], level = 0) => {
    folders.forEach(folder => {
      // Skip the root "All Entries" folder (id: 'root')
      if (folder.id !== 'root') {
        result.push({
          ...folder,
          level: level
        });
      }
      if (folder.children) {
        getAllFolders(folder.children, result, level + 1);
      }
    });
    return result;
  };

  const folderOptions = getAllFolders(folders);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Helper function to get folder from ID
  const getFolderFromId = (folderId) => {
    if (!folderId || folderId === 'root') return { id: 'general', name: 'General', path: 'General' };
    
    const findFolder = (folders) => {
      for (const folder of folders) {
        if (folder.id === folderId) {
          return folder;
        }
        if (folder.children) {
          const found = findFolder(folder.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findFolder(folders) || { id: 'general', name: 'General', path: 'General' };
  };

  useEffect(() => {
    if (entry) {
      setFormData(entry);
    } else if (currentFolderId && currentFolderId !== 'root' && !entry) {
      // Wenn ein neuer Eintrag erstellt wird, nutze den aktuellen Ordner (aber nicht Root)
      setFormData(prev => ({
        ...prev,
        folderId: currentFolderId
      }));
    }
  }, [entry, currentFolderId, folders]);

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFolderDropdown && !event.target.closest('.relative')) {
        setShowFolderDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFolderDropdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (formData.title && formData.password) {
      onSubmit(formData);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true
    });
    setFormData(prev => ({
      ...prev,
      password: newPassword
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'very-weak': return `strength-very-weak`;
      case 'weak': return `strength-weak`;
      case 'medium': return `strength-medium`;
      case 'strong': return `strength-strong`;
      case 'very-strong': return `strength-very-strong`;
      default: return `theme-text-secondary bg-opacity-10 theme-border`;
    }
  };

  const getStrengthBarColor = (strength) => {
    switch (strength) {
      case 'very-weak': return 'strength-bar-very-weak';
      case 'weak': return 'strength-bar-weak';
      case 'medium': return 'strength-bar-medium';
      case 'strong': return 'strength-bar-strong';
      case 'very-strong': return 'strength-bar-very-strong';
      default: return 'theme-border';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4" style={{zIndex: 100}}>
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto smooth-scroll scrollbar-cool animate-slide-down">
        <div className="flex items-center justify-between p-4 sm:p-6 theme-border border-b">
          <h2 className="text-lg sm:text-xl font-semibold theme-text">
            {entry ? 'Edit Entry' : 'Add New Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Header Fields - Responsive Grid Layout */}
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4">
            {/* Title and Icon - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium theme-text mb-2">
                Title *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(true)}
                  className="flex-shrink-0 w-10 h-10 theme-border border rounded-lg hover:opacity-80 theme-button-secondary transition-colors flex items-center justify-center"
                  title="Choose icon"
                >
                  {formData.icon ? (
                    <IconRenderer icon={formData.icon} className="w-5 h-5" />
                  ) : (
                    <Smile className="w-5 h-5 theme-text-secondary" />
                  )}
                </button>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="flex-1 theme-input px-3 py-2 rounded-lg"
                  placeholder="e.g., Gmail, Facebook, etc."
                  required
                />
              </div>
            </div>

            {/* Folder - Takes 1 column on large screens */}
            <div className="lg:col-span-1 relative">
              <label className="block text-sm font-medium theme-text mb-2">
                Folder
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                  className="w-full theme-input px-3 py-2 rounded-lg text-left flex items-center justify-between hover:opacity-80 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {(() => {
                      const selectedFolder = getFolderFromId(formData.folderId);
                      return (
                        <>
                          {selectedFolder?.icon ? (
                            <IconRenderer icon={selectedFolder.icon} className="w-4 h-4" />
                          ) : (
                            <Folder className="w-4 h-4 theme-text-secondary" />
                          )}
                          <span>{selectedFolder?.name || 'General'}</span>
                        </>
                      );
                    })()}
                  </span>
                  <ChevronDown className={`w-4 h-4 theme-text-secondary transition-transform ${showFolderDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showFolderDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 theme-surface border theme-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto scrollbar-cool">
                    {folderOptions.map(folder => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, folderId: folder.id }));
                          setShowFolderDropdown(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 hover:opacity-80 theme-button-secondary transition-colors flex items-center gap-2 text-sm ${
                          formData.folderId === folder.id ? 'bg-blue-50 theme-primary' : ''
                        }`}
                        style={{ paddingLeft: `${folder.level * 12 + 8}px` }}
                      >
                        {folder.icon ? (
                          <IconRenderer icon={folder.icon} className="w-3.5 h-3.5" />
                        ) : (
                          <Folder className="w-3.5 h-3.5 theme-text-secondary" />
                        )}
                        <span className={folder.level === 0 ? 'font-medium' : 'font-normal'}>
                          {folder.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Username - Full Width */}
          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              Username/Email
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full theme-input px-3 py-2 rounded-lg"
              placeholder="Enter username or email"
            />
          </div>

          {/* Password - Full Width */}
          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full theme-input px-3 py-2 pr-20 rounded-lg"
                placeholder="Enter password"
                required
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 theme-text-secondary hover:opacity-80 rounded"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="p-1 theme-text-secondary hover:opacity-80 rounded"
                  title="Generate password"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                {formData.password && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.password)}
                    className="p-1 theme-text-secondary hover:opacity-80 rounded"
                    title="Copy password"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {passwordStrength && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm theme-text-secondary">Password strength:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${getStrengthColor(passwordStrength.strength)}`}>
                    {passwordStrength.strength.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs theme-text-secondary">Encryption Strength:</span>
                  <span className="text-xs theme-text-primary font-semibold">
                    {passwordStrength.encryptionBits} bits
                  </span>
                </div>
                <div className="w-full rounded-full border relative" style={{ 
                  backgroundColor: actualTheme === 'dark' ? '#1f2937' : actualTheme === 'cute' ? '#fdf2f8' : '#f8fafc',
                  borderColor: themeColors.border,
                  height: '8px',
                  padding: 0,
                  overflow: 'hidden'
                }}>
                  <div 
                    className={`absolute top-0 left-0 bottom-0 ${getStrengthBarColor(passwordStrength.strength)}`}
                    style={{ 
                      width: `${Math.min((passwordStrength.entropy / 100) * 100, 100)}%`,
                      borderRadius: 'inherit'
                    }}
                  />
                </div>
                <div className="text-xs theme-text-secondary">
                  Entropy: {passwordStrength.entropy.toFixed(1)} bits
                </div>
              </div>
            )}
          </div>

          {/* URL - Full Width */}
          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              URL
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="w-full theme-input px-3 py-2 rounded-lg"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full theme-input px-3 py-2 rounded-lg"
              placeholder="Additional notes or information..."
            />
          </div>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 theme-border border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-2 theme-button-secondary rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-3 sm:px-4 py-2 theme-button rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
          >
            {entry ? 'Update Entry' : 'Add Entry'}
          </button>
        </div>
      </div>

      {/* Icon Picker Modal */}
      {showIconPicker && (
        <IconPicker
          selectedIcon={formData.icon}
          onIconSelect={(icon) => {
            setFormData(prev => ({ ...prev, icon }));
          }}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </div>
  );
};

export default EntryForm;