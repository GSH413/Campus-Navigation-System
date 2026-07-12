const fs = require('fs');
const path = require('path');

const INF = 99999999;
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const ROAD_GEOMETRY_FILE = 'road_geometry.json';

function decodeText(buffer) {
  const utf8 = buffer.toString('utf8');
  let gb18030 = utf8;

  try {
    gb18030 = new TextDecoder('gb18030').decode(buffer);
  } catch (_) {
    gb18030 = utf8;
  }

  const utf8Replacement = (utf8.match(/\uFFFD/g) || []).length;
  if (utf8Replacement === 0) {
    return utf8;
  }

  const score = (text) => {
    const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const replacement = (text.match(/\uFFFD/g) || []).length;
    const mojibake = (text.match(/[ÃÂ�]/g) || []).length;
    return cjk * 4 - replacement * 12 - mojibake * 5;
  };

  return score(gb18030) > score(utf8) ? gb18030 : utf8;
}

function readTextFile(filePath) {
  return decodeText(fs.readFileSync(filePath));
}

function extractTrailingNumber(text) {
  const match = String(text || '').match(/(-?\d+)\s*$/);
  if (!match) return null;
  return {
    value: Number(match[1]),
    rest: String(text).slice(0, match.index).trim()
  };
}

function parseSpotLine(line, index) {
  const parts = line.split('|').map((part) => part.trim());
  if (parts.length < 3 || parts[0] === '') return null;

  const id = Number(parts[0]);
  if (!Number.isInteger(id)) {
    throw new Error(`Invalid spot id on line ${index + 1}: ${line}`);
  }

  let name = parts[1] || `地点 ${id}`;
  let description = parts[2] || '';
  let x;
  let y;

  if (parts.length >= 5) {
    x = Number(parts[3]);
    y = Number(parts[4]);
  } else if (parts.length === 4) {
    const merged = extractTrailingNumber(parts[2]);
    x = merged ? merged.value : NaN;
    y = Number(parts[3]);
    description = merged ? merged.rest : parts[2];
  } else {
    const yPart = extractTrailingNumber(parts[2]);
    const xPart = yPart ? extractTrailingNumber(yPart.rest) : null;
    x = xPart ? xPart.value : NaN;
    y = yPart ? yPart.value : NaN;
    description = xPart ? xPart.rest : parts[2];
  }

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error(`Invalid spot coordinates on line ${index + 1}: ${line}`);
  }

  return { id, name, description, x, y };
}

function parseSpots(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseSpotLine)
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);
}

function parseRoads(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(/\s+/).map(Number);
      if (parts.length < 3 || parts.some((value) => !Number.isFinite(value))) {
        throw new Error(`Invalid road on line ${index + 1}: ${line}`);
      }
      return { from: parts[0], to: parts[1], distance: parts[2] };
    });
}

function getRoadKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function validateRoadGeometry(rawGeometry) {
  const validGeometry = {};
  const warnings = [];

  if (!rawGeometry || typeof rawGeometry !== 'object' || Array.isArray(rawGeometry)) {
    return {
      geometry: validGeometry,
      warnings: ['road_geometry.json root must be an object.']
    };
  }

  Object.entries(rawGeometry).forEach(([key, points]) => {
    if (!/^\d+-\d+$/.test(key)) {
      warnings.push(`Invalid road geometry key skipped: ${key}`);
      return;
    }

    if (!Array.isArray(points) || points.length < 2) {
      warnings.push(`Road geometry ${key} must contain at least two points.`);
      return;
    }

    const normalizedPoints = [];
    for (const point of points) {
      if (!Array.isArray(point) || point.length !== 2) {
        warnings.push(`Road geometry ${key} contains an invalid point.`);
        return;
      }

      const [x, y] = point.map(Number);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        warnings.push(`Road geometry ${key} contains non-finite coordinates.`);
        return;
      }

      normalizedPoints.push([x, y]);
    }

    validGeometry[key] = normalizedPoints;
  });

  return { geometry: validGeometry, warnings };
}

