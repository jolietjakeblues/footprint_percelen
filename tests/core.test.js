const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core.js');

const square = {
  type: 'Polygon',
  coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]
};

test('parseWKT accepteert CRS-prefixen, spaties en polygon-gaten', () => {
  const parsed = core.parseWKT('<http://www.opengis.net/def/crs/EPSG/0/4326> POLYGON ((4 52, 5 52, 5 53, 4 52), (4.2 52.2, 4.3 52.2, 4.2 52.2))');
  assert.equal(parsed.type, 'Polygon');
  assert.equal(parsed.rings.length, 2);
  assert.deepEqual(parsed.rings[0][0], [52, 4]);
});

test('parseWKT verwerkt multipolygonen met variabele witruimte', () => {
  const parsed = core.parseWKT('MULTIPOLYGON (((4 52,5 52,4 52)), ((6 53,7 53,6 53)))');
  assert.equal(parsed.type, 'MultiPolygon');
  assert.equal(parsed.polys.length, 2);
});

test('selectBuilding kiest het bevattende pand, niet de bronvolgorde', () => {
  const ver = { type: 'Polygon', coordinates: [[[50, 50], [60, 50], [60, 60], [50, 60], [50, 50]]] };
  const result = core.selectBuilding([{ id: 'ver', geometry: ver }, { id: 'goed', geometry: square }], [5, 5]);
  assert.equal(result.feature.id, 'goed');
  assert.equal(result.confidence, 'CONTAINED');
});

test('selectBuilding weigert een willekeurig eerste pand buiten de marge', () => {
  assert.equal(core.selectBuilding([{ geometry: square }], [100, 100], 30), null);
});

test('selectMonument onderscheidt binnen-pand en nabijheidsindicatie', () => {
  const inside = core.selectMonument([{ id: 'in', geometry: { type: 'Point', coordinates: [5, 5] } }], square);
  const near = core.selectMonument([{ id: 'nabij', geometry: { type: 'Point', coordinates: [15, 5] } }], square, 10);
  assert.equal(inside.confidence, 'IN_PAND');
  assert.equal(near.confidence, 'NABIJ');
});

test('safeHttpUrl blokkeert scripts, http en onverwachte hosts', () => {
  assert.equal(core.safeHttpUrl('javascript:alert(1)'), null);
  assert.equal(core.safeHttpUrl('http://monumentenregister.cultureelerfgoed.nl/monumenten/1'), null);
  assert.equal(core.safeHttpUrl('https://example.com/', ['monumentenregister.cultureelerfgoed.nl']), null);
  assert.match(core.safeHttpUrl('https://monumentenregister.cultureelerfgoed.nl/monumenten/1', ['monumentenregister.cultureelerfgoed.nl']), /^https:/);
});
