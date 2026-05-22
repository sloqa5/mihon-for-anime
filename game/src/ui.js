import { AIRCRAFT, getAircraftById } from './aircraft.js';
import { MISSIONS, getMissionsByAircraft, getMissionDuration, getMissionPayout, getMissionPassive } from './missions.js';
import { BASE_SECTIONS, getMaxMissionSlots } from './base.js';
import { CRATE_COLORS, CRATE_COSTS } from './crates.js';
import { formatCredits, formatTime, formatRate } from './utils.js';

let callbacks = {};
let activeTab = 'base';
let selectedAircraftId = 'ac130';
let crateAnimating = false;
let crateResult = null;

// DOM refs
let tabBar, statsBar, boostBar, scrollPanel;
let panelBase, panelPlanes, panelOps, panelPrestige;
let crateModal, crateBox, crateLabel, crateReward, crateTier;

export function initUI() {
  tabBar     = document.getElementById('tab-bar');
  statsBar   = document.getElementById('stats-bar');
  boostBar   = document.getElementById('boost-bar');
  scrollPanel= document.getElementById('scroll-panel');
  panelBase  = document.getElementById('panel-base');
  panelPlanes= document.getElementById('panel-planes');
  panelOps   = document.getElementById('panel-ops');
  panelPrestige=document.getElementById('panel-prestige');
  crateModal = document.getElementById('crate-modal');
  crateBox   = document.getElementById('crate-box');
  crateLabel = document.getElementById('crate-label');
  crateReward= document.getElementById('crate-reward');
  crateTier  = null;
}

export function bindEvents(cbs) {
  callbacks = cbs;

  // Tab switching
  tabBar.addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (btn) switchTab(btn.dataset.tab);
  });

  // Crate badge in stats bar
  document.getElementById('crate-badge').addEventListener('click', () => {
    openCrateModal(callbacks.getState());
  });

  // Crate modal open box
  crateModal.addEventListener('click', e => {
    if (e.target.id === 'crate-open-btn') {
      performCrateOpen();
    } else if (e.target.id === 'crate-open-all-btn') {
      performOpenAll();
    } else if (e.target.id === 'crate-close') {
      closeCrateModal();
    } else if (e.target.classList.contains('crate-buy-btn')) {
      const tier = e.target.dataset.tier;
      callbacks.onBuyCrate(tier);
      renderCrateModal(callbacks.getState());
    }
  });

  // Delegated events on scroll panel
  scrollPanel.addEventListener('click', e => {
    // Base upgrade
    const baseBtn = e.target.closest('[data-base-section]');
    if (baseBtn) { callbacks.onBuyBaseUpgrade(baseBtn.dataset.baseSection); return; }

    // Aircraft unlock
    const unlockBtn = e.target.closest('[data-unlock]');
    if (unlockBtn) { callbacks.onUnlockAircraft(unlockBtn.dataset.unlock); return; }

    // Aircraft upgrade
    const upgradeBtn = e.target.closest('[data-upgrade]');
    if (upgradeBtn) {
      const [id, slot] = upgradeBtn.dataset.upgrade.split(':');
      callbacks.onUpgradeAircraft(id, parseInt(slot));
      return;
    }

    // Select aircraft in Ops panel
    const acSelect = e.target.closest('[data-select-ac]');
    if (acSelect) { selectedAircraftId = acSelect.dataset.selectAc; renderOpsPanel(callbacks.getState()); return; }

    // Launch mission
    const launchBtn = e.target.closest('[data-launch]');
    if (launchBtn) {
      const [id, mid] = launchBtn.dataset.launch.split(':');
      callbacks.onStartMission(id, mid);
      return;
    }

    // Prestige
    if (e.target.id === 'prestige-btn') { callbacks.onPrestige(); return; }
  });
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  panelBase.style.display    = tab === 'base'    ? 'block' : 'none';
  panelPlanes.style.display  = tab === 'planes'  ? 'block' : 'none';
  panelOps.style.display     = tab === 'ops'     ? 'block' : 'none';
  panelPrestige.style.display= tab === 'prestige'? 'block' : 'none';
}

// ── Render entry point (throttled to 4fps by main.js) ─────────────────────────

export function renderUI(st) {
  renderStatsBar(st);
  renderBoostBar(st);
  switch (activeTab) {
    case 'base':    renderBasePanel(st);    break;
    case 'planes':  renderPlanesPanel(st);  break;
    case 'ops':     renderOpsPanel(st);     break;
    case 'prestige':renderPrestigePanel(st);break;
  }
}

// ── Stats bar ──────────────────────────────────────────────────────────────────

