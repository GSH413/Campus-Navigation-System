const state = {
  spots: [],
  roads: [],
  selectedStart: null,
  selectedEnd: null,
  activeSpotId: null,
  route: null,
  scale: 1,
  fitScale: 1,
  translate: { x: 0, y: 0 },
  natural: { width: 0, height: 0 },
  dragging: false,
  dragStart: null
};

const els = {
  dataStatus: document.getElementById('dataStatus'),
  startSelect: document.getElementById('startSelect'),
  endSelect: document.getElementById('endSelect'),
  routeButton: document.getElementById('routeButton'),
  resetButton: document.getElementById('resetButton'),
  searchInput: document.getElementById('searchInput'),
  searchResults: document.getElementById('searchResults'),
  zoomValue: document.getElementById('zoomValue'),
  zoomOutButton: document.getElementById('zoomOutButton'),
  zoomInButton: document.getElementById('zoomInButton'),
  zoomSlider: document.getElementById('zoomSlider'),
  fitButton: document.getElementById('fitButton'),
  mapViewport: document.getElementById('mapViewport'),
  mapContent: document.getElementById('mapContent'),
  campusMap: document.getElementById('campusMap'),
  routeOverlay: document.getElementById('routeOverlay'),
  markerLayer: document.getElementById('markerLayer'),
  mapPlaceholder: document.getElementById('mapPlaceholder'),
  mapTitle: document.getElementById('mapTitle'),
  mapMeta: document.getElementById('mapMeta'),
  spotDetail: document.getElementById('spotDetail'),
  routeState: document.getElementById('routeState'),
  distanceMetric: document.getElementById('distanceMetric'),
  countMetric: document.getElementById('countMetric'),
  routeSummary: document.getElementById('routeSummary'),
  routeList: document.getElementById('routeList')
};

document.getElementById('backToEntryButton').addEventListener('click', () => window.campusAPI.navigate('entry'));
document.getElementById('refreshDataButton').addEventListener('click', () => window.location.reload());
document.getElementById('exitButton').addEventListener('click', () => window.close());

function spotById(id) {
  return state.spots.find((spot) => spot.id === Number(id));
}

function buildGraph() {
  const size = Math.max(...state.spots.map((spot) => spot.id), 0) + 1;
  const graph = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => (row === col ? 0 : 99999999))
  );
  state.roads.forEach((road) => {
    graph[road.from][road.to] = road.distance;
    graph[road.to][road.from] = road.distance;
  });
  return graph;
}

function dijkstra(startId, endId) {
  const graph = buildGraph();
  const size = graph.length;
  const dist = Array(size).fill(99999999);
  const visited = Array(size).fill(false);
  const previous = Array(size).fill(-1);
  dist[startId] = 0;

  for (let i = 0; i < size; i += 1) {
    let u = -1;
    for (let j = 0; j < size; j += 1) {
      if (!visited[j] && (u === -1 || dist[j] < dist[u])) u = j;
    }
    if (u === -1 || dist[u] === 99999999) break;
    visited[u] = true;
    for (let v = 0; v < size; v += 1) {
      if (graph[u][v] !== 99999999 && dist[u] + graph[u][v] < dist[v]) {
        dist[v] = dist[u] + graph[u][v];
        previous[v] = u;
      }
    }
  }

  if (dist[endId] === 99999999) {
    return { reachable: false, distance: 99999999, path: [] };
  }

  const path = [];
  let current = endId;
  while (current !== -1) {
    path.push(current);
    current = previous[current];
  }
  path.reverse();
  return { reachable: true, distance: dist[endId], path };
}

function getRoadKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function getDirectedRoadPoints(geometry, fromId, toId) {
  const key = getRoadKey(fromId, toId);
  const points = geometry[key];

  if (!Array.isArray(points) || points.length < 2) {
    return null;
  }

  const [lowId] = key.split('-').map(Number);
  const clonedPoints = points.map((point) => [...point]);
  return fromId === lowId ? clonedPoints : clonedPoints.reverse();
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

      segmentPoints = [
        [fromSpot.x, fromSpot.y],
        [toSpot.x, toSpot.y]
      ];
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

  if (pathIds.length === 1) {
    const spot = spots.find((item) => item.id === pathIds[0]);
    if (spot) fullPoints.push([spot.x, spot.y]);
  }

  return { points: fullPoints, missingSegments };
}
function populateSelect(select, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  state.spots.forEach((spot) => {
    const option = document.createElement('option');
    option.value = spot.id;
    option.textContent = `${spot.id} · ${spot.name}`;
    select.appendChild(option);
  });
}

