import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaults, sanitize, randomGlyph, advance } from '../settings.js';
test('malformed saved settings fall back safely', () => {
  assert.deepEqual(sanitize(null), defaults);
  assert.deepEqual(
    sanitize({ preset: '__proto__', characters: 'constructor', speed: NaN, size: 5 }),
    defaults,
  );
});
test('ranges clamp to controls and round numeric values', () => {
  const s = sanitize({ speed: 999, density: -1, trail: 20.5 });
  assert.equal(s.speed, 140);
  assert.equal(s.density, 15);
  assert.equal(s.trail, 21);
});
test('the final glyph is selectable', () => {
  assert.equal(
    randomGlyph('ABC', () => 0.999999),
    'C',
  );
  assert.equal(
    randomGlyph('01', () => 0),
    '0',
  );
});
test('movement is independent of frame rate', () => {
  let y30 = 0,
    y120 = 0;
  for (let i = 0; i < 30; i++) y30 = advance(y30, 120, 1 / 30);
  for (let i = 0; i < 120; i++) y120 = advance(y120, 120, 1 / 120);
  assert.ok(Math.abs(y30 - y120) < 0.00001);
});
