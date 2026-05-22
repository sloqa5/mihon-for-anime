import { weightedRandom, randomBetween, randomInt } from './utils.js';

// Loot tables by crate tier
const LOOT_TABLES = {
  common: [
    { weight: 60, value: () => ({ type:'credits', amount: randomInt(1000, 5000), label: null }) },
    { weight: 20, value: () => ({ type:'boost', kind:'income',  multiplier:1.5, duration:30*60*1000, label:null }) },
    { weight: 15, value: () => ({ type:'boost', kind:'speed',   multiplier:1.5, duration:30*60*1000, label:null }) },
    { weight:  5, value: () => ({ type:'instant_complete', count:1, label:null }) },
  ],
  rare: [
    { weight: 50, value: () => ({ type:'credits', amount: randomInt(10000, 40000), label:null }) },
    { weight: 20, value: () => ({ type:'boost', kind:'income',  multiplier:2.0, duration:60*60*1000, label:null }) },
    { weight: 15, value: () => ({ type:'boost', kind:'payout',  multiplier:2.0, duration:60*60*1000, label:null }) },
    { weight: 10, value: () => ({ type:'instant_complete', count:'all', label:null }) },
    { weight:  5, value: () => ({ type:'crates', count:2, tier:'common', label:null }) },
  ],
  epic: [
    { weight: 40, value: () => ({ type:'credits', amount: randomInt(80000, 200000), label:null }) },
    { weight: 20, value: () => ({ type:'boost', kind:'income',  multiplier:3.0, duration:2*60*60*1000, label:null }) },
    { weight: 15, value: () => ({ type:'boost', kind:'payout',  multiplier:3.0, duration:2*60*60*1000, label:null }) },
    { weight: 15, value: () => ({ type:'prestige_bonus', stars:1, label:null }) },
    { weight: 10, value: () => ({ type:'unlock_next', label:null }) },
  ],
};

export const CRATE_COSTS = { common: 500, rare: 5000, epic: 50000 };

export const CRATE_COLORS = {
  common: { bg:'#1a3a1a', border:'#4ade80', glow:'rgba(74,222,128,0.4)', label:'SUPPLY CRATE' },
  rare:   { bg:'#1a1a3a', border:'#60a5fa', glow:'rgba(96,165,250,0.4)', label:'RARE CRATE' },
  epic:   { bg:'#2a1a0a', border:'#fbbf24', glow:'rgba(251,191,36,0.5)',  label:'EPIC CRATE' },
};

export function rollCrate(tier) {
  const table = LOOT_TABLES[tier];
  const roller = weightedRandom(table);
  const reward = roller();
  reward.label = formatRewardLabel(reward);
  return reward;
}

function formatRewardLabel(reward) {
  switch (reward.type) {
    case 'credits':
      return `+${Math.round(reward.amount).toLocaleString()} Credits`;
    case 'boost':
      const mins = Math.round(reward.duration / 60000);
      const name = reward.kind === 'income' ? 'Income' : reward.kind === 'payout' ? 'Payout' : 'Speed';
      return `${name} ×${reward.multiplier} for ${mins}m`;
    case 'instant_complete':
      return reward.count === 'all' ? 'Complete All Missions!' : 'Instant Mission Complete ×1';
    case 'crates':
      return `+${reward.count} Crates!`;
    case 'prestige_bonus':
      return `+${reward.stars} Prestige Star!`;
    case 'unlock_next':
      return 'Unlock Next Aircraft Free!';
    default:
      return 'Mystery Reward';
  }
}

// Called on mission completion — returns tier to queue, or null
export function rollMissionCrateDrop(totalMissions) {
  // Milestone guarantees
  if (totalMissions % 50 === 0) return 'epic';
  if (totalMissions % 10 === 0) return 'rare';
  // Random drop
  const r = Math.random();
  if (r < 0.01) return 'epic';
  if (r < 0.06) return 'rare';
  if (r < 0.22) return 'common';
  return null;
}

export function applyReward(reward, state) {
  const now = Date.now();
  switch (reward.type) {
    case 'credits':
      state.credits += reward.amount;
      state.totalCreditsEarned += reward.amount;
      break;
    case 'boost':
      // Stack or extend existing boost of same kind
      const existing = state.activeBoosts.find(b => b.type === reward.kind && b.multiplier === reward.multiplier);
      if (existing) {
        existing.expiresAt = Math.max(existing.expiresAt, now) + reward.duration;
      } else {
        state.activeBoosts.push({ type: reward.kind, multiplier: reward.multiplier, expiresAt: now + reward.duration });
      }
      break;
    case 'instant_complete':
      // Flag for main.js to handle
      state._pendingInstantComplete = reward.count;
      break;
    case 'crates':
      for (let i = 0; i < reward.count; i++) {
        state.crateQueue.push(reward.tier);
      }
      break;
    case 'prestige_bonus':
      state.prestigeStars += reward.stars;
      break;
    case 'unlock_next':
      state._pendingUnlockNext = true;
      break;
  }
}
