// Min-heap (priority queue) mínimo simple
class MinHeap {
  constructor() {
    this.data = [];
  }
  _swap(i, j) {
    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
  }
  _parent(i) { return ((i - 1) >> 1); }
  _left(i) { return (i << 1) + 1; }
  _right(i) { return (i << 1) + 2; }

  push(item) { // item = {id: string|number, dist: number}
    this.data.push(item);
    let i = this.data.length - 1;
    while (i > 0) {
      let p = this._parent(i);
      if (this.data[p].dist <= this.data[i].dist) break;
      this._swap(p, i);
      i = p;
    }
  }

  pop() {
    if (this.data.length === 0) return null;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      // heapify down
      let i = 0;
      while (true) {
        let l = this._left(i), r = this._right(i), smallest = i;
        if (l < this.data.length && this.data[l].dist < this.data[smallest].dist) smallest = l;
        if (r < this.data.length && this.data[r].dist < this.data[smallest].dist) smallest = r;
        if (smallest === i) break;
        this._swap(i, smallest);
        i = smallest;
      }
    }
    return top;
  }
  isEmpty() { return this.data.length === 0; }
}

function getRouteBetween(origin, destination, allowedLocations, options = {}) {
  const { returnLinks = false } = options;

  if (!origin || !destination) return null;
  if (origin.id === destination.id) return returnLinks ? [] : [origin];

  // Crear mapa auxiliar id → Location (solo las referencias recibidas en allowedLocations)
  const idToLocation = new Map();
  for (const loc of allowedLocations) {
    if (loc && loc.id != null && !idToLocation.has(loc.id)) {
      idToLocation.set(loc.id, loc);
    }
  }

  // quick checks
  const allowedSet = new Set(idToLocation.keys());
  allowedSet.add(destination.id); // forzamos considerar el destino
  if (!allowedSet.has(origin.id)) {
    return null;
  }

  // Dijkstra structures
  const dist = new Map(); // id -> best distance found
  const prev = new Map(); // id -> { id: prevId, linkId }
  const visited = new Set();

  for (const id of allowedSet) dist.set(id, Infinity);
  dist.set(origin.id, 0);

  const heap = new MinHeap();
  heap.push({ id: origin.id, dist: 0 });

  while (!heap.isEmpty()) {
    const entry = heap.pop();
    if (!entry) break;
    const uId = entry.id;
    const dU = entry.dist;

    // Usar la referencia exacta de u
    let u = idToLocation.get(uId);
    if (!u) {
      if (uId === origin.id) u = origin;
      else if (uId === destination.id) u = destination;
    }
    if (!u) continue;

    if (dU !== dist.get(uId)) continue;
    if (visited.has(uId)) continue;
    visited.add(uId);

    if (uId === destination.id) break;

    if (!u.links || u.links.length === 0) continue;
    for (const link of u.links) {
      const locs = link.locations;
      if (!Array.isArray(locs) || locs.length < 2) continue;

      const v = (locs[0].id === uId) ? locs[1] : (locs[1].id === uId ? locs[0] : null);
      if (!v) continue;

      if (!allowedSet.has(v.id)) continue;

      const w = Number(link.distance);
      if (!Number.isFinite(w) || w < 0) continue;

      const alt = dU + w;
      if (alt < dist.get(v.id)) {
        dist.set(v.id, alt);
        prev.set(v.id, { id: uId, linkId: link.id });
        heap.push({ id: v.id, dist: alt });
      }
    }
  }

  if (!prev.has(destination.id)) return null;

  // reconstrucción de path (locations, referencias originales)
  const pathLocations = [];
  let curId = destination.id;
  while (curId && curId !== origin.id) {
    let loc = idToLocation.get(curId);
    if (!loc) {
      if (curId === origin.id) loc = origin;
      else if (curId === destination.id) loc = destination;
    }
    if (!loc) break;

    pathLocations.push(loc);
    const p = prev.get(curId);
    if (!p) break;
    curId = p.id;
  }
  pathLocations.push(origin);
  pathLocations.reverse();

  if (!returnLinks) return pathLocations;

  // reconstrucción como links (también mismas referencias)
  const pathLinks = [];
  for (let i = 0; i < pathLocations.length - 1; i++) {
    const b = pathLocations[i + 1];
    const rec = prev.get(b.id);
    if (rec && rec.linkId) {
      const a = pathLocations[i];
      const link = a.links.find(l => l.id === rec.linkId);
      if (!link) return null;
      pathLinks.push(link);
    }
  }
  return pathLinks;
}

