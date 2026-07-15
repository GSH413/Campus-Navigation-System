const fs = require('fs');
const path = require('path');
const { loadCampusData, parseSpots, parseRoads, getRoadKey, findCampusMap, loadRoadGeometry } = require('./data-adapter');

const projectRoot = path.resolve(__dirname, '..');
const spotsPath = path.join(projectRoot, 'assets', 'spots.txt');
const roadsPath = path.join(projectRoot, 'assets', 'roads.txt');
const geometryPath = path.join(projectRoot, 'assets', 'road_geometry.json');
const dataDir = path.join(__dirname, 'data');
const closedPath = path.join(dataDir, 'closed_roads.json');
const backupDir = path.join(__dirname, 'backups');

function authenticate(password) { return typeof password === 'string' && password === 'admin123'; }
function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${label}必须是有限数字。`);
  return number;
}
function integer(value, label) {
  const number = finiteNumber(value, label);
  if (!Number.isInteger(number)) throw new Error(`${label}必须是整数。`);
  return number;
}
function readClosed() {
  if (!fs.existsSync(closedPath)) return {};
  const value = JSON.parse(fs.readFileSync(closedPath, 'utf8'));
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function rotateBackups(filePath) {
  fs.mkdirSync(backupDir, { recursive: true });
  const base = path.basename(filePath);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(filePath, path.join(backupDir, `${base}.${stamp}.bak`));
  fs.readdirSync(backupDir).filter((name) => name.startsWith(`${base}.`)).sort().reverse().slice(5)
    .forEach((name) => fs.unlinkSync(path.join(backupDir, name)));
}
function atomicWrite(filePath, content, validate) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath)) rotateBackups(filePath);
  const temp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  try {
    fs.writeFileSync(temp, content, 'utf8');
    validate(fs.readFileSync(temp, 'utf8'));
    fs.renameSync(temp, filePath);
  } catch (error) {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    throw error;
  }
}
function serializeSpots(spots) { return `${spots.map((s) => `${s.id}|${s.name}|${s.description}|${s.x}|${s.y}`).join('\n')}\n`; }
function serializeRoads(roads) { return `${roads.map((r) => `${r.from} ${r.to} ${r.distance}`).join('\n')}\n`; }
function saveSpots(spots) { atomicWrite(spotsPath, serializeSpots(spots), (text) => { if (parseSpots(text).length !== spots.length) throw new Error('地点文件校验失败。'); }); }
function saveRoads(roads) { atomicWrite(roadsPath, serializeRoads(roads), (text) => { if (parseRoads(text).length !== roads.length) throw new Error('道路文件校验失败。'); }); }
function saveClosed(closed) { atomicWrite(closedPath, `${JSON.stringify(closed, null, 2)}\n`, JSON.parse); }
function roadInput(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('无效道路参数。');
  return { from: integer(payload.from, '起点'), to: integer(payload.to, '终点'), distance: finiteNumber(payload.distance, '距离') };
}
function assertEndpoints(data, from, to) {
  const ids = new Set(data.spots.map((s) => s.id));
  if (!ids.has(from) || !ids.has(to)) throw new Error('起点或终点不存在。');
  if (from === to) throw new Error('起点不能与终点相同。');
}
function loadGeometryRaw() {
  try { return JSON.parse(fs.readFileSync(geometryPath, 'utf8')); } catch (_) { return {}; }
}
function imageSize(filePath) {
  const data = fs.readFileSync(filePath);
  if (data.toString('ascii', 1, 4) === 'PNG') return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  return null;
}
function validation(spots, roads, geometry, parseErrors = []) {
  const ids = new Set(spots.map((s) => s.id));
  const adjacency = new Map(spots.map((s) => [s.id, new Set()]));
  const invalidRoads = [...parseErrors], duplicates = [], seen = new Set();
  roads.forEach((r, index) => {
    const key = getRoadKey(r.from, r.to);
    if (!ids.has(r.from) || !ids.has(r.to)) invalidRoads.push({ line: index + 1, reason: '地点 ID 不存在', ...r });
    else if (r.from === r.to) invalidRoads.push({ line: index + 1, reason: '起终点相同', ...r });
    else if (!(r.distance > 0)) invalidRoads.push({ line: index + 1, reason: '距离必须大于 0', ...r });
    else { adjacency.get(r.from).add(r.to); adjacency.get(r.to).add(r.from); }
    if (seen.has(key)) duplicates.push({ key, ...r }); else seen.add(key);
  });
  const isolated = spots.filter((s) => adjacency.get(s.id).size === 0);
  const visited = new Set();
  if (spots.length) {
    const queue = [spots[0].id]; visited.add(spots[0].id);
    while (queue.length) adjacency.get(queue.shift()).forEach((next) => { if (!visited.has(next)) { visited.add(next); queue.push(next); } });
  }
  const roadKeys = new Set(roads.map((r) => getRoadKey(r.from, r.to)));
  const geometryKeys = Object.keys(geometry);
  const missingGeometry = [...roadKeys].filter((key) => !Object.hasOwn(geometry, key));
  const extraGeometry = geometryKeys.filter((key) => !roadKeys.has(key));
  const invalidGeometry = geometryKeys.filter((key) => !Array.isArray(geometry[key]) || geometry[key].length < 2 || geometry[key].some((p) => !Array.isArray(p) || p.length !== 2 || p.some((v) => !Number.isFinite(Number(v)))));
  const coordinateGroups = new Map();
  spots.forEach((s) => { const key = `${s.x},${s.y}`; coordinateGroups.set(key, [...(coordinateGroups.get(key) || []), s]); });
  const duplicateCoordinates = [...coordinateGroups.entries()].filter(([, list]) => list.length > 1).map(([coordinate, list]) => ({ coordinate, spots: list }));
  const map = findCampusMap(projectRoot); const bounds = map ? imageSize(map.path) : null;
  const invalidCoordinates = spots.filter((s) => !Number.isFinite(s.x) || !Number.isFinite(s.y) || s.x < 0 || s.y < 0);
  const outOfBounds = bounds ? spots.filter((s) => s.x > bounds.width || s.y > bounds.height) : [];
  return { connected: spots.length > 0 && visited.size === spots.length, visitedCount: visited.size, unvisited: spots.filter((s) => !visited.has(s.id)), isolated, invalidRoads, duplicates, missingGeometry, extraGeometry, invalidGeometry, invalidCoordinates, duplicateCoordinates, outOfBounds, mapBounds: bounds };
}
function loadAdminData() {
  let data, roadParseErrors = [];
  try { data = loadCampusData(projectRoot); }
  catch (error) {
    const spots = parseSpots(fs.readFileSync(spotsPath, 'utf8'));
    const roads = [];
    fs.readFileSync(roadsPath, 'utf8').split(/\r?\n/).forEach((line, index) => {
      if (!line.trim()) return;
      const parts = line.trim().split(/\s+/).map(Number);
      if (parts.length !== 3 || parts.some((value) => !Number.isFinite(value))) roadParseErrors.push({ line: index + 1, reason: `无法解析：${line}` });
      else roads.push({ from: parts[0], to: parts[1], distance: parts[2] });
    });
    const roadGeometry = loadRoadGeometry(projectRoot), map = findCampusMap(projectRoot);
    data = { spots, roads, roadGeometry: roadGeometry.geometry, roadGeometryMeta: roadGeometry.meta, map: map ? { name: map.name, size: map.size } : null, stats: { spotCount: spots.length, roadCount: roads.length, roadGeometryCount: roadGeometry.meta.count }, loadWarning: error.message };
  }
  const geometry = loadGeometryRaw(), closed = readClosed();
  return { ...data, closedRoads: Object.values(closed), validation: validation(data.spots, data.roads, geometry, roadParseErrors), stats: { ...data.stats, closedCount: Object.keys(closed).length } };
}
function updateSpot(payload) {
  const data = loadCampusData(projectRoot); const id = integer(payload?.id, 'ID'); const spot = data.spots.find((s) => s.id === id);
  if (!spot) throw new Error('地点不存在。');
  const name = String(payload.name || '').trim(), description = String(payload.description || '').trim();
  if (!name || !description) throw new Error('名称和简介不能为空。');
  if (/[|\r\n]/.test(name) || /[|\r\n]/.test(description)) throw new Error('名称和简介不能包含竖线或换行。');
  if (data.spots.some((s) => s.id !== id && s.name === name)) throw new Error('地点名称不能完全重复。');
  Object.assign(spot, { name, description, x: finiteNumber(payload.x, 'x 坐标'), y: finiteNumber(payload.y, 'y 坐标') });
  if (spot.x < 0 || spot.y < 0) throw new Error('坐标不能小于 0。');
  saveSpots(data.spots); return { ok: true, coordinateChanged: spot.x !== Number(payload.originalX) || spot.y !== Number(payload.originalY) };
}
function addRoad(payload) {
  const data = loadCampusData(projectRoot); const road = roadInput(payload); assertEndpoints(data, road.from, road.to);
  if (!(road.distance > 0)) throw new Error('距离必须大于 0。');
  const key = getRoadKey(road.from, road.to); if (data.roads.some((r) => getRoadKey(r.from, r.to) === key) || Object.hasOwn(readClosed(), key)) throw new Error('两点之间已经存在道路或处于关闭状态。');
  data.roads.push(road); saveRoads(data.roads); return { ok: true, missingGeometry: !Object.hasOwn(loadGeometryRaw(), key) };
}
function updateRoad(payload) {
  const data = loadCampusData(projectRoot); const road = roadInput(payload); if (!(road.distance > 0)) throw new Error('距离必须大于 0。');
  const key = getRoadKey(road.from, road.to), found = data.roads.find((r) => getRoadKey(r.from, r.to) === key); if (!found) throw new Error('道路不存在。');
  found.distance = road.distance; saveRoads(data.roads); return { ok: true };
}
function closeRoad(payload) {
  const data = loadCampusData(projectRoot); const from = integer(payload?.from, '起点'), to = integer(payload?.to, '终点'); const key = getRoadKey(from, to);
  const index = data.roads.findIndex((r) => getRoadKey(r.from, r.to) === key); if (index < 0) throw new Error('道路不存在或已经关闭。');
  const [road] = data.roads.splice(index, 1), closed = readClosed(); closed[key] = { ...road, closedAt: new Date().toISOString() };
  saveRoads(data.roads); try { saveClosed(closed); } catch (error) { saveRoads([...data.roads, road]); throw error; } return { ok: true };
}
function restoreRoad(payload) {
  const data = loadCampusData(projectRoot); const key = getRoadKey(integer(payload?.from, '起点'), integer(payload?.to, '终点')), closed = readClosed(), road = closed[key];
  if (!road) throw new Error('未找到已关闭道路。'); if (data.roads.some((r) => getRoadKey(r.from, r.to) === key)) throw new Error('该道路已经恢复。');
  saveRoads([...data.roads, { from: road.from, to: road.to, distance: road.distance }]); delete closed[key]; saveClosed(closed); return { ok: true };
}

module.exports = { authenticate, loadAdminData, updateSpot, addRoad, updateRoad, closeRoad, restoreRoad, validation };