function renderMarkers() {
  els.markerLayer.innerHTML = '';
  state.spots.forEach((spot) => {
    const marker = document.createElement('button');
    marker.className = 'spot-marker';
    marker.type = 'button';
    marker.style.left = `${(spot.x / state.natural.width) * 100}%`;
    marker.style.top = `${(spot.y / state.natural.height) * 100}%`;
    marker.dataset.id = spot.id;
    marker.title = `${spot.name} (${spot.x}, ${spot.y})`;
    marker.innerHTML = `<span class="pin"></span><span class="marker-label">${spot.name}</span>`;
    marker.addEventListener('click', (event) => {
      event.stopPropagation();
      selectSpot(spot.id, true);
    });
    els.markerLayer.appendChild(marker);
  });
  updateMarkerStates();
}

function updateMarkerStates() {
  document.querySelectorAll('.spot-marker').forEach((marker) => {
    const id = Number(marker.dataset.id);
    marker.classList.toggle('is-start', id === state.selectedStart);
    marker.classList.toggle('is-end', id === state.selectedEnd);
    marker.classList.toggle('is-active', id === state.activeSpotId);
    marker.classList.toggle('is-route', Boolean(state.route?.path.includes(id)));
  });
}

function setStart(id) {
  state.selectedStart = Number(id);
  els.startSelect.value = String(id);
  updateMarkerStates();
}

function setEnd(id) {
  state.selectedEnd = Number(id);
  els.endSelect.value = String(id);
  updateMarkerStates();
}

function selectSpot(id, autoAssign = false) {
  const spot = spotById(id);
  if (!spot) return;
  state.activeSpotId = spot.id;

  if (autoAssign) {
    if (state.selectedStart === null || (state.selectedStart !== null && state.selectedEnd !== null)) {
      state.selectedEnd = null;
      els.endSelect.value = '';
      setStart(spot.id);
    } else if (state.selectedStart !== spot.id) {
      setEnd(spot.id);
    }
  }

  els.spotDetail.innerHTML = `
    <p class="eyebrow">Spot Detail</p>
    <h2>${spot.name}</h2>
    <p>${spot.description || '暂无地点介绍。'}</p>
    <div class="coordinate-line">ID ${spot.id} · 坐标 (${spot.x}, ${spot.y})</div>
    <div class="button-row detail-actions">
      <button class="ghost-button" type="button" data-action="start">设为起点</button>
      <button class="ghost-button" type="button" data-action="end">设为终点</button>
    </div>
  `;
  els.spotDetail.querySelector('[data-action="start"]').addEventListener('click', () => setStart(spot.id));
  els.spotDetail.querySelector('[data-action="end"]').addEventListener('click', () => setEnd(spot.id));

  updateMarkerStates();
}

function setTransform() {
  els.mapContent.style.transform = `translate(${state.translate.x}px, ${state.translate.y}px) scale(${state.scale})`;
  els.zoomSlider.value = Math.round(state.scale * 100);
  els.zoomValue.textContent = `${Math.round(state.scale * 100)}%`;
  document.body.classList.toggle('labels-compact', state.scale < 0.78);
}

function fitMap() {
  if (!state.natural.width || !state.natural.height) return;
  const viewport = els.mapViewport.getBoundingClientRect();
  state.fitScale = Math.min(viewport.width / state.natural.width, viewport.height / state.natural.height) * 0.94;
  state.scale = Math.max(0.32, Math.min(state.fitScale, 1.15));
  state.translate.x = (viewport.width - state.natural.width * state.scale) / 2;
  state.translate.y = (viewport.height - state.natural.height * state.scale) / 2;
  setTransform();
}

