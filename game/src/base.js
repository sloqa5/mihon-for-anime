// 5 upgrade sections, each with a list of sequential upgrades.
// Each upgrade is a one-time flat purchase (instant, no wait time).
// Section key matches state.baseUpgrades key.

export const BASE_SECTIONS = [
  {
    key: 'airfield',
    name: 'Airfield & Runways',
    icon: '✈',
    effectDesc: '+5% all passive income per upgrade',
    upgrades: [
      { name: 'Runway Extension I',    cost: 200,    desc: '+5% passive income' },
      { name: 'Runway Extension II',   cost: 500,    desc: '+5% passive income' },
      { name: 'Runway Extension III',  cost: 1200,   desc: '+5% passive income' },
      { name: 'Taxiway Lighting',      cost: 2500,   desc: '+5% passive income' },
      { name: 'Ground Radar',          cost: 5000,   desc: '+5% passive income' },
      { name: 'Foam System',           cost: 10000,  desc: '+5% passive income' },
      { name: 'Night Landing Lights',  cost: 20000,  desc: '+5% passive income' },
      { name: 'ILS Approach System',   cost: 40000,  desc: '+5% passive income' },
    ]
  },
  {
    key: 'fuel',
    name: 'Fuel & Logistics',
    icon: '⛽',
    effectDesc: '-5% all mission durations per upgrade',
    upgrades: [
      { name: 'JP-4 Reserve Tank',     cost: 400,    desc: '-5% mission durations' },
      { name: 'Fuel Pump Array',       cost: 900,    desc: '-5% mission durations' },
      { name: 'Bladder System',        cost: 2000,   desc: '-5% mission durations' },
      { name: 'Pipeline Extension',    cost: 4000,   desc: '-5% mission durations' },
      { name: 'Tanker Truck Fleet',    cost: 8000,   desc: '-5% mission durations' },
      { name: 'AVGAS Storage',         cost: 16000,  desc: '-5% mission durations' },
      { name: 'Advanced Fuel Formula', cost: 35000,  desc: '-5% mission durations' },
    ]
  },
  {
    key: 'armaments',
    name: 'Armaments & Ordnance',
    icon: '💣',
    effectDesc: '+8% all mission payouts per upgrade',
    upgrades: [
      { name: 'Weapons Cache',         cost: 300,    desc: '+8% mission payouts' },
      { name: 'Smart Bomb Stock',      cost: 700,    desc: '+8% mission payouts' },
      { name: 'AMRAAM Supply',         cost: 1500,   desc: '+8% mission payouts' },
      { name: 'Sidewinder Racks',      cost: 3000,   desc: '+8% mission payouts' },
      { name: 'Laser Guidance Suite',  cost: 6000,   desc: '+8% mission payouts' },
      { name: 'Bunker Buster Stock',   cost: 12000,  desc: '+8% mission payouts' },
      { name: 'Cannon Reserve',        cost: 25000,  desc: '+8% mission payouts' },
      { name: 'Stealth Ordnance',      cost: 50000,  desc: '+8% mission payouts' },
    ]
  },
  {
    key: 'personnel',
    name: 'Personnel & Training',
    icon: '👤',
    effectDesc: '+1 simultaneous mission slot per upgrade (base: 3)',
    upgrades: [
      { name: 'Pilot Training I',      cost: 600,    desc: '+1 mission slot (4 total)' },
      { name: 'Pilot Training II',     cost: 1400,   desc: '+1 mission slot (5 total)' },
      { name: 'Pilot Training III',    cost: 3000,   desc: '+1 mission slot (6 total)' },
      { name: 'Elite Crew Program',    cost: 6000,   desc: '+1 mission slot (7 total)' },
      { name: 'Ground Crew Expansion', cost: 12000,  desc: '+1 mission slot (8 total)' },
      { name: 'Flight Surgeon',        cost: 25000,  desc: '+1 mission slot (9 total)' },
      { name: 'Special Ops Detachment',cost: 50000,  desc: '+1 mission slot (10 total)' },
    ]
  },
  {
    key: 'command',
    name: 'Command & Intel',
    icon: '📡',
    effectDesc: '+10% global income multiplier per upgrade',
    upgrades: [
      { name: 'SIGINT Array',          cost: 1000,   desc: '+10% global income' },
      { name: 'Radar Upgrade',         cost: 2500,   desc: '+10% global income' },
      { name: 'Crypto Suite',          cost: 5000,   desc: '+10% global income' },
      { name: 'Joint Ops Center',      cost: 10000,  desc: '+10% global income' },
      { name: 'ISR Package',           cost: 20000,  desc: '+10% global income' },
      { name: 'Black Ops Division',    cost: 40000,  desc: '+10% global income' },
      { name: 'Command Bunker',        cost: 80000,  desc: '+10% global income' },
      { name: 'Strategic AI',          cost: 150000, desc: '+10% global income' },
    ]
  },
];

export function getSectionByKey(key) {
  return BASE_SECTIONS.find(s => s.key === key);
}

export function getMaxMissionSlots(state) {
  return 3 + (state.baseUpgrades.personnel || 0);
}

export function getPassiveMultiplierFromBase(state) {
  const airfield = state.baseUpgrades.airfield || 0;
  const command  = state.baseUpgrades.command  || 0;
  return (1 + airfield * 0.05) * (1 + command * 0.10);
}
