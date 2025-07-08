import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Shuffle, Copy, Smile } from 'lucide-react';
import { generatePassword, checkPasswordStrength } from '../utils/crypto';
import { useTheme } from '../contexts/ThemeContext';
import IconPicker from './IconPicker';
import IconRenderer from './IconRenderer';

const EntryForm = ({ entry, folders, currentFolder, onSubmit, onClose }) => {
  const { themes, actualTheme } = useTheme();
  const themeColors = themes[actualTheme]?.colors || themes.light.colors;
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    folder: currentFolder || 'General',
    notes: '',
    icon: null
  });

  const [showIconPicker, setShowIconPicker] = useState(false);

  // Extract all folder paths for the dropdown
  const getAllFolderPaths = (folders, paths = []) => {
    folders.forEach(folder => {
      if (folder.path) paths.push(folder.path);
      if (folder.children) {
        getAllFolderPaths(folder.children, paths);
      }
    });
    return paths;
  };

  const folderPaths = getAllFolderPaths(folders);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  useEffect(() => {
    if (entry) {
      setFormData(entry);
    } else if (currentFolder && !entry) {
      // Wenn ein neuer Eintrag erstellt wird, nutze den aktuellen Ordner
      setFormData(prev => ({
        ...prev,
        folder: currentFolder
      }));
    }
  }, [entry, currentFolder]);

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
    // Match die Text-Farbe entsprechend der Stärke
    switch (strength) {
      case 'weak': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'strong': return 'text-green-600 bg-green-50';
      default: return 'theme-text-secondary';
    }
  };

  const getStrengthBarColor = (strength) => {
    // Gleiche CSS-Klassennamen wie in PasswordGenerator
    switch (strength) {
      case 'weak': return 'strength-weak';
      case 'medium': return 'strength-medium';
      case 'strong': return 'strength-strong';
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium theme-text mb-2">
                Folder
              </label>
              <select
                name="folder"
                value={formData.folder}
                onChange={handleChange}
                className="w-full theme-input px-3 py-2 rounded-lg"
              >
                {folderPaths.map(path => (
                  <option key={path} value={path}>{path}</option>
                ))}
              </select>
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
                    {passwordStrength.strength.toUpperCase()}
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
                      width: `${(passwordStrength.score / 6) * 100}%`,
                      borderRadius: 'inherit'
                    }}
                  />
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

          <div className="flex items-center justify-end space-x-3 pt-4 theme-border border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 theme-button rounded-lg"
            >
              {entry ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
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