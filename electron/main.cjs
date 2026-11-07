const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('node:path');
let server;
if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => { const window = BrowserWindow.getAllWindows()[0]; if (window) { if (window.isMinimized()) window.restore(); window.focus(); } });
app.whenReady().then(async () => {
  const { startServer } = await import('../server/index.js');
  // A stable origin keeps IndexedDB libraries available across desktop restarts.
  const running = await startServer({ port: 4174, host: '127.0.0.1' });
  server = running.server;
  const origin = new URL(running.url).origin;
  function createWindow() {
    const window = new BrowserWindow({ width: 1440, height: 940, minWidth: 360, minHeight: 600, backgroundColor: '#080808', icon: path.join(__dirname, '../dist/icon-512.png'), autoHideMenuBar: true, webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true } });
    window.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
    window.webContents.on('will-navigate', (event, url) => { if (new URL(url).origin !== origin) { event.preventDefault(); if (/^https:\/\//.test(url)) shell.openExternal(url); } });
    window.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    window.loadURL(origin);
  }
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
}).catch(error => { dialog.showErrorBox('Mochy could not start', error.code === 'EADDRINUSE' ? 'Port 4174 is already in use. Close the other service and reopen Mochy.' : error.message); app.quit(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => server?.close());
