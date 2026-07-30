const { app, BrowserWindow, nativeImage, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

if (process.platform === 'win32') {
  app.setAppUserModelId('com.yamithr.etc-calculator');
}

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
let config = {};

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch {}
  const defaults = {
    'shortcut-key': 'Ctrl+Shift+E',
    'theme': 'light',
    'window-width': 1000,
    'window-height': 720
  };
  for (const [key, val] of Object.entries(defaults)) {
    if (config[key] === undefined) config[key] = val;
  }
  return config;
}

function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving config:', e);
  }
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
    width: config['window-width'] || 1000,
    height: config['window-height'] || 720,
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

  win.on('resize', () => {
    const [w, h] = win.getSize();
    config['window-width'] = w;
    config['window-height'] = h;
    saveConfig();
  });

  return win;
}

function registerShortcut() {
  globalShortcut.unregisterAll();
  const shortcut = config['shortcut-key'] || 'Ctrl+Shift+E';
  try {
    globalShortcut.register(shortcut, () => {
      const wins = BrowserWindow.getAllWindows();
      if (wins.length > 0) {
        const win = wins[0];
        if (win.isMinimized()) win.restore();
        win.focus();
      } else {
        createWindow();
      }
    });
  } catch (e) {
    console.error('Failed to register shortcut:', e);
  }
}

ipcMain.handle('get-config', () => config);

ipcMain.handle('set-config', (event, updates) => {
  Object.assign(config, updates);
  saveConfig();
  if (updates['shortcut-key']) registerShortcut();
  return config;
});

ipcMain.handle('get-app-info', () => ({
  name: 'ETC Calculator',
  version: '1.0.0',
  description: 'Calculadora de tiempo estimado de carga de graneles (ETC)',
  author: 'Yamith Romero',
  email: 'yamithr@users.noreply.github.com',
  github: 'https://github.com/YamithR/ETC_Calculator',
  repo: 'https://github.com/YamithR/ETC_Calculator'
}));

app.whenReady().then(() => {
  loadConfig();
  createWindow();
  registerShortcut();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