function zoomTo(nextScale, centerX, centerY) {
  const previousScale = state.scale;
  const scale = Math.max(0.4, Math.min(2.6, nextScale));
  const rect = els.mapViewport.getBoundingClientRect();
  const cx = centerX ?? rect.width / 2;
  const cy = centerY ?? rect.height / 2;
  const mapX = (cx - state.translate.x) / previousScale;
  const mapY = (cy - state.translate.y) / previousScale;
  state.scale = scale;
  state.translate.x = cx - mapX * scale;
  state.translate.y = cy - mapY * scale;
  setTransform();
}

function centerOnSpot(id, scale = Math.max(state.scale, 1.2)) {
  const spot = spotById(id);
  if (!spot) return;
  const rect = els.mapViewport.getBoundingClientRect();
  state.scale = Math.min(2.2, scale);
  state.translate.x = rect.width / 2 - spot.x * state.scale;
  state.translate.y = rect.height / 2 - spot.y * state.scale;
  setTransform();
  selectSpot(id, false);
}

function drawRoute() {
  els.routeOverlay.innerHTML = '';
  els.routeOverlay.setAttribute('viewBox', `0 0 ${state.natural.width} ${state.natural.height}`);

  if (!state.route?.reachable || state.route.path.length === 0) {
    return { points: [], missingSegments: [] };
  }

  const routeGeometry = buildRouteGeometry(state.route.path, state.roadGeometry, state.spots);
  state.route.missingGeometrySegments = routeGeometry.missingSegments;

  routeGeometry.missingSegments.forEach((segment) => {
    console.warn(`道路 ${segment.key} 缺少几何数据，已使用地点直线降级显示`);
  });

  if (routeGeometry.points.length === 0) {
    return routeGeometry;
  }

  const points = routeGeometry.points
    .map(([x, y]) => `${x},${y}`)
    .join(' ');

  const glow = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  glow.setAttribute('points', points);
  glow.setAttribute('class', 'route-glow');
  glow.setAttribute('fill', 'none');

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  line.setAttribute('points', points);
  line.setAttribute('class', 'route-line');
  line.setAttribute('fill', 'none');

  els.routeOverlay.append(glow, line);
  return routeGeometry;
}

function renderRouteResult() {
  const start = spotById(state.selectedStart);
  const end = spotById(state.selectedEnd);
  els.routeList.innerHTML = '';

  if (!start || !end) {
    els.routeState.textContent = '待查询';
    els.routeState.className = 'status-pill neutral';
    els.distanceMetric.textContent = '--';
    els.countMetric.textContent = '--';
    els.routeSummary.textContent = '请选择起点和终点。';
    return;
  }

  if (start.id === end.id) {
    state.route = { reachable: true, distance: 0, path: [start.id] };
  } else {
    state.route = dijkstra(start.id, end.id);
  }

  if (!state.route.reachable) {
    els.routeState.textContent = '不可达';
    els.routeState.className = 'status-pill danger';
    els.distanceMetric.textContent = '不可达';
    els.countMetric.textContent = '0';
    els.routeSummary.textContent = `${start.name} 到 ${end.name} 当前没有可达路线。`;
    drawRoute();
    updateMarkerStates();
    return;
  }

  const pathSpots = state.route.path.map(spotById).filter(Boolean);
  els.routeState.textContent = '已生成';
  els.routeState.className = 'status-pill success';
  els.distanceMetric.textContent = `${state.route.distance} 米`;
  els.countMetric.textContent = `${pathSpots.length} 个`;
  const routeText = pathSpots.map((spot) => spot.name).join(' → ');
  els.routeSummary.textContent = routeText;

  pathSpots.forEach((spot, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${index + 1}. ${spot.name}`;
    button.addEventListener('click', () => centerOnSpot(spot.id));
    item.appendChild(button);
    els.routeList.appendChild(item);
  });

  const routeGeometry = drawRoute();
  if (routeGeometry.missingSegments.length > 0) {
    const keys = routeGeometry.missingSegments.map((segment) => segment.key).join('、');
    els.routeSummary.textContent = `${routeText}\n部分道路缺少几何数据，当前路线包含临时直线段：${keys}`;
  }
  updateMarkerStates();
  centerOnSpot(pathSpots[0].id, Math.max(state.scale, state.fitScale));
}

function renderSearchResults(query = '') {
  const keyword = query.trim().toLowerCase();
  const matches = state.spots
    .filter((spot) => !keyword || spot.name.toLowerCase().includes(keyword))
    .slice(0, 8);

  els.searchResults.innerHTML = '';
  matches.forEach((spot) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<strong>${spot.name}</strong><span>${spot.description || '暂无介绍'}</span>`;
    button.addEventListener('click', () => centerOnSpot(spot.id));
    els.searchResults.appendChild(button);
  });
}