function getLocationAreas(locations, options = {}) {
  const { ignoreMaritimLinks = true } = options;

  if (!Array.isArray(locations)) return [];

  // Map id -> Location (guardamos la PRIMERA instancia encontrada para cada id)
  const idToLocation = new Map();
  for (const loc of locations) {
    if (!loc || loc.id == null) continue;
    if (!idToLocation.has(loc.id)) {
      idToLocation.set(loc.id, loc); // guardamos la referencia tal cual viene en el array
    }
    // si ya existe esa id, ignoramos las siguientes instancias (manteniendo la primera referencia)
  }

  // Conjunto de ids válidos (solo las locations del array pasado)
  const allowedIds = new Set(idToLocation.keys());
  if (allowedIds.size === 0) return [];

  // Construir adjacency list (id -> Set<id>)
  const adj = new Map();
  for (const id of allowedIds) adj.set(id, new Set());

  // Rellenamos adjacencias basándonos en los links, pero usando ids (no referencias)
  for (const loc of idToLocation.values()) {
    if (!Array.isArray(loc.links)) continue;
    const uId = loc.id;
    for (const link of loc.links) {
      if (!link) continue;
      // si link es marítimo y la opción indica ignorarlo -> saltar
      if (link.isMaritim === true && ignoreMaritimLinks === false) continue;

      const locs = link.locations;
      if (!Array.isArray(locs) || locs.length < 2) continue;

      const aId = locs[0] && locs[0].id;
      const bId = locs[1] && locs[1].id;
      if (aId == null || bId == null) continue;

      // solo consideramos la arista si ambas ids están en el conjunto pasado
      if (!allowedIds.has(aId) || !allowedIds.has(bId)) continue;

      adj.get(aId).add(bId);
      adj.get(bId).add(aId);
    }
  }

  // Recorremos componentes conectadas con DFS iterativo
  const visited = new Set();
  const areas = [];

  for (const startId of allowedIds) {
    if (visited.has(startId)) continue;

    const stack = [startId];
    const area = [];

    visited.add(startId);
    while (stack.length) {
      const curId = stack.pop();
      const loc = idToLocation.get(curId);
      if (!loc) continue; // por seguridad; pero loc viene de idToLocation construida arriba

      // AÑADIMOS la misma instancia que llegó en el array `locations`
      area.push(loc);

      const neighbors = adj.get(curId);
      if (!neighbors) continue;
      for (const nbId of neighbors) {
        if (!visited.has(nbId)) {
          visited.add(nbId);
          stack.push(nbId);
        }
      }
    }

    areas.push(area);
  }

  return areas;
}

function getDegreesBetween(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;

  const φ1 = lat1 * toRad;
  const φ2 = lat2 * toRad;
  const Δλ = (lon2 - lon1) * toRad;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  let θ = Math.atan2(y, x) * toDeg;
  θ = (θ + 360) % 360;
  return θ;
}

function getLocationsGeoJSON(locations) {
  if (!Array.isArray(locations) || locations.length === 0 || locations.length <= 2) return null;

  const coords = [];
  const northLocation = [...locations].sort((a, b) => b.latitude - a.latitude)[0];
  let previousDegrees = 0;
  let previousLocation = northLocation;
  let currentLocation = northLocation;

  do {
    coords.push([currentLocation.longitude, currentLocation.latitude]);
    const currentLinks = currentLocation.links
      .reduce((result, link) => {
        let targetIndex = link.locations.findIndex(l => l.id !== currentLocation.id);
        let targetLocation = link.locations[targetIndex];
        if(targetLocation.id !== previousLocation.id && !link.isMaritim && targetLocation.currentState.name === northLocation.currentState.name){
          result.push({ 
            location: targetLocation,
            degrees: targetIndex === 1 ? link.degrees : (link.degrees - 180 + 360) % 360
          });
        }
        return result;
      }, [])
      .sort((a, b) => a.degrees - b.degrees);
    let targetLink = currentLinks.length === 0
      ? { location: previousLocation, degrees: previousDegrees }
      : currentLinks.find(l => l.degrees > previousDegrees) || currentLinks[0];
    previousDegrees = (targetLink.degrees - 180 + 360) % 360;
    previousLocation = currentLocation;
    currentLocation = targetLink.location;
  } while (currentLocation !== northLocation);

  return {
    type: 'Polygon',
    coordinates: [coords]
  };
}

function createSquarePolygon(position, distance) {
  const meters = distance * 1000;
  const R = 6378137;
  const degPerRad = 180 / Math.PI;
  const deltaLat = (meters / R) * degPerRad;
  const latRad = position.lat * Math.PI / 180;
  const deltaLng = (meters / (R * Math.cos(latRad))) * degPerRad;
  const lat = position.lat;
  const lng = position.lng;
  const coords = [[
    [lng + deltaLng, lat + deltaLat],
    [lng + deltaLng, lat - deltaLat],
    [lng - deltaLng, lat - deltaLat],
    [lng - deltaLng, lat + deltaLat],
    [lng + deltaLng, lat + deltaLat]
  ]];
  return {
    type: 'Polygon',
    coordinates: coords
  };
}
