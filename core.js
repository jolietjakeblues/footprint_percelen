(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FootprintCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function stripCrs(wkt) {
    return String(wkt || '').trim().replace(/^<[^>]+>\s*/, '').replace(/^SRID=\d+\s*;\s*/i, '');
  }
  function splitTopLevel(value) {
    const parts = []; let depth = 0; let start = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === '(') depth++;
      else if (value[i] === ')') depth--;
      else if (value[i] === ',' && depth === 0) { parts.push(value.slice(start, i).trim()); start = i + 1; }
    }
    parts.push(value.slice(start).trim());
    return parts.filter(Boolean);
  }
  function unwrap(value) {
    const text = value.trim();
    return text[0] === '(' && text[text.length - 1] === ')' ? text.slice(1, -1).trim() : text;
  }
  function parseCoordinates(value) {
    return splitTopLevel(value).map(pair => {
      const numbers = pair.trim().split(/\s+/).map(Number);
      if (numbers.length < 2 || !Number.isFinite(numbers[0]) || !Number.isFinite(numbers[1])) throw new Error('Ongeldige WKT-coördinaat');
      return [numbers[1], numbers[0]];
    });
  }
  function parseWKT(wkt) {
    const text = stripCrs(wkt);
    const match = text.match(/^(POINT|POLYGON|MULTIPOLYGON)(?:\s+Z(?:M)?|\s+M)?\s*(\(.*\))$/is);
    if (!match) return null;
    const type = match[1].toUpperCase();
    try {
      if (type === 'POINT') {
        const coordinates = parseCoordinates(unwrap(match[2]));
        return coordinates.length === 1 ? { type: 'Point', latlng: coordinates[0] } : null;
      }
      if (type === 'POLYGON') {
        const rings = splitTopLevel(unwrap(match[2])).map(ring => parseCoordinates(unwrap(ring)));
        return rings.length ? { type: 'Polygon', rings } : null;
      }
      const polys = splitTopLevel(unwrap(match[2])).map(poly => splitTopLevel(unwrap(poly)).map(ring => parseCoordinates(unwrap(ring))));
      return polys.length ? { type: 'MultiPolygon', polys } : null;
    } catch (_) { return null; }
  }
  function pointInRing(point, ring) {
    const x = point[0], y = point[1]; let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function pointInPolygon(point, rings) {
    return Boolean(rings && rings[0] && pointInRing(point, rings[0]) && !rings.slice(1).some(ring => pointInRing(point, ring)));
  }
  function pointInGeometry(point, geometry) {
    if (!geometry || !['Polygon', 'MultiPolygon'].includes(geometry.type)) return false;
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
    return polygons.some(rings => pointInPolygon(point, rings));
  }
  function pointSegmentDistance(point, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1]; const length2 = dx * dx + dy * dy;
    const t = length2 ? Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / length2)) : 0;
    return Math.hypot(point[0] - (a[0] + t * dx), point[1] - (a[1] + t * dy));
  }
  function distanceToGeometry(point, geometry) {
    if (!geometry) return Infinity;
    if (pointInGeometry(point, geometry)) return 0;
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates; let best = Infinity;
    polygons.forEach(rings => rings.forEach(ring => { for (let i = 1; i < ring.length; i++) best = Math.min(best, pointSegmentDistance(point, ring[i - 1], ring[i])); }));
    return best;
  }
  function geometryBBox(geometry) {
    if (!geometry || !geometry.coordinates) return null;
    const bounds = [Infinity, Infinity, -Infinity, -Infinity];
    (function visit(value) {
      if (Array.isArray(value) && typeof value[0] === 'number') {
        bounds[0] = Math.min(bounds[0], value[0]); bounds[1] = Math.min(bounds[1], value[1]);
        bounds[2] = Math.max(bounds[2], value[0]); bounds[3] = Math.max(bounds[3], value[1]);
      } else if (Array.isArray(value)) value.forEach(visit);
    })(geometry.coordinates);
    return bounds.every(Number.isFinite) ? bounds : null;
  }

  function selectBuilding(features, point, maxDistance = 30) {
    const ranked = (features || []).map(feature => ({ feature, distance: distanceToGeometry(point, feature.geometry) })).sort((a, b) => a.distance - b.distance);
    if (!ranked.length || ranked[0].distance > maxDistance) return null;
    return { ...ranked[0], confidence: ranked[0].distance === 0 ? 'CONTAINED' : 'NEAREST' };
  }
  function selectMonument(features, pandGeometry, maxOutsideDistance = 10) {
    const ranked = (features || []).map(feature => ({ feature, distance: feature.geometry ? distanceToGeometry(feature.geometry.coordinates, pandGeometry) : Infinity })).sort((a, b) => a.distance - b.distance);
    if (!ranked.length || ranked[0].distance > maxOutsideDistance) return null;
    return { ...ranked[0], confidence: ranked[0].distance === 0 ? 'IN_PAND' : 'NABIJ' };
  }
  function safeHttpUrl(value, allowedHosts) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || (allowedHosts && !allowedHosts.some(host => host[0] === '.' ? url.hostname.endsWith(host) : url.hostname === host))) return null;
      return url.href;
    } catch (_) { return null; }
  }
  return { parseWKT, pointInGeometry, distanceToGeometry, geometryBBox, selectBuilding, selectMonument, safeHttpUrl };
});