function renderStatsBar(st) {
  const now = Date.now();
  let passive = 0;
  for (const a of AIRCRAFT) {
    const ac = st.aircraft[a.id];
    if (ac && ac.currentMission && ac.currentMission.endTime > now) {
      passive += ac.currentMission.passivePerSec;
    }
  }
  document.getElementById('stat-credits').textContent = formatCredits(st.credits);
  document.getElementById('stat-rate').textContent    = formatRate(passive);
  const badge = document.getElementById('crate-badge');
  const count = (st.crateQueue || []).length;
  badge.textContent = count > 0 ? `📦 ${count}` : '📦';
  badge.classList.toggle('has-crates', count > 0);
}

// ── Boost bar ─────────────────────────────────────────────────────────────────

function renderBoostBar(st) {
  const now = Date.now();
  const active = (st.activeBoosts || []).filter(b => b.expiresAt > now);
  if (!active.length) { boostBar.innerHTML = ''; return; }
  boostBar.innerHTML = active.map(b => {
    const remaining = Math.ceil((b.expiresAt - now) / 1000);
    const label = b.type === 'income' ? '⚡Income' : b.type === 'payout' ? '💰Payout' : '🚀Speed';
    return `<span class="boost-pill">${label} ×${b.multiplier} ${formatTime(remaining)}</span>`;
  }).join('');
}

// ── BASE panel (Idle Miner style strips) ───────────────────────────────────────

function renderBasePanel(st) {
  const slots = getMaxMissionSlots(st);
  panelBase.innerHTML = `
    <div class="section-header">Base Command <span class="slots-badge">${slots} Mission Slots</span></div>
    ${BASE_SECTIONS.map(section => renderBaseSection(section, st)).join('')}
  `;
}

function renderBaseSection(section, st) {
  const bought = st.baseUpgrades[section.key] || 0;
  const upgrades = section.upgrades;
  return `
    <div class="base-section">
      <div class="base-section-title">${section.icon} ${section.name}</div>
      <div class="base-section-desc">${section.effectDesc}</div>
      <div class="base-upgrades-strip">
        ${upgrades.map((upg, i) => {
          const done = i < bought;
          const next = i === bought;
          const locked = i > bought;
          const canAfford = next && st.credits >= upg.cost;
          let cls = 'upg-box';
          if (done) cls += ' done';
          else if (next && canAfford) cls += ' affordable';
          else if (next) cls += ' next';
          else cls += ' locked';
          return `<div class="${cls}" ${next ? `data-base-section="${section.key}"` : ''} title="${upg.name}\n${upg.desc}">
            ${done ? `<span class="upg-check">✓</span>` : `<span class="upg-num">${i+1}</span>`}
            ${next ? `<span class="upg-cost">${formatCredits(upg.cost)}</span>` : ''}
          </div>`;
        }).join('')}
      </div>
      <div class="base-section-progress">${bought}/${upgrades.length} purchased</div>
    </div>
  `;
}

// ── PLANES panel ───────────────────────────────────────────────────────────────

function renderPlanesPanel(st) {
  const now = Date.now();
  panelPlanes.innerHTML = AIRCRAFT.map(ac => renderAircraftCard(ac, st, now)).join('');
}

function renderAircraftCard(acDef, st, now) {
  const acState = st.aircraft[acDef.id];
  const unlocked = acState && acState.unlocked;
  const onMission = unlocked && acState.currentMission && acState.currentMission.endTime > now;
  const upgrades = acState ? acState.upgrades : [0,0,0,0,0];

  const statusText = !unlocked
    ? `Locked — ${formatCredits(acDef.unlockCost)} Credits`
    : onMission
      ? `On mission — ${formatTime((acState.currentMission.endTime - now) / 1000)} remaining`
      : 'Ready';

  const upgradesHtml = acDef.upgradeNames.map((name, i) => {
    const tier = upgrades[i];
    const maxed = tier >= 5;
    const cost = !maxed ? acDef.upgradeCosts[i][tier] : 0;
    const canAfford = !maxed && st.credits >= cost;
    return `<div class="upgrade-row">
      <span class="upg-name">${name}</span>
      <div class="upg-pips">${[0,1,2,3,4].map(p => `<span class="pip ${p < tier ? 'filled' : ''}"></span>`).join('')}</div>
      ${maxed ? '<span class="upg-maxed">MAX</span>' :
        `<button class="btn-upg ${canAfford ? '' : 'cant-afford'}" data-upgrade="${acDef.id}:${i}" ${!unlocked || !canAfford ? 'disabled' : ''}>${formatCredits(cost)}</button>`}
    </div>`;
  }).join('');

  return `<div class="ac-card ${!unlocked ? 'locked' : ''}">
    <div class="ac-card-header">
      <canvas class="ac-minicanvas" data-acid="${acDef.id}" width="56" height="56"></canvas>
      <div class="ac-info">
        <div class="ac-name">${acDef.name}</div>
        <div class="ac-role">${acDef.role}</div>
        <div class="ac-status ${onMission ? 'on-mission' : unlocked ? 'ready' : 'locked-status'}">${statusText}</div>
      </div>
      ${!unlocked ? `<button class="btn-unlock ${st.credits >= acDef.unlockCost ? '' : 'cant-afford'}" data-unlock="${acDef.id}" ${st.credits < acDef.unlockCost ? 'disabled' : ''}>Unlock<br>${formatCredits(acDef.unlockCost)}</button>` : ''}
    </div>
    ${unlocked ? `<div class="ac-special">⭐ ${acDef.specialDesc}</div>` : ''}
    ${unlocked ? `<div class="ac-upgrades">${upgradesHtml}</div>` : ''}
  </div>`;
}

