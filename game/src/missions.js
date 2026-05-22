// tier 1 = always available, tier 2 = requires Weapons Loadout upgrade slot >= 1
// duration in seconds, payout in credits, passive in credits/sec
export const MISSIONS = {
  ac130: [
    { id:'troop_support',     name:'Troop Support',       desc:'Suppress enemy infantry positions.',    duration:180,  payout:500,   passive:1.2, tier:1 },
    { id:'supply_interdiction',name:'Supply Interdiction', desc:'Cut enemy logistics lines.',            duration:300,  payout:850,   passive:1.8, tier:1 },
    { id:'night_raid',        name:'Night Raid',           desc:'Strike fortifications under darkness.', duration:480,  payout:1400,  passive:2.5, tier:1 },
    { id:'fortress_assault',  name:'Fortress Assault',     desc:'Breach heavily defended positions.',    duration:720,  payout:2200,  passive:3.5, tier:2 },
    { id:'danger_close',      name:'Danger Close',         desc:'Fire support at extreme proximity.',    duration:1200, payout:4000,  passive:5.0, tier:2 },
  ],
  a10: [
    { id:'tank_busting',      name:'Tank Busting',         desc:'Engage armored columns.',               duration:240,  payout:700,   passive:1.5, tier:1 },
    { id:'convoy_strike',     name:'Convoy Strike',        desc:'Destroy enemy resupply convoys.',       duration:360,  payout:1100,  passive:2.2, tier:1 },
    { id:'arty_suppression',  name:'Arty Suppression',     desc:'Neutralize enemy artillery batteries.', duration:540,  payout:1800,  passive:3.0, tier:1 },
    { id:'armored_brkthru',   name:'Armored Breakthrough', desc:'Punch through fortified armor lines.',  duration:840,  payout:2800,  passive:4.5, tier:2 },
    { id:'iron_fist',         name:'Iron Fist',            desc:'Total anti-armor dominance sweep.',     duration:1500, payout:5000,  passive:6.5, tier:2 },
  ],
  f16: [
    { id:'patrol_sweep',      name:'Patrol Sweep',         desc:'Establish air presence over the AO.',   duration:360,  payout:1200,  passive:2.5, tier:1 },
    { id:'dogfight',          name:'Dogfight',             desc:'Engage enemy fighters head-on.',        duration:540,  payout:1800,  passive:3.5, tier:1 },
    { id:'scramble',          name:'Scramble',             desc:'Emergency intercept of enemy aircraft.',duration:720,  payout:2500,  passive:4.5, tier:1 },
    { id:'cap',               name:'Combat Air Patrol',    desc:'Sustained defensive air coverage.',     duration:1080, payout:4000,  passive:6.0, tier:2 },
    { id:'acm_training',      name:'ACM Training',         desc:'Push limits in advanced combat maneuvers.', duration:600, payout:2200, passive:4.2, tier:2 },
  ],
  ah64: [
    { id:'urban_combat',      name:'Urban Combat',         desc:'Clear enemy forces from city blocks.',  duration:480,  payout:1500,  passive:3.0, tier:1 },
    { id:'convoy_escort',     name:'Convoy Escort',        desc:'Protect supply convoys from ambush.',   duration:600,  payout:1900,  passive:3.8, tier:1 },
    { id:'anti_tank',         name:'Anti-Tank Sweep',      desc:'Hellfire-guided armor engagement.',     duration:780,  payout:2600,  passive:4.8, tier:1 },
    { id:'nap_of_earth',      name:'Nap of Earth',         desc:'Ultra-low attack run evading radar.',   duration:1080, payout:3800,  passive:6.2, tier:2 },
    { id:'deep_strike',       name:'Deep Strike',          desc:'Long-range deep interdiction assault.', duration:1800, payout:6500,  passive:8.0, tier:2 },
  ],
  f22: [
    { id:'sead',              name:'SEAD Mission',         desc:'Suppress enemy air defences.',          duration:600,  payout:2000,  passive:4.0, tier:1 },
    { id:'precision_strike',  name:'Precision Strike',     desc:'Laser-guided strike on HVT.',           duration:900,  payout:3000,  passive:5.5, tier:1 },
    { id:'stealth_recon',     name:'Stealthy Recon',       desc:'Undetected ISR over denied airspace.',  duration:720,  payout:2600,  passive:4.8, tier:1 },
    { id:'ghost_protocol',    name:'Ghost Protocol',       desc:'Deep-penetration covert strike.',       duration:1440, payout:5500,  passive:8.0, tier:2 },
    { id:'raptor_strike',     name:'Raptor Strike',        desc:'Full-spectrum air dominance package.',  duration:2400, payout:9000,  passive:11.0,tier:2 },
  ],
  c17: [
    { id:'supply_drop',       name:'Supply Drop',          desc:'Airdrop critical supplies to troops.',  duration:720,  payout:2800,  passive:5.5, tier:1 },
    { id:'troop_transport',   name:'Troop Transport',      desc:'Rapid deployment of ground forces.',    duration:900,  payout:3500,  passive:6.5, tier:1 },
    { id:'humanitarian_aid',  name:'Humanitarian Aid',     desc:'Emergency relief delivery.',            duration:1080, payout:4200,  passive:7.0, tier:1 },
    { id:'lapes_drop',        name:'LAPES Drop',           desc:'Low-altitude parachute extraction.',    duration:1440, payout:5800,  passive:8.5, tier:2 },
    { id:'airdrop_ops',       name:'Airdrop Ops',          desc:'Mass equipment airdrop under fire.',    duration:2400, payout:9500,  passive:11.5,tier:2 },
  ],
  kc135: [
    { id:'extend_range',      name:'Extend Range',         desc:'Refuel strike package mid-mission.',    duration:900,  payout:3200,  passive:6.0, tier:1 },
    { id:'buddy_refuel',      name:'Buddy Refuel',         desc:'Emergency refuel of damaged aircraft.', duration:720,  payout:2600,  passive:5.2, tier:1 },
    { id:'emg_tanker',        name:'Emergency Tanker',     desc:'Critical fuel-out rescue operation.',   duration:600,  payout:2200,  passive:4.8, tier:1 },
    { id:'orbit_refuel',      name:'Orbit Refuel',         desc:'Sustained tanker orbit for large ops.', duration:1800, payout:6000,  passive:9.0, tier:2 },
    { id:'global_reach',      name:'Global Reach',         desc:'Transoceanic refueling operation.',     duration:3000, payout:11000, passive:13.0,tier:2 },
  ],
  b52: [
    { id:'carpet_bomb',       name:'Carpet Bomb',          desc:'Saturation strike on open terrain.',    duration:1200, payout:4500,  passive:8.0, tier:1 },
    { id:'arc_light',         name:'Arc Light',            desc:'Classic B-52 mass bombing run.',        duration:1800, payout:7000,  passive:10.5,tier:1 },
    { id:'steel_rain',        name:'Steel Rain',           desc:'Precision-guided payload delivery.',    duration:2400, payout:9500,  passive:12.0,tier:1 },
    { id:'long_range_strike', name:'Long Range Strike',    desc:'Launch from thousands of miles.',       duration:3600, payout:15000, passive:16.0,tier:2 },
    { id:'saturation_attack', name:'Saturation Attack',    desc:'Total theater-wide devastation.',       duration:5400, payout:25000, passive:22.0,tier:2 },
  ],
  e3: [
    { id:'awacs_patrol',      name:'AWACS Patrol',         desc:'Wide-area radar surveillance.',         duration:1800, payout:8000,  passive:10.0,tier:1 },
    { id:'elec_warfare',      name:'Electronic Warfare',   desc:'Disrupt enemy comms and radar.',        duration:2400, payout:11000, passive:12.5,tier:1 },
    { id:'battlefield_intel', name:'Battlefield Intel',    desc:'Real-time targeting data for all.',     duration:3000, payout:14000, passive:14.0,tier:1 },
    { id:'c2',                name:'Command & Control',    desc:'Coordinate full theatre operations.',   duration:4200, payout:20000, passive:18.0,tier:2 },
    { id:'zone_reveal_e3',    name:'Zone Reveal',          desc:'Uncover hidden mission opportunities.', duration:3600, payout:17000, passive:16.0,tier:2 },
  ],
  sr71: [
    { id:'zone_reveal',       name:'Zone Reveal',          desc:'Photograph denied airspace.',           duration:2700, payout:12000, passive:15.0,tier:1 },
    { id:'deep_recon',        name:'Deep Recon',           desc:'Penetrate deep into enemy territory.',  duration:3600, payout:16000, passive:18.0,tier:1 },
    { id:'photo_intel',       name:'Photo Intel',          desc:'High-resolution target packages.',      duration:2400, payout:11000, passive:14.5,tier:1 },
    { id:'enemy_mapping',     name:'Enemy Mapping',        desc:'Map full enemy order of battle.',       duration:4800, payout:22000, passive:22.0,tier:2 },
    { id:'ghost_run',         name:'Ghost Run',            desc:'Mach-3 sprint through hostile skies.',  duration:1800, payout:18000, passive:25.0,tier:2 },
  ],
};

