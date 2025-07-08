const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || 
             !app.isPackaged;

let mainWindow = null; // Keep track of the first window for backwards compatibility
let pendingFileToOpen = null;
let allWindows = new Set();
let windowStartupActions = new Map(); // Track startup actions for each window

function createWindow() {
  const newWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: isDev,
      webSecurity: true
    },
    titleBarStyle: 'hidden',
    frame: false,
    show: false
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, 'index.html')}`;
  
  newWindow.loadURL(startUrl);

  newWindow.once('ready-to-show', () => {
    newWindow.show();
  });

  // Track this window
  allWindows.add(newWindow);
  
  // Set as main window if it's the first one
  if (!mainWindow) {
    mainWindow = newWindow;
  }

  newWindow.on('closed', () => {
    allWindows.delete(newWindow);
    // If this was the main window, clear the reference
    if (newWindow === mainWindow) {
      mainWindow = null;
    }
  });

  // Security: Prevent new window creation
  newWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    newWindow.webContents.openDevTools();
  }
  
  return newWindow;
}

app.whenReady().then(() => {
  createWindow();
  
  // Check if app was opened with a file
  if (process.argv.length > 1) {
    const filePath = process.argv.find(arg => arg.endsWith('.pmdb'));
    if (filePath && fs.existsSync(filePath)) {
      pendingFileToOpen = filePath;
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  // Clear the windows set
  allWindows.clear();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('save-database', async (event, data, existingPath = null) => {
  // If an existing path is provided, save directly to that path
  if (existingPath) {
    try {
      fs.writeFileSync(existingPath, data);
      return { success: true, filePath: existingPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Otherwise, show save dialog
  const parentWindow = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showSaveDialog(parentWindow, {
    filters: [
      { name: 'Password Database', extensions: ['pmdb'] }
    ]
  });

  if (!result.canceled) {
    try {
      fs.writeFileSync(result.filePath, data);
      return { success: true, filePath: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
});

ipcMain.handle('load-database', async (event) => {
  const parentWindow = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(parentWindow, {
    filters: [
      { name: 'Password Database', extensions: ['pmdb'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const data = fs.readFileSync(result.filePaths[0], 'utf8');
      return { success: true, data, filePath: result.filePaths[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
});

// Load database from specific path (for recent database)
ipcMain.handle('load-database-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return { success: true, data, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Window control handlers - now work with the sending window
ipcMain.handle('minimize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.minimize();
  }
});

ipcMain.handle('maximize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});

ipcMain.handle('close-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.close();
  }
});

// Handle external URL opening
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

// Recent database management
const Store = require('electron-store');
const store = new Store();

ipcMain.handle('get-recent-database', () => {
  return store.get('recentDatabase', null);
});

ipcMain.handle('set-recent-database', (event, filePath) => {
  store.set('recentDatabase', filePath);
});

ipcMain.handle('clear-recent-database', () => {
  store.delete('recentDatabase');
});

// Settings management
ipcMain.handle('get-setting', (event, key, defaultValue = null) => {
  return store.get(key, defaultValue);
});

ipcMain.handle('set-setting', (event, key, value) => {
  store.set(key, value);
});

// Handle file opening from command line
ipcMain.handle('get-pending-file', () => {
  const file = pendingFileToOpen;
  pendingFileToOpen = null; // Clear after retrieving
  return file;
});

// Multi-window support
function createNewWindow(filePath = null, startupAction = null) {
  const newWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hidden',
    frame: false,
    show: false
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, 'index.html')}`;
  
  newWindow.loadURL(startUrl);

  newWindow.once('ready-to-show', () => {
    newWindow.show();
    
    // If we have a file to open, send it to the new window once it's ready
    if (filePath) {
      setTimeout(() => {
        newWindow.webContents.send('open-file', filePath);
      }, 1000); // Small delay to ensure the app is fully loaded
    }
  });

  // Security: Prevent new window creation from renderer
  newWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Track window and startup action
  allWindows.add(newWindow);
  if (startupAction) {
    windowStartupActions.set(newWindow.id, startupAction);
  }

  newWindow.on('closed', () => {
    allWindows.delete(newWindow);
    windowStartupActions.delete(newWindow.id);
  });

  if (isDev) {
    newWindow.webContents.openDevTools();
  }

  return newWindow;
}

// IPC handler for creating new windows
ipcMain.handle('create-new-window', async (event, options = {}) => {
  try {
    const newWindow = createNewWindow(options.filePath);
    return { success: true, windowId: newWindow.id };
  } catch (error) {
    console.error('Error creating new window:', error);
    return { success: false, error: error.message };
  }
});

// Handle new database in new window
ipcMain.handle('create-new-database-window', async (event) => {
  try {
    const newWindow = createNewWindow();
    // Send a message to create a new database once the window is ready
    newWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        newWindow.webContents.send('menu-new-database');
      }, 500);
    });
    return { success: true, windowId: newWindow.id };
  } catch (error) {
    console.error('Error creating new database window:', error);
    return { success: false, error: error.message };
  }
});

// Handle open database in new window
ipcMain.handle('open-database-in-new-window', async (event) => {
  try {
    const newWindow = createNewWindow();
    // Send a message to open database dialog once the window is ready
    newWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        newWindow.webContents.send('menu-open-database');
      }, 500);
    });
    return { success: true, windowId: newWindow.id };
  } catch (error) {
    console.error('Error creating open database window:', error);
    return { success: false, error: error.message };
  }
});

// Handle KeePass import in new window
ipcMain.handle('import-keepass-in-new-window', async (event) => {
  try {
    const newWindow = createNewWindow(null, 'import-keepass');
    return { success: true, windowId: newWindow.id };
  } catch (error) {
    console.error('Error creating KeePass import window:', error);
    return { success: false, error: error.message };
  }
});

// Handle getting startup action for a window
ipcMain.handle('get-startup-action', async (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    const startupAction = windowStartupActions.get(window.id);
    // Clear the startup action after retrieving it
    if (startupAction) {
      windowStartupActions.delete(window.id);
    }
    return startupAction || null;
  }
  return null;
});

// Handle opening files when app is already running
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.webContents.send('open-file', filePath);
  } else {
    // If no focused window, get any available window or use main window as fallback
    const allBrowserWindows = BrowserWindow.getAllWindows();
    if (allBrowserWindows.length > 0) {
      allBrowserWindows[0].webContents.send('open-file', filePath);
    } else {
      pendingFileToOpen = filePath;
    }
  }
});


const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Database',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.webContents.send('menu-new-database');
          }
        }
      },
      {
        label: 'Open Database',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.webContents.send('menu-open-database');
          }
        }
      },
      {
        label: 'Save Database',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.webContents.send('menu-save-database');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Import from KeePass',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.webContents.send('menu-import-keepass');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Add Entry',
        accelerator: 'CmdOrCtrl+A',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.webContents.send('menu-add-entry');
          }
        }
      },
      {
        label: 'Generate Password',
        accelerator: 'CmdOrCtrl+G',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.webContents.send('menu-generate-password');
          }
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);