// ── OPS panel ─────────────────────────────────────────────────────────────────

function renderOpsPanel(st) {
  const now = Date.now();
  const slots = getMaxMissionSlots(st);
  const used  = AIRCRAFT.filter(a => {
    const ac = st.aircraft[a.id];
    return ac && ac.currentMission && ac.currentMission.endTime > now;
  }).length;

  const acSelector = `<div class="ac-selector">
    ${AIRCRAFT.filter(a => st.aircraft[a.id] && st.aircraft[a.id].unlocked).map(a =>
      `<button class="ac-sel-btn ${selectedAircraftId === a.id ? 'selected' : ''}" data-select-ac="${a.id}">${a.name.split(' ')[0]}</button>`
    ).join('')}
  </div>`;

  const acDef   = getAircraftById(selectedAircraftId);
  const acState = st.aircraft[selectedAircraftId];
  if (!acDef || !acState || !acState.unlocked) {
    panelOps.innerHTML = `<div class="ops-header">Operations — ${used}/${slots} slots active</div>${acSelector}<p class="empty-msg">Select an unlocked aircraft above.</p>`;
    return;
  }

  const missions = getMissionsByAircraft(selectedAircraftId);
  const weaponsTier = acState.upgrades[3] || 0;
  const onMission = acState.currentMission && acState.currentMission.endTime > now;

  const missionCards = missions.map(m => {
    const available = m.tier === 1 || weaponsTier >= 1;
    const dur  = getMissionDuration(selectedAircraftId, m.id, st);
    const pay  = getMissionPayout(selectedAircraftId, m.id, st);
    const pass = getMissionPassive(selectedAircraftId, m.id, st);
    const canLaunch = available && !onMission && used < slots;
    return `<div class="mission-card ${!available ? 'locked-mission' : ''}">
      <div class="mission-name">${m.name}</div>
      <div class="mission-desc">${m.desc}</div>
      <div class="mission-stats">
        <span>⏱ ${formatTime(dur)}</span>
        <span>💰 ${formatCredits(pay)}</span>
        <span>📈 ${formatRate(pass)}</span>
      </div>
      ${!available ? '<div class="mission-locked">Requires Weapons Loadout upgrade</div>' :
        `<button class="btn-launch ${canLaunch ? '' : 'cant-afford'}" data-launch="${selectedAircraftId}:${m.id}" ${!canLaunch ? 'disabled' : ''}>Launch</button>`}
    </div>`;
  }).join('');

  let activeInfo = '';
  if (onMission) {
    const m = acState.currentMission;
    const timeLeft = Math.max(0, (m.endTime - now) / 1000);
    activeInfo = `<div class="active-mission-banner">
      ✈ Active Mission — ${formatTime(timeLeft)} remaining — ${formatRate(m.passivePerSec)}
    </div>`;
  }

  panelOps.innerHTML = `
    <div class="ops-header">Operations — ${used}/${slots} slots active</div>
    ${acSelector}
    ${activeInfo}
    <div class="mission-grid">${missionCards}</div>
  `;
}

// ── PRESTIGE panel ────────────────────────────────────────────────────────────