export function getMissionsByAircraft(id) {
  return MISSIONS[id] || [];
}

export function getMission(aircraftId, missionId) {
  return (MISSIONS[aircraftId] || []).find(m => m.id === missionId);
}

export function getMissionDuration(aircraftId, missionId, state) {
  const m = getMission(aircraftId, missionId);
  if (!m) return 0;
  const ac = state.aircraft[aircraftId];
  const crewTier = ac ? ac.upgrades[1] : 0;
  const crewBonus = 1 - crewTier * 0.1;

  // Building bonuses
  const fuelBonus = 1 - (state.baseUpgrades.fuel || 0) * 0.05;
  const intelBonus = 1 - (state.baseUpgrades.command || 0) * 0.03;

  // KC-135 tanker bonus
  const kc135 = state.aircraft.kc135;
  const tankerBonus = (kc135 && kc135.currentMission) ? 0.85 : 1;

  return Math.round(m.duration * crewBonus * fuelBonus * intelBonus * tankerBonus);
}

export function getMissionPayout(aircraftId, missionId, state) {
  const m = getMission(aircraftId, missionId);
  if (!m) return 0;
  const ac = state.aircraft[aircraftId];
  const avionicsTier = ac ? ac.upgrades[2] : 0;
  const avionicsBonus = 1 + avionicsTier * 0.15;

  const armBonus = 1 + (state.baseUpgrades.armaments || 0) * 0.08;
  const cmdBonus = 1 + (state.baseUpgrades.command || 0) * 0.04;

  const prestigeBonus = 1 + (state.prestigeStars || 0) * 0.25;

  // E-3 force multiplier
  const e3 = state.aircraft.e3;
  const e3Bonus = (e3 && e3.currentMission) ? 1.3 : 1;

  // Payout boost from active boosts
  const now = Date.now();
  const payoutBoost = (state.activeBoosts || [])
    .filter(b => b.type === 'payout' && b.expiresAt > now)
    .reduce((acc, b) => acc * b.multiplier, 1);

  return Math.round(m.payout * avionicsBonus * armBonus * cmdBonus * prestigeBonus * e3Bonus * payoutBoost);
}

export function getMissionPassive(aircraftId, missionId, state) {
  const m = getMission(aircraftId, missionId);
  if (!m) return 0;
  const ac = state.aircraft[aircraftId];
  const airframeTier = ac ? ac.upgrades[0] : 0;
  const airframeBonus = 1 + airframeTier * 0.20;

  const airfieldBonus = 1 + (state.baseUpgrades.airfield || 0) * 0.05;
  const fuelBonus = 1 + (state.baseUpgrades.fuel || 0) * 0.02;
  const cmdBonus = 1 + (state.baseUpgrades.command || 0) * 0.04;

  const prestigeBonus = 1 + (state.prestigeStars || 0) * 0.25;

  const e3 = state.aircraft.e3;
  const e3Bonus = (e3 && e3.currentMission) ? 1.3 : 1;

  const now = Date.now();
  const incomeBoost = (state.activeBoosts || [])
    .filter(b => b.type === 'income' && b.expiresAt > now)
    .reduce((acc, b) => acc * b.multiplier, 1);

  return m.passive * airframeBonus * airfieldBonus * fuelBonus * cmdBonus * prestigeBonus * e3Bonus * incomeBoost;
}
