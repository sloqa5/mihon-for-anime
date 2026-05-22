import { AIRCRAFT } from './aircraft.js';
import { getArcPoint, easeInOut, clamp, formatCredits } from './utils.js';

let canvas, ctx, dpr, W, H;
let bgCache = null;

// Pad layout: 5 columns × 2 rows (indices match AIRCRAFT array order)
const PAD_COLS = 5;
const PAD_ROWS = 2;
let pads = []; // computed on init

const completionFlashes = {}; // aircraftId → { t: 0-1, color }
const missionPulses = {};     // aircraftId → pulse alpha

export function initRenderer(canvasEl) {
  canvas = canvasEl;
  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); bgCache = null; });
}

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  W = rect.width;
  H = rect.height;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  computePads();
  bgCache = null;
}

function computePads() {
  pads = [];
  const padW = W / PAD_COLS;
  const padH = H / PAD_ROWS;
  for (let r = 0; r < PAD_ROWS; r++) {
    for (let c = 0; c < PAD_COLS; c++) {
      pads.push({ x: padW * c + padW / 2, y: padH * r + padH / 2 });
    }
  }
}

function buildBackground() {
  const oc = document.createElement('canvas');
  oc.width  = W * dpr;
  oc.height = H * dpr;
  const oc2 = oc.getContext('2d');
  oc2.scale(dpr, dpr);

  // Base gradient
  const grad = oc2.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0a180a');
  grad.addColorStop(1, '#0d200d');
  oc2.fillStyle = grad;
  oc2.fillRect(0, 0, W, H);

  // Hex-ish grid lines
  oc2.strokeStyle = 'rgba(74,222,128,0.06)';
  oc2.lineWidth = 0.5;
  const spacing = 30;
  for (let x = 0; x < W; x += spacing) {
    oc2.beginPath(); oc2.moveTo(x, 0); oc2.lineTo(x, H); oc2.stroke();
  }
  for (let y = 0; y < H; y += spacing) {
    oc2.beginPath(); oc2.moveTo(0, y); oc2.lineTo(W, y); oc2.stroke();
  }

  // Pad circles
  for (const pad of pads) {
    oc2.beginPath();
    oc2.arc(pad.x, pad.y, 28, 0, Math.PI * 2);
    oc2.strokeStyle = 'rgba(74,222,128,0.18)';
    oc2.lineWidth = 1;
    oc2.stroke();
    oc2.fillStyle = 'rgba(74,222,128,0.04)';
    oc2.fill();
  }

  bgCache = oc;
}

function drawPolygonPart(part, cx, cy, scale, globalAlpha) {
  if (!part.points || part.points.length < 3) return;
  ctx.save();
  ctx.globalAlpha = (part.alpha !== undefined ? part.alpha : 1) * globalAlpha;
  ctx.beginPath();
  ctx.moveTo(cx + part.points[0][0] * scale, cy + part.points[0][1] * scale);
  for (let i = 1; i < part.points.length; i++) {
    ctx.lineTo(cx + part.points[i][0] * scale, cy + part.points[i][1] * scale);
  }
  ctx.closePath();
  ctx.fillStyle = part.color;
  ctx.fill();
  ctx.restore();
}

function drawAircraft(acDef, cx, cy, scale, alpha, glowing) {
  if (glowing) {
    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = acDef.color;
  }
  for (const part of acDef.parts) {
    drawPolygonPart(part, cx, cy, scale, alpha);
  }
  if (glowing) ctx.restore();
}

function drawLockOverlay(cx, cy) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(200,200,200,0.5)';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔒', cx, cy);
  ctx.restore();
}

