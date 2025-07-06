import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themes = {
  light: {
    name: 'Light',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      accent: '#10b981'
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#818cf8',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#e5e7eb',
      border: '#374151',
      accent: '#34d399'
    }
  },
  cute: {
    name: 'Cute',
    colors: {
      primary: '#ec4899',
      secondary: '#f97316',
      background: '#fef7ff',
      surface: '#fdf2f8',
      text: '#831843',
      textSecondary: '#be185d',
      border: '#f9a8d4',
      accent: '#f472b6'
    }
  },
  system: {
    name: 'System',
    colors: null // Will use system detection
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('system');
  const [actualTheme, setActualTheme] = useState('light');

  // Detect system theme
  const detectSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Update actual theme based on current theme setting
  useEffect(() => {
    if (currentTheme === 'system') {
      setActualTheme(detectSystemTheme());
    } else {
      setActualTheme(currentTheme);
    }
  }, [currentTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia && currentTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (currentTheme === 'system') {
          setActualTheme(detectSystemTheme());
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [currentTheme]);

  // Apply theme to document
  useEffect(() => {
    const theme = themes[actualTheme];
    if (theme && theme.colors) {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      
      // Update body class for additional styling
      document.body.className = `theme-${actualTheme}`;
    }
  }, [actualTheme]);

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme preference
  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem('theme', themeName);
  };

  const value = {
    currentTheme,
    actualTheme,
    themes,
    changeTheme,
    theme: themes[actualTheme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};