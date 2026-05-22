import { AIRCRAFT } from './aircraft.js';
import { getMissionDuration, getMissionPayout, getMissionPassive } from './missions.js';
import { BASE_SECTIONS, getMaxMissionSlots } from './base.js';
import { rollMissionCrateDrop, applyReward, rollCrate, CRATE_COSTS } from './crates.js';
import { deepMerge } from './utils.js';

const SAVE_KEY = 'MILGAME_STATE';
const SCHEMA_VERSION = 2;

function defaultAircraftState(id) {
  return { unlocked: id === 'ac130' || id === 'a10', upgrades: [0,0,0,0,0], currentMission: null, cooldownUntil: 0, totalMissionsFlown: 0 };
}

const DEFAULT_STATE = {
  version: SCHEMA_VERSION,
  lastSave: 0,
  lastTick: 0,
  credits: 500,
  prestigeStars: 0,
  totalCreditsEarned: 500,
  totalMissionsCompleted: 0,
  aircraft: Object.fromEntries(AIRCRAFT.map(a => [a.id, defaultAircraftState(a.id)])),
  baseUpgrades: { airfield: 0, fuel: 0, armaments: 0, personnel: 0, command: 0 },
  sr71Zones: [],
  activeBoosts: [],
  crateQueue: [],
  totalCratesOpened: 0,
  _pendingInstantComplete: null,
  _pendingUnlockNext: false,
  settings: { animationsEnabled: true },
};

export let state = structuredClone(DEFAULT_STATE);

function migrateState(raw) {
  if (!raw || typeof raw !== 'object') return structuredClone(DEFAULT_STATE);
  const merged = deepMerge(structuredClone(DEFAULT_STATE), raw);
  // Ensure all aircraft entries exist
  for (const a of AIRCRAFT) {
    if (!merged.aircraft[a.id]) merged.aircraft[a.id] = defaultAircraftState(a.id);
    if (!Array.isArray(merged.aircraft[a.id].upgrades)) merged.aircraft[a.id].upgrades = [0,0,0,0,0];
  }
  merged.version = SCHEMA_VERSION;
  return merged;
}

export function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
    state = migrateState(raw);
  } catch {
    state = structuredClone(DEFAULT_STATE);
  }
}

export function saveState() {
  state.lastSave = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {}
}

export function applyOfflineEarnings() {
  const now = Date.now();
  const elapsed = (now - (state.lastTick || now)) / 1000; // seconds
  if (elapsed <= 0) { state.lastTick = now; return; }

  for (const ac of AIRCRAFT) {
    const acState = state.aircraft[ac.id];
    if (!acState || !acState.currentMission) continue;
    const m = acState.currentMission;

    if (m.endTime <= now) {
      // Mission completed while offline
      addCredits(m.payoutOnComplete);
      acState.totalMissionsFlown++;
      state.totalMissionsCompleted++;
      const drop = rollMissionCrateDrop(state.totalMissionsCompleted);
      if (drop) state.crateQueue.push(drop);
      acState.currentMission = null;
      acState.cooldownUntil = 0;
    } else {
      // Still in progress — credit passive income up to now
      const passiveSecs = Math.min(elapsed, (m.endTime - (state.lastTick || now)) / 1000);
      if (passiveSecs > 0) addCredits(m.passivePerSec * passiveSecs);
    }
  }
  state.lastTick = now;
}

// ── Computed helpers ──────────────────────────────────────────────────────────

export function getActiveMissionCount() {
  return AIRCRAFT.filter(a => {
    const ac = state.aircraft[a.id];
    return ac && ac.currentMission && ac.currentMission.endTime > Date.now();
  }).length;
}

export function canStartMission() {
  return getActiveMissionCount() < getMaxMissionSlots(state);
}

