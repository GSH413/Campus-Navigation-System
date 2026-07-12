const path = require('path');
const { loadCampusData, dijkstra, getRoadKey } = require('./data-adapter');

const projectRoot = path.resolve(__dirname, '..');
const data = loadCampusData(projectRoot);

function findByIncludes(keyword) {
  return data.spots.find((spot) => spot.name.includes(keyword));
}

function getDirectedRoadPoints(geometry, fromId, toId) {
  const key = getRoadKey(fromId, toId);
  const points = geometry[key];
  if (!Array.isArray(points) || points.length < 2) return null;
  const [lowId] = key.split('-').map(Number);
  const cloned = points.map((point) => [...point]);
  return fromId === lowId ? cloned : cloned.reverse();
}

function buildRouteGeometry(pathIds, roadGeometry, spots) {
  const fullPoints = [];
  const missingSegments = [];

  for (let i = 0; i < pathIds.length - 1; i += 1) {
    const fromId = pathIds[i];
    const toId = pathIds[i + 1];
    let segmentPoints = getDirectedRoadPoints(roadGeometry, fromId, toId);

    if (!segmentPoints) {
      const key = getRoadKey(fromId, toId);
      missingSegments.push({ fromId, toId, key });
      const fromSpot = spots.find((spot) => spot.id === fromId);
      const toSpot = spots.find((spot) => spot.id === toId);
      if (!fromSpot || !toSpot) continue;
      segmentPoints = [[fromSpot.x, fromSpot.y], [toSpot.x, toSpot.y]];
    }

    if (fullPoints.length > 0 && segmentPoints.length > 0) {
      const [lastX, lastY] = fullPoints[fullPoints.length - 1];
      const [firstX, firstY] = segmentPoints[0];
      if (lastX === firstX && lastY === firstY) {
        segmentPoints = segmentPoints.slice(1);
      }
    }

    fullPoints.push(...segmentPoints);
  }

  return { points: fullPoints, missingSegments };
}

const start = findByIncludes('大门') || data.spots[0];
const end = findByIncludes('春语园') || data.spots[data.spots.length - 1];
const result = dijkstra(data.spots, data.roads, start.id, end.id);
const names = result.path.map((id) => data.spots.find((spot) => spot.id === id)?.name || id);
const geometryRoute = buildRouteGeometry(result.path, data.roadGeometry, data.spots);

const forward = getDirectedRoadPoints(data.roadGeometry, 0, 5);
const reverse = getDirectedRoadPoints(data.roadGeometry, 5, 0);
const simulatedMissing = buildRouteGeometry([0, 5], {}, data.spots);

console.log(`spots=${data.stats.spotCount}`);
console.log(`roads=${data.stats.roadCount}`);
console.log(`road_geometry=${data.roadGeometryMeta.path}`);
console.log(`road_geometry_count=${data.stats.roadGeometryCount}`);
console.log(`map=${data.map ? data.map.name : 'missing'}`);
console.log(`case=${start.name}->${end.name}`);
console.log(`reachable=${result.reachable}`);
console.log(`distance=${result.distance}`);
console.log(`path=${names.join(' -> ')}`);
console.log(`route_geometry_points=${geometryRoute.points.length}`);
console.log(`missing_segments=${geometryRoute.missingSegments.map((segment) => segment.key).join(',') || 'none'}`);
console.log(`forward_0_5_points=${forward ? forward.length : 0}`);
console.log(`reverse_5_0_first=${reverse ? reverse[0].join(',') : 'missing'}`);
console.log(`simulated_missing=${simulatedMissing.missingSegments.map((segment) => segment.key).join(',')}`);

const same = dijkstra(data.spots, data.roads, start.id, start.id);
console.log(`same_point_distance=${same.distance}`);
console.log(`same_point_path=${same.path.join(' -> ')}`);

if (!data.stats.spotCount || !data.stats.roadCount || !data.stats.roadGeometryCount) {
  process.exitCode = 1;
}
