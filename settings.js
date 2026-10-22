export const defaults = Object.freeze({
  preset: 'green',
  speed: 60,
  density: 65,
  size: 18,
  characters: 'mixed',
  trail: 70,
});
export const palettes = { green: '#8fe68f', amber: '#f5b45d', ice: '#8cd9f2' };
export const glyphs = {
  latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  binary: '01',
  kana: 'アイウエオカキクケコサシスセソタチツテトナニヌネノ',
  mixed: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アイウエオカキクケコ',
};
export function sanitize(value = {}) {
  if (!value || typeof value !== 'object') value = {};
  const number = (key, min, max) =>
    Number.isFinite(value[key])
      ? Math.min(max, Math.max(min, Math.round(value[key])))
      : defaults[key];
  return {
    preset: Object.hasOwn(palettes, value.preset) ? value.preset : defaults.preset,
    speed: number('speed', 20, 140),
    density: number('density', 15, 100),
    size: [14, 18, 24].includes(value.size) ? value.size : defaults.size,
    characters: Object.hasOwn(glyphs, value.characters) ? value.characters : defaults.characters,
    trail: number('trail', 10, 95),
  };
}
export function randomGlyph(characters, random = Math.random) {
  return characters[Math.floor(random() * characters.length)];
}
export function advance(y, pixelsPerSecond, deltaSeconds) {
  return y + pixelsPerSecond * deltaSeconds;
}
