const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveDatabase: (data, existingPath = null) => ipcRenderer.invoke('save-database', data, existingPath),
  loadDatabase: () => ipcRenderer.invoke('load-database'),
  loadDatabaseFile: (filePath) => ipcRenderer.invoke('load-database-file', filePath),
  
  onMenuNewDatabase: (callback) => ipcRenderer.on('menu-new-database', callback),
  onMenuOpenDatabase: (callback) => ipcRenderer.on('menu-open-database', callback),
  onMenuSaveDatabase: (callback) => ipcRenderer.on('menu-save-database', callback),
  onMenuImportKeePass: (callback) => ipcRenderer.on('menu-import-keepass', callback),
  onMenuAddEntry: (callback) => ipcRenderer.on('menu-add-entry', callback),
  onMenuGeneratePassword: (callback) => ipcRenderer.on('menu-generate-password', callback),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Öffne URLs im Standard-Browser des Benutzers
  openExternal: (url) => shell.openExternal(url),
  
  // Recent database management
  getRecentDatabase: () => ipcRenderer.invoke('get-recent-database'),
  setRecentDatabase: (filePath) => ipcRenderer.invoke('set-recent-database', filePath),
  clearRecentDatabase: () => ipcRenderer.invoke('clear-recent-database'),
  
  // File opening from command line
  getPendingFile: () => ipcRenderer.invoke('get-pending-file'),
  onOpenFile: (callback) => ipcRenderer.on('open-file', callback),
  
  // Multi-window support
  createNewWindow: (options) => ipcRenderer.invoke('create-new-window', options),
  createNewDatabaseWindow: () => ipcRenderer.invoke('create-new-database-window'),
  openDatabaseInNewWindow: () => ipcRenderer.invoke('open-database-in-new-window'),
  importKeePassInNewWindow: () => ipcRenderer.invoke('import-keepass-in-new-window'),
  
  // Get startup action for new windows
  getStartupAction: () => ipcRenderer.invoke('get-startup-action'),
  
  // Settings management
  getSetting: (key, defaultValue) => ipcRenderer.invoke('get-setting', key, defaultValue),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  
  // Security management
  getSecurityData: () => ipcRenderer.invoke('get-security-data'),
  saveSecurityData: (data) => ipcRenderer.invoke('save-security-data', data),
  getSystemKey: () => ipcRenderer.invoke('get-system-key'),
  getSecurityConfigPath: () => ipcRenderer.invoke('get-security-config-path'),
  clearSecurityData: () => ipcRenderer.invoke('clear-security-data'),
  
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});