function renderPrestigePanel(st) {
  const { prestigeThreshold } = callbacks;
  const threshold = prestigeThreshold();
  const progress  = Math.min(1, st.totalCreditsEarned / threshold);
  const pct = Math.round(progress * 100);
  const stars = st.prestigeStars;
  const multiplier = 1 + stars * 0.25;
  const canPrestige = st.totalCreditsEarned >= threshold;

  panelPrestige.innerHTML = `
    <div class="prestige-section">
      <div class="prestige-stars">${'⭐'.repeat(Math.min(stars, 20))} ${stars > 0 ? `×${stars}` : ''}</div>
      <div class="prestige-multi">Income Multiplier: <strong>×${multiplier.toFixed(2)}</strong></div>
      <div class="prestige-label">Total Credits Earned</div>
      <div class="prestige-bar-wrap">
        <div class="prestige-bar" style="width:${pct}%"></div>
      </div>
      <div class="prestige-numbers">${formatCredits(st.totalCreditsEarned)} / ${formatCredits(threshold)}</div>
      <button id="prestige-btn" class="btn-prestige ${canPrestige ? '' : 'cant-afford'}" ${canPrestige ? '' : 'disabled'}>
        ${canPrestige ? '🌟 Prestige Now' : `Prestige (${pct}%)`}
      </button>
      ${stars > 0 ? `<div class="prestige-info">Each prestige resets credits but keeps all upgrades.<br>Income ×${(1 + (stars+1) * 0.25).toFixed(2)} after next prestige.</div>` : `<div class="prestige-info">Prestige resets credits but keeps all aircraft and base upgrades. Earn a permanent income multiplier.</div>`}
    </div>
    <div class="prestige-section">
      <div class="base-section-title">Buy Crates</div>
      ${['common','rare','epic'].map(tier => {
        const info = CRATE_COLORS[tier];
        const cost = CRATE_COSTS[tier];
        return `<button class="crate-buy-btn tier-${tier} ${st.credits >= cost ? '' : 'cant-afford'}" data-tier="${tier}" ${st.credits < cost ? 'disabled' : ''}>
          ${info.label} — ${formatCredits(cost)}
        </button>`;
      }).join('')}
    </div>
  `;
}

// ── Crate modal ───────────────────────────────────────────────────────────────

function openCrateModal(st) {
  if (!st.crateQueue || !st.crateQueue.length) return;
  crateModal.style.display = 'flex';
  crateResult = null;
  renderCrateModal(st);
}

export function renderCrateModal(st) {
  const count = (st.crateQueue || []).length;
  if (!count && !crateResult) { closeCrateModal(); return; }
  const tier = crateResult ? crateResult.tier : (st.crateQueue[0] || 'common');
  const info = CRATE_COLORS[tier];

  crateModal.querySelector('.crate-modal-inner').innerHTML = `
    <button id="crate-close" class="crate-close">✕</button>
    <div class="crate-title" style="color:${info.border}">${info.label}</div>
    <div class="crate-box-wrap">
      <div id="crate-box" class="crate-box ${crateAnimating ? 'shaking' : ''}" style="border-color:${info.border};box-shadow:0 0 24px ${info.glow}">
        ${crateResult
          ? `<div class="crate-reward-text" style="color:${info.border}">${crateResult.reward.label}</div>`
          : `<div class="crate-icon">📦</div>`}
      </div>
    </div>
    ${crateResult
      ? `<button id="crate-open-btn" class="btn-crate-open" style="border-color:${info.border}">
           ${count > 0 ? 'Open Next' : 'Done'}
         </button>`
      : `<button id="crate-open-btn" class="btn-crate-open" style="border-color:${info.border}">Tap to Open</button>`}
    ${count > 1 ? `<button id="crate-open-all-btn" class="btn-crate-all">Open All (${count})</button>` : ''}
  `;
}

function performCrateOpen() {
  crateResult = callbacks.onOpenCrate();
  if (!crateResult) { closeCrateModal(); return; }
  crateAnimating = true;
  renderCrateModal(callbacks.getState());
  setTimeout(() => { crateAnimating = false; }, 400);
}

function performOpenAll() {
  let last = null;
  const st = callbacks.getState();
  const count = st.crateQueue.length;
  for (let i = 0; i < count; i++) {
    last = callbacks.onOpenCrate();
  }
  crateResult = last;
  renderCrateModal(callbacks.getState());
}

function closeCrateModal() {
  crateModal.style.display = 'none';
  crateResult = null;
  crateAnimating = false;
}

// Draw aircraft silhouettes into mini canvases in the Planes panel
export function drawMiniCanvases() {
  document.querySelectorAll('.ac-minicanvas').forEach(mc => {
    const id = mc.dataset.acid;
    const acDef = getAircraftById(id);
    if (!acDef) return;
    const dpr = window.devicePixelRatio || 1;
    const size = mc.getBoundingClientRect().width || 56;
    mc.width  = size * dpr;
    mc.height = size * dpr;
    const c = mc.getContext('2d');
    c.scale(dpr, dpr);
    c.clearRect(0, 0, size, size);
    const scale = size * 0.44;
    const cx = size / 2;
    const cy = size / 2;
    for (const part of acDef.parts) {
      c.save();
      c.globalAlpha = part.alpha !== undefined ? part.alpha : 1;
      c.beginPath();
      c.moveTo(cx + part.points[0][0] * scale, cy + part.points[0][1] * scale);
      for (let i = 1; i < part.points.length; i++) {
        c.lineTo(cx + part.points[i][0] * scale, cy + part.points[i][1] * scale);
      }
      c.closePath();
      c.fillStyle = part.color;
      c.shadowBlur = 8;
      c.shadowColor = part.color;
      c.fill();
      c.restore();
    }
  });
}