function drawMissionArc(acDef, pad, endX, endY, progress, timestamp) {
  ctx.save();
  // Dashed arc
  ctx.setLineDash([6, 5]);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = acDef.color + '88';
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const pt = getArcPoint(pad.x, pad.y, endX, endY, i / 40);
    if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Traveling dot
  const dotPt = getArcPoint(pad.x, pad.y, endX, endY, easeInOut(progress));
  const pulse = Math.sin(timestamp * 0.005) * 0.4 + 0.6;
  ctx.beginPath();
  ctx.arc(dotPt.x, dotPt.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = acDef.color;
  ctx.shadowBlur = 10;
  ctx.shadowColor = acDef.color;
  ctx.globalAlpha = pulse;
  ctx.fill();
  ctx.restore();
}

function drawZoneTarget(x, y, color, timestamp) {
  const r = 8 + Math.sin(timestamp * 0.004) * 3;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.restore();
}

function drawCompletionFlash(flash, cx, cy) {
  ctx.save();
  const r = flash.t * 45;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(74,222,128,${(1 - flash.t) * 0.7})`;
  ctx.fill();
  ctx.restore();
}

// Zone positions (normalized to canvas, avoid edges)
function getZonePos(index) {
  const zones = [
    [0.1, 0.5], [0.9, 0.5], [0.5, 0.08], [0.15, 0.15],
    [0.85, 0.85], [0.5, 0.92],
  ];
  const z = zones[index % zones.length];
  return { x: z[0] * W, y: z[1] * H };
}

export function triggerCompletionFlash(aircraftId) {
  completionFlashes[aircraftId] = { t: 0 };
}

export function renderFrame(st, timestamp) {
  if (W === 0) return;
  if (!bgCache) buildBackground();

  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(bgCache, 0, 0, W, H);

  const now = Date.now();
  const scale = Math.min(W / PAD_COLS, H / PAD_ROWS) * 0.38;

  // Draw mission arcs and zone targets
  AIRCRAFT.forEach((acDef, i) => {
    const acState = st.aircraft[acDef.id];
    if (!acState || !acState.unlocked || !acState.currentMission) return;
    const m = acState.currentMission;
    if (m.endTime <= now) return;
    const pad = pads[i];
    if (!pad) return;
    const progress = clamp((now - m.startTime) / (m.endTime - m.startTime), 0, 1);
    const zonePos = getZonePos(i);
    drawZoneTarget(zonePos.x, zonePos.y, acDef.color, timestamp);
    drawMissionArc(acDef, pad, zonePos.x, zonePos.y, progress, timestamp);
  });

  // E-3 radar sweep when deployed
  const e3State = st.aircraft.e3;
  if (e3State && e3State.currentMission && e3State.currentMission.endTime > now) {
    const angle = (timestamp * 0.001) % (Math.PI * 2);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, Math.max(W, H) * 0.7, -0.3, 0.3);
    ctx.closePath();
    ctx.fillStyle = 'rgba(139,233,253,0.06)';
    ctx.fill();
    ctx.restore();
  }

  // Draw aircraft on pads
  AIRCRAFT.forEach((acDef, i) => {
    const acState = st.aircraft[acDef.id];
    const pad = pads[i];
    if (!pad) return;

    const onMission = acState && acState.currentMission && acState.currentMission.endTime > now;

    if (!acState || !acState.unlocked) {
      drawAircraft(acDef, pad.x, pad.y, scale, 0.2, false);
      drawLockOverlay(pad.x, pad.y);
    } else if (onMission) {
      drawAircraft(acDef, pad.x, pad.y, scale, 0.3, false);
    } else {
      drawAircraft(acDef, pad.x, pad.y, scale, 1.0, true);
    }

    // Completion flash animation
    const flash = completionFlashes[acDef.id];
    if (flash) {
      drawCompletionFlash(flash, pad.x, pad.y);
      flash.t += 0.04;
      if (flash.t >= 1) delete completionFlashes[acDef.id];
    }
  });

  // HUD credits overlay (top-right corner)
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(W - 95, 4, 91, 18);
  ctx.fillStyle = '#4ade80';
  ctx.font = `bold ${Math.max(10, Math.min(13, W * 0.032))}px monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(formatCredits(st.credits), W - 6, 7);
  ctx.restore();
}
