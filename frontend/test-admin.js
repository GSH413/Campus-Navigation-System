const fs = require('fs');
const path = require('path');
const service = require('./admin-service');
const { loadCampusData, getRoadKey } = require('./data-adapter');

const root = path.resolve(__dirname, '..');
const files = [path.join(root, 'assets', 'spots.txt'), path.join(root, 'assets', 'roads.txt'), path.join(__dirname, 'data', 'closed_roads.json')];
const originals = new Map(files.map((file) => [file, fs.existsSync(file) ? fs.readFileSync(file) : null]));
const backupDir = path.join(__dirname, 'backups');
const originalBackups = new Set(fs.existsSync(backupDir) ? fs.readdirSync(backupDir) : []);
function assert(condition, message) { if (!condition) throw new Error(message); }
async function expectReject(fn, message) { try { fn(); } catch (_) { return; } throw new Error(message); }

try {
  const initial = service.loadAdminData();
  assert(service.authenticate('admin123'), '管理员密码应与 C++ 保持一致');
  assert(!service.authenticate('wrong'), '错误密码不应通过');
  assert(initial.validation.visitedCount > 0, 'BFS 应访问地点');
  assert(initial.validation.mapBounds?.width > 0 && initial.validation.mapBounds?.height > 0, '应从真实 PNG 读取地图尺寸');

  const first = initial.spots[0];
  service.updateSpot({ ...first, description: `${first.description} 测试含 空格`, originalX: first.x, originalY: first.y });
  assert(loadCampusData(root).spots[0].description.endsWith('测试含 空格'), '中文和空格写入失败');
  service.updateSpot({ ...first, originalX: first.x, originalY: first.y });
  expectReject(() => service.updateSpot({ ...first, name: '', originalX: first.x, originalY: first.y }), '空名称应被拒绝');

  const ids = initial.spots.map((s) => s.id); let pair;
  for (const from of ids) for (const to of ids) if (from < to && !initial.roads.some((r) => getRoadKey(r.from, r.to) === getRoadKey(from, to))) { pair = { from, to }; break; }
  service.addRoad({ ...pair, distance: 123.5 });
  expectReject(() => service.addRoad({ ...pair, distance: 123.5 }), '重复道路应被拒绝');
  service.updateRoad({ ...pair, distance: 140 });
  assert(loadCampusData(root).roads.some((r) => getRoadKey(r.from, r.to) === getRoadKey(pair.from, pair.to) && r.distance === 140), '距离修改失败');
  service.closeRoad(pair);
  assert(!loadCampusData(root).roads.some((r) => getRoadKey(r.from, r.to) === getRoadKey(pair.from, pair.to)), '关闭道路仍在图中');
  service.restoreRoad(pair);
  assert(loadCampusData(root).roads.some((r) => getRoadKey(r.from, r.to) === getRoadKey(pair.from, pair.to)), '恢复道路失败');
  expectReject(() => service.addRoad({ from: -1, to: 2, distance: 1 }), '非法端点应被拒绝');
  console.log('admin_auth=pass'); console.log('spot_atomic_write=pass'); console.log('road_add_update_close_restore=pass'); console.log('validation_bfs_geometry_bounds=pass'); console.log('invalid_payloads=pass');
} finally {
  originals.forEach((buffer, file) => { if (buffer === null) { if (fs.existsSync(file)) fs.unlinkSync(file); } else fs.writeFileSync(file, buffer); });
  if (fs.existsSync(backupDir)) fs.readdirSync(backupDir).filter((name) => !originalBackups.has(name)).forEach((name) => fs.unlinkSync(path.join(backupDir, name)));
  console.log('source_data_restored=true');
}
