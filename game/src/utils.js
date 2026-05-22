export function formatCredits(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

export function formatRate(perSec) {
  if (perSec <= 0) return '+0/s';
  return '+' + formatCredits(perSec) + '/s';
}

export function formatTime(seconds) {
  seconds = Math.max(0, Math.ceil(seconds));
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
  return `${seconds}s`;
}

export function lerp(a, b, t) { return a + (b - a) * t; }
export function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
export function easeInOut(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }
export function randomBetween(min, max) { return min + Math.random() * (max - min); }
export function randomInt(min, max) { return Math.floor(min + Math.random() * (max - min + 1)); }

export function weightedRandom(items) {
  // items: [{weight, value}]
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

export function getArcPoint(x1, y1, x2, y2, t, bend = 0.28) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  const it = 1 - t;
  return {
    x: it*it*x1 + 2*it*t*cx + t*t*x2,
    y: it*it*y1 + 2*it*t*cy + t*t*y2
  };
}

export function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else if (result[key] === undefined) {
      result[key] = source[key];
    }
  }
  return result;
}
