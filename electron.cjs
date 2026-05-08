const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file for development and production
dotenv.config();

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Required for reading local embroidery files and previews
      preload: path.join(__dirname, 'electron.cjs'), // In simple cases we can self-reference or omit if no IPC
    },
    title: "EmbroVision",
    icon: path.join(__dirname, 'public', 'icon.ico')
  });

  // Check if we are in development or production
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log('Loading production file:', indexPath);
    win.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
    });
    // Temporarily open DevTools in production to debug blank screen
    win.webContents.openDevTools();
  }

  // Error logging for loading failures
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`Failed to load URL: ${validatedURL}`);
    console.error(`Error Code: ${errorCode} (${errorDescription})`);
  });

  // Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' file: data: blob:; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' file: blob:; " +
          "style-src 'self' 'unsafe-inline' file:; " +
          "img-src 'self' file: data: blob:; " +
          "connect-src 'self' https://generativelanguage.googleapis.com"
        ]
      }
    });
  });

  win.on('page-title-updated', (e) => e.preventDefault());
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