function resetRoute() {
  state.selectedStart = null;
  state.selectedEnd = null;
  state.activeSpotId = null;
  state.route = null;
  els.startSelect.value = '';
  els.endSelect.value = '';
  els.routeOverlay.innerHTML = '';
  renderRouteResult();
  updateMarkerStates();
}

function bindEvents() {
  els.startSelect.addEventListener('change', () => {
    state.selectedStart = els.startSelect.value === '' ? null : Number(els.startSelect.value);
    updateMarkerStates();
  });
  els.endSelect.addEventListener('change', () => {
    state.selectedEnd = els.endSelect.value === '' ? null : Number(els.endSelect.value);
    updateMarkerStates();
  });
  els.routeButton.addEventListener('click', renderRouteResult);
  els.resetButton.addEventListener('click', resetRoute);
  els.searchInput.addEventListener('input', () => renderSearchResults(els.searchInput.value));
  els.zoomOutButton.addEventListener('click', () => zoomTo(state.scale - 0.12));
  els.zoomInButton.addEventListener('click', () => zoomTo(state.scale + 0.12));
  els.fitButton.addEventListener('click', fitMap);
  els.zoomSlider.addEventListener('input', () => zoomTo(Number(els.zoomSlider.value) / 100));

  els.mapViewport.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = els.mapViewport.getBoundingClientRect();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    zoomTo(state.scale + delta, event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: false });

  els.mapViewport.addEventListener('pointerdown', (event) => {
    state.dragging = true;
    state.dragStart = { x: event.clientX, y: event.clientY, tx: state.translate.x, ty: state.translate.y };
    els.mapViewport.setPointerCapture(event.pointerId);
  });
  els.mapViewport.addEventListener('pointermove', (event) => {
    if (!state.dragging) return;
    state.translate.x = state.dragStart.tx + event.clientX - state.dragStart.x;
    state.translate.y = state.dragStart.ty + event.clientY - state.dragStart.y;
    setTransform();
  });
  els.mapViewport.addEventListener('pointerup', () => {
    state.dragging = false;
  });

  window.addEventListener('resize', () => {
    if (state.natural.width) fitMap();
  });
}

async function init() {
  bindEvents();
  const data = await window.campusAPI.loadCampusData();
  const mapAsset = await window.campusAPI.getMapAsset();
  state.spots = data.spots;
  state.roads = data.roads;
  state.roadGeometry = data.roadGeometry || {};
  state.roadGeometryMeta = data.roadGeometryMeta || null;

  populateSelect(els.startSelect, '请选择起点');
  populateSelect(els.endSelect, '请选择终点');
  renderSearchResults();
  els.dataStatus.textContent = `${data.stats.spotCount} 点 / ${data.stats.roadCount} 路 / ${data.stats.roadGeometryCount || 0} 几何`;

  if (!mapAsset) {
    els.mapPlaceholder.classList.remove('hidden');
    return;
  }

  els.mapTitle.textContent = mapAsset.name;
  els.campusMap.src = mapAsset.url;
  els.campusMap.addEventListener('load', () => {
    state.natural.width = els.campusMap.naturalWidth;
    state.natural.height = els.campusMap.naturalHeight;
    els.mapMeta.textContent = ` · ${state.natural.width} × ${state.natural.height}`;
    els.mapContent.style.width = `${state.natural.width}px`;
    els.mapContent.style.height = `${state.natural.height}px`;
    els.routeOverlay.setAttribute('viewBox', `0 0 ${state.natural.width} ${state.natural.height}`);
    renderMarkers();
    fitMap();
  });
}

init().catch((error) => {
  console.error(error);
  els.dataStatus.textContent = '加载失败';
  els.routeSummary.textContent = error.message;
});
