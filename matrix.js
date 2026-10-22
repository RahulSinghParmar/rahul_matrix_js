import { defaults, palettes, glyphs, sanitize, randomGlyph, advance } from './settings.js';
const $ = (id) => document.getElementById(id);
const canvas = $('canvas');
const ctx = canvas.getContext('2d');
let storage, saved;
try {
  storage = localStorage;
  saved = JSON.parse(storage.getItem('signal-v1'));
} catch {
  storage = null;
}
let settings = sanitize(saved);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let running = !reduced.matches,
  frame = 0,
  previous = 0,
  width = 0,
  height = 0,
  particles = [];
function persist() {
  try {
    storage?.setItem('signal-v1', JSON.stringify(settings));
  } catch {
    $('notice').textContent =
      'Settings cannot be saved, but the studio still works in this session.';
  }
}
function clear() {
  if (ctx) {
    ctx.fillStyle = '#050a07';
    ctx.fillRect(0, 0, width, height);
  }
}
function seed() {
  const columns = Math.ceil(width / settings.size);
  particles = [];
  for (let i = 0; i < columns; i++) {
    if (Math.random() * 100 <= settings.density)
      particles.push({
        x: i * settings.size,
        y: Math.random() * height,
        velocity: 0.5 + Math.random(),
        glyph: randomGlyph(glyphs[settings.characters]),
        timer: 0,
      });
  }
}
function draw(delta, still = false) {
  if (!ctx) return;
  ctx.fillStyle = `rgba(5,10,7,${still ? 1 : 1 - Math.exp(-delta * (1 - settings.trail / 100) * 14)})`;
  ctx.fillRect(0, 0, width, height);
  ctx.font = `${settings.size}px monospace`;
  ctx.textBaseline = 'top';
  for (const p of particles) {
    if (still) {
      for (let j = 12; j >= 1; j--) {
        ctx.globalAlpha = (1 - j / 13) * 0.65;
        ctx.fillStyle = palettes[settings.preset];
        ctx.fillText(randomGlyph(glyphs[settings.characters]), p.x, p.y - j * settings.size);
      }
      ctx.globalAlpha = 1;
    } else {
      p.y = advance(p.y, settings.speed * 1.8 * p.velocity, delta);
      p.timer += delta;
      if (p.timer > 0.09) {
        p.glyph = randomGlyph(glyphs[settings.characters]);
        p.timer = 0;
      }
      if (p.y > height + settings.size) {
        p.y = -settings.size;
      }
    }
    ctx.fillStyle = palettes[settings.preset];
    ctx.fillText(p.glyph, p.x, p.y);
  }
}
function resize() {
  const rect = $('canvas-wrap').getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
  clear();
  seed();
  draw(0, true);
  $('dimensions').textContent = `${Math.round(width)} × ${Math.round(height)} PX`;
}
function tick(timestamp) {
  if (!running || document.hidden || !ctx) return;
  const delta = previous ? Math.min((timestamp - previous) / 1000, 0.1) : 0;
  previous = timestamp;
  draw(delta);
  frame = requestAnimationFrame(tick);
}
function playback() {
  cancelAnimationFrame(frame);
  previous = 0;
  $('pause').textContent = running ? 'Pause animation' : 'Resume animation';
  $('pause').setAttribute('aria-pressed', String(!running));
  $('render-status').textContent = running ? 'RENDERING' : 'PAUSED';
  $('live-dot').style.opacity = running ? '1' : '.3';
  $('motion-note').textContent = reduced.matches
    ? 'Reduced motion is on. A still frame is shown until you choose Resume.'
    : 'Settings stay on this device. Your canvas stays yours.';
  if (running && !document.hidden && ctx) frame = requestAnimationFrame(tick);
}
function sync() {
  for (const key of ['speed', 'density', 'size', 'characters', 'trail'])
    $(key).value = settings[key];
  $('speed-value').textContent = settings.speed;
  $('density-value').textContent = `${settings.density}%`;
  $('trail-value').textContent = `${settings.trail}%`;
  document.documentElement.style.setProperty('--rain', palettes[settings.preset]);
  for (const button of document.querySelectorAll('[data-preset]'))
    button.setAttribute('aria-pressed', String(button.dataset.preset === settings.preset));
  $('preset-caption').textContent = {
    green: '01 / CLASSIC GREEN',
    amber: '02 / AMBER TERMINAL',
    ice: '03 / ICE BLUE',
  }[settings.preset];
}
for (const key of ['speed', 'density', 'size', 'characters', 'trail'])
  $(key).addEventListener('input', () => {
    settings = sanitize({
      ...settings,
      [key]: key === 'characters' ? $(key).value : Number($(key).value),
    });
    persist();
    sync();
    if (['density', 'size', 'characters'].includes(key)) seed();
    if (!running) draw(0, true);
  });
for (const button of document.querySelectorAll('[data-preset]'))
  button.onclick = () => {
    settings.preset = button.dataset.preset;
    persist();
    sync();
    clear();
    draw(0, true);
  };
$('pause').onclick = () => {
  running = !running;
  playback();
};
$('reset').onclick = () => {
  settings = { ...defaults };
  running = !reduced.matches;
  persist();
  sync();
  resize();
  playback();
  $('notice').textContent = 'Default settings restored.';
};
$('fullscreen').onclick = async () => {
  try {
    if (!$('canvas-wrap').requestFullscreen) throw new Error('unavailable');
    await $('canvas-wrap').requestFullscreen();
  } catch {
    $('notice').textContent =
      'Fullscreen is unavailable in this browser. The inline preview still works.';
  }
};
$('download').onclick = () => {
  if (!ctx) return;
  canvas.toBlob((blob) => {
    if (!blob) {
      $('notice').textContent = 'Could not create a PNG. Please try again.';
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'signal-matrix-rain.png';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    $('notice').textContent = 'PNG export prepared.';
  }, 'image/png');
};
new ResizeObserver(resize).observe($('canvas-wrap'));
document.addEventListener('visibilitychange', playback);
reduced.addEventListener('change', () => {
  if (reduced.matches) {
    running = false;
    draw(0, true);
  }
  playback();
});
sync();
resize();
playback();
if (!ctx) {
  running = false;
  playback();
  $('render-status').textContent = 'CANVAS UNAVAILABLE';
  $('notice').textContent = 'This browser cannot render Canvas 2D. Please try a modern browser.';
  $('pause').disabled = true;
  $('download').disabled = true;
}
