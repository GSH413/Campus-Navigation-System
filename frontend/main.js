const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const adminService = require('./admin-service');
const { loadCampusData, findCampusMap } = require('./data-adapter');

const projectRoot = path.resolve(__dirname, '..');
const assetsRoot = path.join(projectRoot, 'assets');

const sessions = new Set();

function senderSession(event) {
  return event.sender.id;
}

function requireAdmin(event) {
  if (!sessions.has(senderSession(event))) throw new Error('管理员会话已失效，请重新登录。');
}

function registerIpc() {
  ipcMain.handle('campus:load', () => loadCampusData(projectRoot));
  ipcMain.handle('campus:map-asset', () => {
    const map = findCampusMap(projectRoot);
    if (!map) return null;
    const resolved = path.resolve(map.path);
    const relative = path.relative(assetsRoot, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('地图资源路径无效。');
    return { name: map.name, url: pathToFileURL(resolved).toString() };
  });
  ipcMain.handle('navigation:go', (event, target) => {
    const pages = { entry: 'entry.html', user: 'index.html', admin: 'admin.html' };
    if (!Object.hasOwn(pages, target)) throw new Error('无效页面。');
    if (target === 'admin' && !sessions.has(senderSession(event))) throw new Error('请先登录。');
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) throw new Error('当前窗口不可用。');
    window.loadFile(path.join(__dirname, pages[target]));
    return true;
  });
  ipcMain.handle('admin:authenticate', (event, password) => {
    const ok = adminService.authenticate(password);
    if (ok) sessions.add(senderSession(event));
    return ok;
  });
  ipcMain.handle('admin:logout', (event) => sessions.delete(senderSession(event)));
  ipcMain.handle('admin:session', (event) => sessions.has(senderSession(event)));
  ipcMain.handle('admin:load', (event) => { requireAdmin(event); return adminService.loadAdminData(); });
  ipcMain.handle('admin:update-spot', (event, payload) => { requireAdmin(event); return adminService.updateSpot(payload); });
  ipcMain.handle('admin:add-road', (event, payload) => { requireAdmin(event); return adminService.addRoad(payload); });
  ipcMain.handle('admin:update-road', (event, payload) => { requireAdmin(event); return adminService.updateRoad(payload); });
  ipcMain.handle('admin:close-road', (event, payload) => { requireAdmin(event); return adminService.closeRoad(payload); });
  ipcMain.handle('admin:restore-road', (event, payload) => { requireAdmin(event); return adminService.restoreRoad(payload); });
  ipcMain.handle('admin:open-geometry', (event) => {
    requireAdmin(event);
    const geometryWindow = new BrowserWindow({
      width: 1400, height: 900, title: '道路几何采集工具',
      webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
    });
    geometryWindow.loadFile(path.join(__dirname, '..', 'tools', 'road-geometry-picker.html'));
    return true;
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1120,
    minHeight: 720,
    backgroundColor: '#f4f7fb',
    title: 'Campus Navigation System',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  window.loadFile(path.join(__dirname, 'entry.html'));
  const webContentsId = window.webContents.id;
  window.webContents.once('destroyed', () => sessions.delete(webContentsId));
}

app.whenReady().then(() => {
  registerIpc();
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
