import React, { useState, useEffect } from 'react';
import { X, Copy, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { generatePassword, checkPasswordStrength } from '../../utils/crypto';

const PasswordGenerator = ({ onClose }) => {
  const { themes, actualTheme } = useTheme();
  const themeColors = themes[actualTheme]?.colors || themes.light.colors;
  
  const [options, setOptions] = useState({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false,
    excludeSimilar: false
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateNewPassword();
  }, [options]);

  useEffect(() => {
    if (generatedPassword) {
      setPasswordStrength(checkPasswordStrength(generatedPassword));
    }
  }, [generatedPassword]);

  // Dynamisches Styling für den Slider Thumb und Fortschrittsbalken
  useEffect(() => {
    // Slider thumb styling für WebKit (Chrome, Safari) und Mozilla Firefox
    const sliderThumbStyle = document.createElement('style');
    sliderThumbStyle.innerHTML = `
      input[type="range"].theme-slider {
        border: 1px solid ${themeColors.border};
        background: linear-gradient(to right, 
          ${themeColors.primary} 0%, 
          ${themeColors.primary} calc((var(--value) - var(--min)) / (var(--max) - var(--min)) * 100%), 
          ${actualTheme === 'dark' ? '#1f2937' : actualTheme === 'cute' ? '#fdf2f8' : '#f8fafc'} calc((var(--value) - var(--min)) / (var(--max) - var(--min)) * 100%),
          ${actualTheme === 'dark' ? '#1f2937' : actualTheme === 'cute' ? '#fdf2f8' : '#f8fafc'} 100%)
        !important;
      }
      
      input[type="range"].theme-slider::-webkit-slider-thumb {
        background-color: ${themeColors.primary} !important;
        box-shadow: 0 0 0 1px ${themeColors.border};
      }
      
      input[type="range"].theme-slider::-moz-range-thumb {
        background-color: ${themeColors.primary} !important;
        box-shadow: 0 0 0 1px ${themeColors.border};
      }
    `;
    document.head.appendChild(sliderThumbStyle);
    
    return () => {
      document.head.removeChild(sliderThumbStyle);
    };
  }, [themeColors.primary, themeColors.border, actualTheme]);
  
  // Update des Slider-Fortschritts
  const updateSliderProgress = (value, min, max) => {
    const slider = document.querySelector('input[type="range"].theme-slider');
    if (slider) {
      slider.style.setProperty('--value', value);
      slider.style.setProperty('--min', min);
      slider.style.setProperty('--max', max);
    }
  };
  
  // Initialer Update und bei Änderungen des Werts
  useEffect(() => {
    updateSliderProgress(options.length, 4, 128);
  }, [options.length]);

  const generateNewPassword = () => {
    try {
      const password = generatePassword(options);
      setGeneratedPassword(password);
    } catch (error) {
      console.error('Error generating password:', error);
    }
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="theme-surface rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto smooth-scroll scrollbar-cool password-generator-modal animate-slide-down">
        <div className="flex items-center justify-between p-4 sm:p-6 theme-border border-b">
          <h2 className="text-lg sm:text-xl font-semibold theme-text">Password Generator</h2>
          <button
            onClick={onClose}
            className="p-2 theme-text-secondary hover:opacity-80 theme-button-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              Generated Password
            </label>
            <div className="relative">
              <input
                type="text"
                value={generatedPassword}
                readOnly
                className="w-full theme-input px-3 py-3 pr-20 rounded-lg font-mono text-sm"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  onClick={generateNewPassword}
                  className="p-1 theme-text-secondary hover:opacity-80 rounded"
                  title="Generate new password"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`p-1 rounded transition-colors ${
                    copied ? 'text-green-500' : 'theme-text-secondary hover:theme-accent'
                  }`}
                  title="Copy password"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {passwordStrength && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm theme-text-secondary">Security:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStrengthColor(passwordStrength.strength)}`}>
                    {passwordStrength.strength.replace('-', ' ').toUpperCase()} • {passwordStrength.encryptionBits} bits
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
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text mb-2">
                Length: {options.length}
              </label>
              <input
                type="range"
                min="4"
                max="128"
                value={options.length}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  handleOptionChange('length', value);
                  updateSliderProgress(value, 4, 128);
                }}
                className="theme-slider"
              />
              <div className="flex justify-between text-xs theme-text-secondary mt-1">
                <span>4</span>
                <span>128</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="uppercase"
                  checked={options.includeUppercase}
                  onChange={(e) => handleOptionChange('includeUppercase', e.target.checked)}
                  className="theme-checkbox"
                  style={{
                    backgroundColor: options.includeUppercase ? themeColors.primary : (actualTheme === 'dark' ? '#1f2937' : actualTheme === 'cute' ? '#fdf2f8' : '#ffffff'),
                    borderColor: themeColors.border
                  }}
                />
                <label htmlFor="uppercase" className="ml-2 text-sm theme-text">
                  Include uppercase letters (A-Z)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lowercase"
                  checked={options.includeLowercase}
                  onChange={(e) => handleOptionChange('includeLowercase', e.target.checked)}
                  className="theme-checkbox"
                  style={{
                    backgroundColor: options.includeLowercase ? themeColors.primary : (actualTheme === 'dark' ? '#1f2937' : actualTheme === 'cute' ? '#fdf2f8' : '#ffffff'),
                    borderColor: themeColors.border
                  }}
                />
                <label htmlFor="lowercase" className="ml-2 text-sm theme-text">
                  Include lowercase letters (a-z)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="numbers"
                  checked={options.includeNumbers}
                  onChange={(e) => handleOptionChange('includeNumbers', e.target.checked)}
                  className="theme-checkbox"
                  style={{
                    backgroundColor: options.includeNumbers ? themeColors.primary : (actualTheme === 'dark' ? '#1f2937' : actualTheme === 'cute' ? '#fdf2f8' : '#ffffff'),
                    borderColor: themeColors.border
                  }}
                />
                <label htmlFor="numbers" className="ml-2 text-sm theme-text">
                  Include numbers (0-9)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="symbols"
                  checked={options.includeSymbols}
                  onChange={(e) => handleOptionChange('includeSymbols', e.target.checked)}
                  className="theme-checkbox"
                  style={{
                    backgroundColor: options.includeSymbols ? themeColors.primary : (actualTheme === 'dark' ? '#1f2937' : actualTheme === 'cute' ? '#fdf2f8' : '#ffffff'),
                    borderColor: themeColors.border
                  }}
                />
                <label htmlFor="symbols" className="ml-2 text-sm theme-text">
                  Include symbols (!@#$%^&*)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="excludeSimilar"
                  checked={options.excludeSimilar}
                  onChange={(e) => handleOptionChange('excludeSimilar', e.target.checked)}
                  className="theme-checkbox"
                  style={{
                    backgroundColor: options.excludeSimilar ? themeColors.primary : (actualTheme === 'dark' ? '#1f2937' : actualTheme === 'cute' ? '#fdf2f8' : '#ffffff'),
                    borderColor: themeColors.border
                  }}
                />
                <label htmlFor="excludeSimilar" className="ml-2 text-sm theme-text">
                  Exclude similar characters (i, l, 1, L, o, 0, O)
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 theme-border border-t">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 theme-button-secondary rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            Close
          </button>
          <button
            onClick={copyToClipboard}
            className="px-3 sm:px-4 py-2 theme-button rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
          >
            {copied ? 'Copied!' : 'Copy Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;