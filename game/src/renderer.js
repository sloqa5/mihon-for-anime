import { AIRCRAFT } from './aircraft.js';
import { getArcPoint, easeInOut, clamp, formatCredits } from './utils.js';

let canvas, ctx, dpr = 1, W = 0, H = 0;
let bgCache = null;

// Design space: 375 × 300 logical pixels, scaled to actual canvas at runtime
function x(v) { return v * (W / 375); }
function y(v) { return v * (H / 300); }
function s(v) { return v * Math.min(W / 375, H / 300); }

let L = {}; // computed layout

const flashes   = {};  // id → { t: 0→1 }
const particles = [];  // floating +credit text

export function initRenderer(canvasEl) {
  canvas = canvasEl;
  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); bgCache = null; });
}

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const rect = canvas.getBoundingClientRect();
  W = rect.width;
  H = rect.height;
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  computeLayout();
  bgCache = null;
}

function computeLayout() {
  const padXs = [x(72), x(132), x(192), x(252), x(312)];
  L = {
    skyH:   y(44),
    rwX1:   x(0),   rwX2:   x(375), rwY1:  y(44), rwY2:  y(82),  rwY: y(63),
    taxiCX: x(192), taxiW:  x(52),  taxiY1: y(82), taxiY2: y(108),
    apX1:   x(0),   apX2:   x(375), apY1:   y(108), apY2:  y(278),
    pads: [
      ...padXs.map(px => ({ x: px, y: y(160) })),
      ...padXs.map(px => ({ x: px, y: y(228) })),
    ],
    // Building regions (flanking the apron)
    hgX: x(4),   hgY: y(112), hgW: x(55), hgH: y(55),
    twX: x(316), twY: y(112), twW: x(55), twH: y(55),
    fuX: x(4),   fuY: y(192),
    amX: x(316), amY: y(192),
    fenceY: y(282),
    // Zone target positions (edges of canvas, clockwise from top-left)
    zones: [
      [x(28),  y(22)], [x(100), y(16)], [x(192), y(14)], [x(284), y(16)], [x(348), y(22)],
      [x(8),   y(180)],[x(367), y(170)],[x(8),   y(248)],[x(367), y(248)],[x(192), y(292)],
    ],
  };
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

function poly(pts, fill, stroke, sw) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill)   { ctx.fillStyle   = fill;   ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw || 1; ctx.stroke(); }
}

function rectFill(x1, y1, x2, y2, fill) { ctx.fillStyle = fill; ctx.fillRect(x1, y1, x2 - x1, y2 - y1); }

function circ(cx, cy, r, fill, stroke, sw) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  if (fill)   { ctx.fillStyle   = fill;   ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw || 1; ctx.stroke(); }
}

function roundRect(rx, ry, rw, rh, r) {
  ctx.beginPath();
  ctx.moveTo(rx + r, ry);
  ctx.lineTo(rx + rw - r, ry);
  ctx.arcTo(rx + rw, ry, rx + rw, ry + r, r);
  ctx.lineTo(rx + rw, ry + rh - r);
  ctx.arcTo(rx + rw, ry + rh, rx + rw - r, ry + rh, r);
  ctx.lineTo(rx + r, ry + rh);
  ctx.arcTo(rx, ry + rh, rx, ry + rh - r, r);
  ctx.lineTo(rx, ry + r);
  ctx.arcTo(rx, ry, rx + r, ry, r);
  ctx.closePath();
}

// ── Static background (cached to offscreen canvas) ────────────────────────────

function buildBackground() {
  const oc  = document.createElement('canvas');
  oc.width  = Math.round(W * dpr);
  oc.height = Math.round(H * dpr);
  const bc  = oc.getContext('2d');
  bc.scale(dpr, dpr);

  const _ctx = ctx;
  ctx = bc;

  drawSky();
  drawRunway();
  drawTaxiway();
  drawApron();
  drawHangars();
  drawControlTower();
  drawFuelDepot();
  drawArmaments();
  drawPadMarkings();

  ctx = _ctx;
  bgCache = oc;
}

