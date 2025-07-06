const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || 
             !app.isPackaged;

let mainWindow;
let pendingFileToOpen = null;

function createWindow() {
  mainWindow = new BrowserWindow({
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
  
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Security: Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
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
  const result = await dialog.showSaveDialog(mainWindow, {
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
  const result = await dialog.showOpenDialog(mainWindow, {
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

// Window control handlers
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
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

// Handle file opening from command line
ipcMain.handle('get-pending-file', () => {
  const file = pendingFileToOpen;
  pendingFileToOpen = null; // Clear after retrieving
  return file;
});

// Handle opening files when app is already running
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.webContents.send('open-file', filePath);
  } else {
    pendingFileToOpen = filePath;
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
          mainWindow.webContents.send('menu-new-database');
        }
      },
      {
        label: 'Open Database',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          mainWindow.webContents.send('menu-open-database');
        }
      },
      {
        label: 'Save Database',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          mainWindow.webContents.send('menu-save-database');
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
          mainWindow.webContents.send('menu-add-entry');
        }
      },
      {
        label: 'Generate Password',
        accelerator: 'CmdOrCtrl+G',
        click: () => {
          mainWindow.webContents.send('menu-generate-password');
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);