export function getTotalPassiveRate() {
  const now = Date.now();
  return AIRCRAFT.reduce((sum, a) => {
    const ac = state.aircraft[a.id];
    if (!ac || !ac.currentMission || ac.currentMission.endTime <= now) return sum;
    return sum + ac.currentMission.passivePerSec;
  }, 0);
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function addCredits(amount) {
  state.credits += amount;
  state.totalCreditsEarned += amount;
}

export function spendCredits(amount) {
  if (state.credits < amount) return false;
  state.credits -= amount;
  return true;
}

export function startMission(aircraftId, missionId) {
  const acState = state.aircraft[aircraftId];
  if (!acState || !acState.unlocked) return false;
  if (acState.currentMission) return false;
  if (!canStartMission()) return false;

  const dur = getMissionDuration(aircraftId, missionId, state);
  const payout = getMissionPayout(aircraftId, missionId, state);
  const passive = getMissionPassive(aircraftId, missionId, state);
  const now = Date.now();

  acState.currentMission = {
    missionId,
    startTime: now,
    endTime: now + dur * 1000,
    payoutOnComplete: payout,
    passivePerSec: passive,
  };
  return true;
}

export function completeMission(aircraftId) {
  const acState = state.aircraft[aircraftId];
  if (!acState || !acState.currentMission) return;
  addCredits(acState.currentMission.payoutOnComplete);
  acState.totalMissionsFlown++;
  state.totalMissionsCompleted++;

  // SR-71 zone unlock
  if (aircraftId === 'sr71') {
    const zones = ['zone_alpha','zone_bravo','zone_charlie','zone_delta','zone_echo'];
    for (const z of zones) {
      if (!state.sr71Zones.includes(z)) { state.sr71Zones.push(z); break; }
    }
  }

  const drop = rollMissionCrateDrop(state.totalMissionsCompleted);
  if (drop) state.crateQueue.push(drop);

  acState.currentMission = null;
  acState.cooldownUntil = 0;
}

export function upgradeAircraft(aircraftId, slotIndex) {
  const acState = state.aircraft[aircraftId];
  const acDef   = AIRCRAFT.find(a => a.id === aircraftId);
  if (!acState || !acDef || !acState.unlocked) return false;
  const currentTier = acState.upgrades[slotIndex];
  if (currentTier >= 5) return false;
  const cost = acDef.upgradeCosts[slotIndex][currentTier];
  if (!spendCredits(cost)) return false;
  acState.upgrades[slotIndex]++;
  return true;
}

export function unlockAircraft(aircraftId) {
  const acDef = AIRCRAFT.find(a => a.id === aircraftId);
  const acState = state.aircraft[aircraftId];
  if (!acDef || !acState || acState.unlocked) return false;
  if (!spendCredits(acDef.unlockCost)) return false;
  acState.unlocked = true;
  return true;
}

export function buyBaseUpgrade(sectionKey) {
  const currentLevel = state.baseUpgrades[sectionKey] || 0;
  const section = BASE_SECTIONS.find(s => s.key === sectionKey);
  if (!section || currentLevel >= section.upgrades.length) return false;
  const cost = section.upgrades[currentLevel].cost;
  if (!spendCredits(cost)) return false;
  state.baseUpgrades[sectionKey]++;
  return true;
}

export function prestige() {
  if (state.totalCreditsEarned < prestigeThreshold()) return false;
  state.prestigeStars++;
  // Reset credits and missions but keep aircraft unlocks, upgrades, base upgrades
  state.credits = 0;
  state.totalCreditsEarned = 0;
  state.totalMissionsCompleted = 0;
  state.activeBoosts = [];
  state.crateQueue = [];
  for (const ac of AIRCRAFT) {
    state.aircraft[ac.id].currentMission = null;
    state.aircraft[ac.id].cooldownUntil = 0;
    state.aircraft[ac.id].totalMissionsFlown = 0;
  }
  return true;
}

export function prestigeThreshold() {
  return 500000 * Math.pow(3, state.prestigeStars);
}

export function openNextCrate() {
  if (!state.crateQueue.length) return null;
  const tier = state.crateQueue.shift();
  state.totalCratesOpened++;
  const reward = rollCrate(tier);
  applyReward(reward, state);
  return { tier, reward };
}

export function buyCrate(tier) {
  const cost = CRATE_COSTS[tier];
  if (!spendCredits(cost)) return false;
  state.crateQueue.push(tier);
  return true;
}

export function pruneExpiredBoosts() {
  const now = Date.now();
  state.activeBoosts = state.activeBoosts.filter(b => b.expiresAt > now);
}
