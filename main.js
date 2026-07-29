const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.yamithr.etc-calculator');
}

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon.ico');
  let winIcon;
  try {
    winIcon = nativeImage.createFromPath(iconPath);
    if (winIcon.isEmpty()) winIcon = undefined;
  } catch {
    winIcon = undefined;
  }

  const win = new BrowserWindow({
    width: 1000,
    height: 720,
    minWidth: 720,
    minHeight: 520,
    icon: winIcon || path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
