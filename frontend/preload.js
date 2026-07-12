const { contextBridge } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const { loadCampusData, findCampusMap } = require('./data-adapter');

const projectRoot = path.resolve(__dirname, '..');
const assetsRoot = path.join(projectRoot, 'assets');

function assertInsideAssets(filePath) {
  const resolved = path.resolve(filePath);
  const relative = path.relative(assetsRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Blocked access outside project assets.');
  }
  return resolved;
}

contextBridge.exposeInMainWorld('campusAPI', {
  loadCampusData: async () => loadCampusData(projectRoot),
  getMapAsset: async () => {
    const map = findCampusMap(projectRoot);
    if (!map) return null;
    const safePath = assertInsideAssets(map.path);
    return {
      name: map.name,
      url: pathToFileURL(safePath).toString()
    };
  }
});