function loadRoadGeometry(projectRoot) {
  const geometryPath = path.join(projectRoot, 'assets', ROAD_GEOMETRY_FILE);
  if (!fs.existsSync(geometryPath)) {
    return {
      geometry: {},
      meta: {
        path: path.join('assets', ROAD_GEOMETRY_FILE),
        found: false,
        count: 0,
        warnings: [`${ROAD_GEOMETRY_FILE} not found.`]
      }
    };
  }

  try {
    const rawGeometry = JSON.parse(readTextFile(geometryPath));
    const { geometry, warnings } = validateRoadGeometry(rawGeometry);
    warnings.forEach((warning) => console.warn(warning));
    return {
      geometry,
      meta: {
        path: path.join('assets', ROAD_GEOMETRY_FILE),
        found: true,
        count: Object.keys(geometry).length,
        warnings
      }
    };
  } catch (error) {
    console.warn(`Failed to load ${ROAD_GEOMETRY_FILE}: ${error.message}`);
    return {
      geometry: {},
      meta: {
        path: path.join('assets', ROAD_GEOMETRY_FILE),
        found: true,
        count: 0,
        warnings: [error.message]
      }
    };
  }
}

function buildGraph(spots, roads) {
  const size = Math.max(...spots.map((spot) => spot.id), 0) + 1;
  const graph = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => (row === col ? 0 : INF))
  );

  roads.forEach((road) => {
    graph[road.from][road.to] = road.distance;
    graph[road.to][road.from] = road.distance;
  });

  return graph;
}

function dijkstra(spots, roads, startId, endId) {
  const graph = buildGraph(spots, roads);
  const size = graph.length;
  const dist = Array(size).fill(INF);
  const visited = Array(size).fill(false);
  const previous = Array(size).fill(-1);

  dist[startId] = 0;

  for (let i = 0; i < size; i += 1) {
    let u = -1;
    for (let j = 0; j < size; j += 1) {
      if (!visited[j] && (u === -1 || dist[j] < dist[u])) {
        u = j;
      }
    }

    if (u === -1 || dist[u] === INF) break;
    visited[u] = true;

    for (let v = 0; v < size; v += 1) {
      if (graph[u][v] !== INF && dist[u] + graph[u][v] < dist[v]) {
        dist[v] = dist[u] + graph[u][v];
        previous[v] = u;
      }
    }
  }

  if (dist[endId] === INF) {
    return { reachable: false, distance: INF, path: [] };
  }

  const pathIds = [];
  let current = endId;
  while (current !== -1) {
    pathIds.push(current);
    current = previous[current];
  }
  pathIds.reverse();

  return { reachable: true, distance: dist[endId], path: pathIds };
}

function findCampusMap(projectRoot) {
  const candidates = [path.join(projectRoot, 'assets'), path.join(projectRoot, 'frontend', 'assets')];
  const images = [];

  candidates.forEach((dir) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .forEach((entry) => {
        const filePath = path.join(dir, entry.name);
        const stat = fs.statSync(filePath);
        images.push({ name: entry.name, path: filePath, size: stat.size });
      });
  });

  if (images.length === 0) return null;
  images.sort((a, b) => {
    const aScore = /地图|map|campus|校/i.test(a.name) ? 1 : 0;
    const bScore = /地图|map|campus|校/i.test(b.name) ? 1 : 0;
    return bScore - aScore || b.size - a.size;
  });
  return images[0];
}

function loadCampusData(projectRoot) {
  const spotsPath = path.join(projectRoot, 'assets', 'spots.txt');
  const roadsPath = path.join(projectRoot, 'assets', 'roads.txt');
  const spots = parseSpots(readTextFile(spotsPath));
  const roads = parseRoads(readTextFile(roadsPath));
  const roadGeometry = loadRoadGeometry(projectRoot);
  const map = findCampusMap(projectRoot);

  return {
    spots,
    roads,
    roadGeometry: roadGeometry.geometry,
    roadGeometryMeta: roadGeometry.meta,
    map: map ? { name: map.name, size: map.size } : null,
    stats: {
      spotCount: spots.length,
      roadCount: roads.length,
      roadGeometryCount: roadGeometry.meta.count
    }
  };
}

module.exports = {
  INF,
  parseSpots,
  parseRoads,
  getRoadKey,
  validateRoadGeometry,
  loadRoadGeometry,
  buildGraph,
  dijkstra,
  findCampusMap,
  loadCampusData
};


