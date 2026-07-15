const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('campusAPI', {
  loadCampusData: () => ipcRenderer.invoke('campus:load'),
  getMapAsset: () => ipcRenderer.invoke('campus:map-asset'),
  navigate: (target) => ipcRenderer.invoke('navigation:go', target),
  reloadData: () => ipcRenderer.invoke('campus:load')
});

contextBridge.exposeInMainWorld('adminAPI', {
  authenticate: (password) => ipcRenderer.invoke('admin:authenticate', password),
  logout: () => ipcRenderer.invoke('admin:logout'),
  hasSession: () => ipcRenderer.invoke('admin:session'),
  loadAdminData: () => ipcRenderer.invoke('admin:load'),
  updateSpot: (payload) => ipcRenderer.invoke('admin:update-spot', payload),
  addRoad: (payload) => ipcRenderer.invoke('admin:add-road', payload),
  updateRoad: (payload) => ipcRenderer.invoke('admin:update-road', payload),
  closeRoad: (payload) => ipcRenderer.invoke('admin:close-road', payload),
  restoreRoad: (payload) => ipcRenderer.invoke('admin:restore-road', payload),
  openGeometryTool: () => ipcRenderer.invoke('admin:open-geometry')
});
