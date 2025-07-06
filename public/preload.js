const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveDatabase: (data, existingPath = null) => ipcRenderer.invoke('save-database', data, existingPath),
  loadDatabase: () => ipcRenderer.invoke('load-database'),
  loadDatabaseFile: (filePath) => ipcRenderer.invoke('load-database-file', filePath),
  
  onMenuNewDatabase: (callback) => ipcRenderer.on('menu-new-database', callback),
  onMenuOpenDatabase: (callback) => ipcRenderer.on('menu-open-database', callback),
  onMenuSaveDatabase: (callback) => ipcRenderer.on('menu-save-database', callback),
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
  
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});