import {
  state, loadState, saveState, applyOfflineEarnings,
  addCredits, startMission, completeMission,
  upgradeAircraft, unlockAircraft, buyBaseUpgrade,
  prestige, prestigeThreshold, openNextCrate, buyCrate,
  pruneExpiredBoosts, getTotalPassiveRate, getActiveMissionCount
} from './state.js';
import { initRenderer, renderFrame, triggerCompletionFlash } from './renderer.js';
import { initUI, bindEvents, renderUI, drawMiniCanvases, renderCrateModal } from './ui.js';
import { AIRCRAFT } from './aircraft.js';

let lastTs = 0;
let lastUIUpdate = 0;
let lastSave = 0;

async function init() {
  loadState();
  applyOfflineEarnings();

  const canvas = document.getElementById('game-canvas');
  initRenderer(canvas);
  initUI();

  bindEvents({
    getState: () => state,
    prestigeThreshold,
    onStartMission: (aircraftId, missionId) => {
      if (startMission(aircraftId, missionId)) renderUI(state);
    },
    onUpgradeAircraft: (aircraftId, slotIndex) => {
      if (upgradeAircraft(aircraftId, slotIndex)) renderUI(state);
    },
    onUnlockAircraft: (aircraftId) => {
      if (unlockAircraft(aircraftId)) renderUI(state);
    },
    onBuyBaseUpgrade: (sectionKey) => {
      if (buyBaseUpgrade(sectionKey)) renderUI(state);
    },
    onPrestige: () => {
      if (prestige()) renderUI(state);
    },
    onOpenCrate: () => {
      const result = openNextCrate();
      if (result) {
        handlePendingActions();
        renderUI(state);
      }
      return result;
    },
    onBuyCrate: (tier) => {
      if (buyCrate(tier)) renderUI(state);
    },
  });

  renderUI(state);
  requestAnimationFrame(gameLoop);

  setInterval(() => saveState(), 15000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      saveState();
    } else {
      applyOfflineEarnings();
      renderUI(state);
    }
  });

  registerSW();
}

function gameLoop(ts) {
  const dt = Math.min((ts - (lastTs || ts)) / 1000, 0.1);
  lastTs = ts;

  tick(dt, ts);

  renderFrame(state, ts);

  if (ts - lastUIUpdate > 250) {
    renderUI(state);
    drawMiniCanvases();
    lastUIUpdate = ts;
  }

  requestAnimationFrame(gameLoop);
}

function tick(dt, ts) {
  pruneExpiredBoosts();

  const now = Date.now();

  for (const ac of AIRCRAFT) {
    const acState = state.aircraft[ac.id];
    if (!acState || !acState.currentMission) continue;
    const m = acState.currentMission;

    if (m.endTime <= now) {
      completeMission(ac.id);
      triggerCompletionFlash(ac.id);
      handlePendingActions();
    } else {
      // Drip passive income
      addCredits(m.passivePerSec * dt);
    }
  }

  state.lastTick = now;
}

function handlePendingActions() {
  if (state._pendingInstantComplete) {
    const target = state._pendingInstantComplete;
    state._pendingInstantComplete = null;
    const now = Date.now();
    for (const ac of AIRCRAFT) {
      const acState = state.aircraft[ac.id];
      if (!acState || !acState.currentMission) continue;
      if (target === 'all' || target > 0) {
        acState.currentMission.endTime = now - 1;
      }
      if (typeof target === 'number' && target > 0) break;
    }
  }

  if (state._pendingUnlockNext) {
    state._pendingUnlockNext = false;
    for (const ac of AIRCRAFT) {
      const acState = state.aircraft[ac.id];
      if (acState && !acState.unlocked) {
        acState.unlocked = true;
        break;
      }
    }
  }
}

async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
  } catch {}
}

init();