function drawSky() {
  const grad = ctx.createLinearGradient(0, 0, 0, L.skyH);
  grad.addColorStop(0, '#07111a');
  grad.addColorStop(1, '#0d1a10');
  rectFill(0, 0, W, L.skyH, '#07111a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, L.skyH);

  // Treeline silhouette
  ctx.fillStyle = '#0a1408';
  for (let tx = x(5); tx < W + x(10); tx += x(16)) {
    const jitter = Math.abs(Math.sin(tx * 0.08)) * y(5);
    const th = y(6) + jitter;
    poly([
      [tx - x(7), L.skyH - y(1)],
      [tx,        L.skyH - y(1) - th],
      [tx + x(7), L.skyH - y(1)],
    ], '#0e1a0c');
  }
  // Distant mountains
  ctx.fillStyle = 'rgba(15,28,20,0.5)';
  poly([
    [0, L.skyH],[x(60), L.skyH - y(18)],[x(130), L.skyH - y(10)],
    [x(200), L.skyH - y(22)],[x(280), L.skyH - y(12)],[x(340), L.skyH - y(20)],
    [W, L.skyH],
  ], 'rgba(15,28,20,0.5)');
}

function drawRunway() {
  // Concrete surface
  rectFill(L.rwX1, L.rwY1, L.rwX2, L.rwY2, '#28302a');

  // Edge stripes
  rectFill(L.rwX1, L.rwY1, L.rwX2, L.rwY1 + s(2.5), 'rgba(220,215,175,0.45)');
  rectFill(L.rwX1, L.rwY2 - s(2.5), L.rwX2, L.rwY2, 'rgba(220,215,175,0.45)');

  // Centerline
  ctx.save();
  ctx.setLineDash([s(22), s(14)]);
  ctx.strokeStyle = 'rgba(220,215,175,0.35)';
  ctx.lineWidth   = s(2);
  ctx.beginPath();
  ctx.moveTo(L.rwX1 + x(38), L.rwY);
  ctx.lineTo(L.rwX2 - x(38), L.rwY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Threshold bars — left end
  for (let i = 0; i < 5; i++) {
    const bx = L.rwX1 + x(10 + i * 8);
    rectFill(bx, L.rwY1 + s(5), bx + s(5), L.rwY2 - s(5), 'rgba(220,215,175,0.48)');
  }
  // Threshold bars — right end
  for (let i = 0; i < 5; i++) {
    const bx = L.rwX2 - x(10 + (i + 1) * 8);
    rectFill(bx, L.rwY1 + s(5), bx + s(5), L.rwY2 - s(5), 'rgba(220,215,175,0.48)');
  }

  // Runway number labels
  ctx.save();
  ctx.fillStyle = 'rgba(220,215,175,0.3)';
  ctx.font      = `bold ${s(14)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('28', L.rwX1 + x(28), L.rwY);
  ctx.fillText('10', L.rwX2 - x(28), L.rwY);
  ctx.restore();
}

function drawTaxiway() {
  rectFill(L.taxiCX - L.taxiW / 2, L.taxiY1, L.taxiCX + L.taxiW / 2, L.taxiY2, '#252a26');
  // Hold-short bar at runway edge
  ctx.fillStyle = 'rgba(240,180,0,0.5)';
  ctx.fillRect(L.taxiCX - L.taxiW / 2, L.taxiY1, L.taxiW, s(2));
  ctx.fillRect(L.taxiCX - L.taxiW / 2, L.taxiY1 + s(4), L.taxiW, s(2));
  // Yellow centerline
  ctx.save();
  ctx.setLineDash([s(8), s(8)]);
  ctx.strokeStyle = 'rgba(240,180,0,0.38)';
  ctx.lineWidth   = s(1.5);
  ctx.beginPath();
  ctx.moveTo(L.taxiCX, L.taxiY1 + s(6));
  ctx.lineTo(L.taxiCX, L.taxiY2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawApron() {
  // Apron surface
  rectFill(L.apX1, L.apY1, L.apX2, L.apY2, '#212621');

  // Subtle grid
  ctx.strokeStyle = 'rgba(74,222,128,0.04)';
  ctx.lineWidth   = 0.5;
  for (let lx = L.apX1; lx <= L.apX2; lx += x(40)) {
    ctx.beginPath(); ctx.moveTo(lx, L.apY1); ctx.lineTo(lx, L.apY2); ctx.stroke();
  }
  for (let ly = L.apY1; ly <= L.apY2; ly += y(35)) {
    ctx.beginPath(); ctx.moveTo(L.apX1, ly); ctx.lineTo(L.apX2, ly); ctx.stroke();
  }

  // Perimeter fence
  ctx.strokeStyle = 'rgba(74,222,128,0.2)';
  ctx.lineWidth   = s(1.5);
  ctx.setLineDash([s(4), s(6)]);
  ctx.beginPath(); ctx.moveTo(L.apX1, L.fenceY); ctx.lineTo(L.apX2, L.fenceY); ctx.stroke();
  ctx.setLineDash([]);
}

function drawHangars() {
  // 3 hangars stacked vertically on left side of apron
  const hx = L.hgX, hw = L.hgW, hh = L.hgH * 0.52;
  for (let i = 0; i < 3; i++) {
    const hy = L.hgY + i * (hh + y(3));
    if (hy + hh > L.apY2 - y(8)) break;
    // Wall body
    rectFill(hx, hy, hx + hw, hy + hh, '#1d2c1d');
    ctx.strokeRect(hx, hy, hw, hh);
    ctx.strokeStyle = '#2a402a'; ctx.lineWidth = s(0.5); ctx.strokeRect(hx, hy, hw, hh);
    // Roof highlight (top face)
    rectFill(hx, hy, hx + hw, hy + y(5), '#2a3c2a');
    // Arch apex line
    ctx.strokeStyle = '#324832'; ctx.lineWidth = s(1);
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + hw / 2, hy - y(4)); ctx.lineTo(hx + hw, hy); ctx.stroke();
    // Door opening
    const dw = hw * 0.55, dc = hx + hw / 2;
    rectFill(dc - dw / 2, hy + hh - y(10), dc + dw / 2, hy + hh, '#0c100c');
    // Label
    ctx.fillStyle = 'rgba(74,222,128,0.22)';
    ctx.font = `${s(7)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`HGR ${i + 1}`, hx + hw / 2, hy + y(13));
  }
}

function drawControlTower() {
  const tx = L.twX, ty = L.twY, tw = L.twW, th = L.twH;
  const bw = tw * 0.38, bcx = tx + tw / 2;
  // Base column
  rectFill(bcx - bw / 2, ty + th * 0.32, bcx + bw / 2, ty + th, '#1f301f');
  ctx.strokeStyle = '#2a4030'; ctx.lineWidth = s(0.5);
  ctx.strokeRect(bcx - bw / 2, ty + th * 0.32, bw, th * 0.68);
  // Observation deck
  rectFill(tx, ty + th * 0.15, tx + tw, ty + th * 0.34, '#263826');
  ctx.strokeStyle = '#364e36'; ctx.lineWidth = s(0.5);
  ctx.strokeRect(tx, ty + th * 0.15, tw, th * 0.19);
  // Glass strip (illuminated)
  rectFill(tx + tw * 0.08, ty + th * 0.17, tx + tw * 0.92, ty + th * 0.27, 'rgba(74,222,128,0.1)');
  // Antenna
  ctx.strokeStyle = '#3a5a3a'; ctx.lineWidth = s(1.5);
  ctx.beginPath(); ctx.moveTo(bcx, ty + th * 0.15); ctx.lineTo(bcx, ty); ctx.stroke();
  circ(bcx, ty + y(3), s(4), '#263826', '#3a5a3a', s(0.5));
  // Label
  ctx.fillStyle = 'rgba(74,222,128,0.25)';
  ctx.font = `${s(7)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('TOWER', bcx, ty + th * 0.46);
}

function drawFuelDepot() {
  const fx = L.fuX, fy = L.fuY;
  const tanks = [[x(16), y(14), 12], [x(33), y(7), 9], [x(25), y(28), 8]];
  for (const [dx, dy, r] of tanks) {
    circ(fx + dx, fy + dy, s(r), '#1e2014', '#2c2e1a', s(0.5));
    // Pipe cross
    ctx.strokeStyle = 'rgba(180,160,60,0.28)';
    ctx.lineWidth   = s(1);
    const cr = s(r * 0.65);
    ctx.beginPath(); ctx.moveTo(fx + dx - cr, fy + dy); ctx.lineTo(fx + dx + cr, fy + dy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx + dx, fy + dy - cr); ctx.lineTo(fx + dx, fy + dy + cr); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(180,160,60,0.3)';
  ctx.font = `${s(7)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('FUEL', fx + x(23), fy + y(42));
}

function drawArmaments() {
  const ax = L.amX, ay = L.amY;
  const bldgs = [[x(4), y(4), x(24), y(28)], [x(28), y(10), x(51), y(34)]];
  for (const [bx1, by1, bx2, by2] of bldgs) {
    rectFill(ax + bx1, ay + by1, ax + bx2, ay + by2, '#201c14');
    ctx.strokeStyle = '#3a3020'; ctx.lineWidth = s(0.5);
    ctx.strokeRect(ax + bx1, ay + by1, bx2 - bx1, by2 - by1);
  }
  // Hazard stripes on first building
  ctx.strokeStyle = 'rgba(240,180,0,0.28)'; ctx.lineWidth = s(1.5);
  ctx.setLineDash([s(4), s(4)]);
  ctx.strokeRect(ax + x(4) + s(2), ay + y(4) + s(2), x(20) - s(4), y(24) - s(4));
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(240,180,0,0.3)';
  ctx.font = `${s(7)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('ARMS', ax + x(28), ay + y(42));
}

function drawPadMarkings() {
  // Static pad ring for each aircraft slot
  AIRCRAFT.forEach((acDef, i) => {
    const pad = L.pads[i];
    if (!pad) return;
    circ(pad.x, pad.y, s(22), 'rgba(74,222,128,0.03)', 'rgba(74,222,128,0.14)', s(1));
  });
}

// ── Aircraft rendering ────────────────────────────────────────────────────────

function drawAircraft(acDef, cx, cy, sc, alpha, glowing) {
  ctx.save();
  if (glowing) {
    ctx.shadowBlur  = s(18);
    ctx.shadowColor = acDef.color;
  }
  for (const part of acDef.parts) {
    const a = alpha * (part.alpha !== undefined ? part.alpha : 1);
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.moveTo(cx + part.points[0][0] * sc, cy + part.points[0][1] * sc);
    for (let i = 1; i < part.points.length; i++) {
      ctx.lineTo(cx + part.points[i][0] * sc, cy + part.points[i][1] * sc);
    }
    ctx.closePath();
    ctx.fillStyle = part.color;
    ctx.fill();
  }
  ctx.restore();
}

function drawLockOverlay(cx, cy) {
  circ(cx, cy, s(22), 'rgba(0,0,0,0.52)', null);
  ctx.save();
  ctx.fillStyle    = 'rgba(180,180,180,0.48)';
  ctx.font         = `${s(16)}px sans-serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔒', cx, cy);
  ctx.restore();
}

// ── Mission arcs ──────────────────────────────────────────────────────────────

function drawMissionArc(acDef, pad, zx, zy, progress, ts) {
  ctx.save();

  // Dashed arc
  ctx.setLineDash([s(6), s(5)]);
  ctx.lineWidth   = s(1.5);
  ctx.strokeStyle = acDef.color + '65';
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const pt = getArcPoint(pad.x, pad.y, zx, zy, i / 40);
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else         ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Zone target (pulsing crosshair)
  const pulse = 0.55 + Math.sin(ts * 0.0038) * 0.28;
  const r     = s(7 + Math.sin(ts * 0.003) * 2);
  ctx.globalAlpha = pulse;
  circ(zx, zy, r, null, acDef.color, s(1.5));
  circ(zx, zy, r * 0.35, acDef.color + 'cc', null);
  // Crosshair lines
  ctx.strokeStyle = acDef.color;
  ctx.lineWidth   = s(1);
  ctx.beginPath(); ctx.moveTo(zx - r * 1.5, zy); ctx.lineTo(zx - r * 0.6, zy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(zx + r * 0.6, zy); ctx.lineTo(zx + r * 1.5, zy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(zx, zy - r * 1.5); ctx.lineTo(zx, zy - r * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(zx, zy + r * 0.6); ctx.lineTo(zx, zy + r * 1.5); ctx.stroke();
  ctx.globalAlpha = 1;

  // Traveling dot
  const dotPt = getArcPoint(pad.x, pad.y, zx, zy, easeInOut(progress));
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.shadowBlur  = s(10);
  ctx.shadowColor = acDef.color;
  circ(dotPt.x, dotPt.y, s(4.5), acDef.color, null);
  ctx.restore();

  ctx.restore();
}

// ── Particles ─────────────────────────────────────────────────────────────────

export function triggerCompletionFlash(aircraftId, payout) {
  flashes[aircraftId] = { t: 0 };
  const i = AIRCRAFT.findIndex(a => a.id === aircraftId);
  if (i >= 0 && L.pads[i]) {
    const pad    = L.pads[i];
    const acDef  = AIRCRAFT[i];
    const label  = payout ? '+' + formatCredits(payout) : '+ MISSION COMPLETE';
    particles.push({
      wx:    pad.x + (Math.random() - 0.5) * s(12),
      wy:    pad.y - s(12),
      text:  label,
      color: acDef.color,
      age:   0,
      life:  1.8,
      vy:    -s(28),
    });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p  = particles[i];
    p.age   += dt;
    p.wy    += p.vy * dt;
    p.vy    *= 0.97;
    if (p.age >= p.life) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    const prog  = p.age / p.life;
    const alpha = prog < 0.25 ? prog / 0.25 : 1 - (prog - 0.25) / 0.75;
    ctx.save();
    ctx.globalAlpha  = clamp(alpha, 0, 1);
    ctx.shadowBlur   = s(7);
    ctx.shadowColor  = p.color;
    ctx.fillStyle    = p.color;
    ctx.font         = `bold ${s(13)}px monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.text, p.wx, p.wy);
    ctx.restore();
  }
}

// ── Completion flash ──────────────────────────────────────────────────────────

function drawFlash(id, cx, cy) {
  const flash = flashes[id];
  if (!flash) return;
  const r = flash.t * s(46);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(74,222,128,${(1 - flash.t) * 0.65})`;
  ctx.fill();
  ctx.restore();
  flash.t += 0.045;
  if (flash.t >= 1) delete flashes[id];
}

// ── Main render ───────────────────────────────────────────────────────────────

let _lastTs = 0;

export function renderFrame(st, ts, dt) {
  if (W === 0 || H === 0) return;
  if (!bgCache) buildBackground();

  const frameDt = dt !== undefined ? dt : Math.min((ts - (_lastTs || ts)) / 1000, 0.1);
  _lastTs = ts;

  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(bgCache, 0, 0, W, H);

  updateParticles(frameDt);

  const now = Date.now();
  const sc  = s(36); // aircraft scale

  // Animated runway edge lights (pulse together)
  const lAlpha = 0.38 + Math.sin(ts * 0.0025) * 0.22;
  ctx.fillStyle = `rgba(220,215,175,${lAlpha})`;
  for (let lx = L.rwX1 + s(8); lx < L.rwX2; lx += s(30)) {
    ctx.beginPath(); ctx.arc(lx, L.rwY1 + s(4), s(1.8), 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(lx, L.rwY2 - s(4), s(1.8), 0, Math.PI * 2); ctx.fill();
  }

  // Taxiway blue edge lights (slower pulse, offset)
  const bAlpha = 0.28 + Math.sin(ts * 0.002 + 1.8) * 0.14;
  ctx.fillStyle = `rgba(100,170,255,${bAlpha})`;
  for (let ly = L.taxiY1 + s(7); ly < L.taxiY2; ly += s(12)) {
    ctx.beginPath(); ctx.arc(L.taxiCX - L.taxiW / 2 + s(3.5), ly, s(1.5), 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(L.taxiCX + L.taxiW / 2 - s(3.5), ly, s(1.5), 0, Math.PI * 2); ctx.fill();
  }

  // E-3 Sentry radar sweep
  const e3 = st.aircraft.e3;
  if (e3 && e3.currentMission && e3.currentMission.endTime > now) {
    const angle = (ts * 0.001) % (Math.PI * 2);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, Math.max(W, H) * 0.75, -0.22, 0.22);
    ctx.closePath();
    ctx.fillStyle = 'rgba(139,233,253,0.045)';
    ctx.fill();
    ctx.restore();
  }

  // Mission arcs (drawn before aircraft so arcs appear under dots)
  AIRCRAFT.forEach((acDef, i) => {
    const acState = st.aircraft[acDef.id];
    if (!acState || !acState.unlocked || !acState.currentMission) return;
    const m = acState.currentMission;
    if (m.endTime <= now) return;
    const pad  = L.pads[i];
    const zone = L.zones[i % L.zones.length];
    if (!pad || !zone) return;
    const progress = clamp((now - m.startTime) / (m.endTime - m.startTime), 0, 1);
    drawMissionArc(acDef, pad, zone[0], zone[1], progress, ts);
  });

  // Aircraft on pads
  AIRCRAFT.forEach((acDef, i) => {
    const acState = st.aircraft[acDef.id];
    const pad     = L.pads[i];
    if (!pad) return;

    const onMission = acState && acState.currentMission && acState.currentMission.endTime > now;

    if (!acState || !acState.unlocked) {
      drawAircraft(acDef, pad.x, pad.y, sc, 0.16, false);
      drawLockOverlay(pad.x, pad.y);
    } else if (onMission) {
      // Ghost / dim while away
      drawAircraft(acDef, pad.x, pad.y, sc, 0.22, false);
    } else {
      // Ready — breathing glow
      const breathe = 0.82 + Math.sin(ts * 0.002 + i * 1.1) * 0.18;
      drawAircraft(acDef, pad.x, pad.y, sc, breathe, true);
    }

    drawFlash(acDef.id, pad.x, pad.y);
  });

  drawParticles();
  drawHUD(st, now, ts);
}

function drawHUD(st, now, ts) {
  // Credits pill — top right
  const credStr = formatCredits(st.credits);
  const pillW   = s(16 + credStr.length * 9);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.58)';
  roundRect(W - pillW - s(6), s(5), pillW, s(20), s(5));
  ctx.fill();
  ctx.fillStyle    = '#4ade80';
  ctx.shadowBlur   = s(7);
  ctx.shadowColor  = '#4ade80';
  ctx.font         = `bold ${s(12)}px monospace`;
  ctx.textAlign    = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(credStr, W - s(10), s(15));
  ctx.restore();

  // Active missions pill — top left
  const activeCt = AIRCRAFT.filter(a => {
    const ac = st.aircraft[a.id];
    return ac && ac.currentMission && ac.currentMission.endTime > now;
  }).length;

  if (activeCt > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.58)';
    roundRect(s(6), s(5), s(72), s(20), s(5));
    ctx.fill();
    ctx.fillStyle    = '#facc15';
    ctx.shadowBlur   = s(5);
    ctx.shadowColor  = '#facc15';
    ctx.font         = `${s(11)}px monospace`;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✈ ${activeCt} active`, s(12), s(15));
    ctx.restore();
  }

  // Prestige stars pill — bottom of canvas
  const stars = st.prestigeStars || 0;
  if (stars > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    roundRect(s(6), H - s(24), s(60), s(18), s(5));
    ctx.fill();
    ctx.fillStyle    = '#facc15';
    ctx.font         = `${s(10)}px monospace`;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`★ ×${stars}  ×${(1 + stars * 0.25).toFixed(2)}`, s(12), H - s(15));
    ctx.restore();
  }
}
