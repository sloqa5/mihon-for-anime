// Top-down silhouettes. Coords: nose at y=-0.5, tail at y=+0.5, wings on x-axis.
// Each part: { points:[[x,y],...], color:'#hex', alpha?:0-1 }

export const AIRCRAFT = [
  {
    id: 'ac130', name: 'AC-130 Gunship', role: 'Close Air Support',
    unlockCost: 0, basePassivePerSec: 1.2,
    upgradeNames: ['Airframe', 'Crew Training', 'Avionics', 'Weapons Loadout', 'Gunship Mk.II'],
    specialDesc: 'Loiter Bonus: +50% passive when another aircraft is in the same zone',
    upgradeCosts: [
      [200,600,1500,4000,10000],
      [150,450,1200,3000,8000],
      [300,900,2200,5500,14000],
      [400,1200,3000,7500,20000],
      [1000,3000,8000,20000,50000]
    ],
    color: '#5a7a3a',
    parts: [
      { points:[[0,-0.38],[0.08,-0.3],[0.09,0.28],[0.06,0.42],[0,0.45],[-0.06,0.42],[-0.09,0.28],[-0.08,-0.3]], color:'#5a7a3a' },
      { points:[[0.09,-0.05],[0.48,-0.02],[0.48,0.12],[0.09,0.1]], color:'#4a6a2a' },
      { points:[[-0.09,-0.05],[-0.48,-0.02],[-0.48,0.12],[-0.09,0.1]], color:'#4a6a2a' },
      { points:[[0.14,0.0],[0.22,0.0],[0.22,0.1],[0.14,0.1]], color:'#3a5a1a' },
      { points:[[0.26,0.0],[0.34,0.0],[0.34,0.1],[0.26,0.1]], color:'#3a5a1a' },
      { points:[[-0.14,0.0],[-0.22,0.0],[-0.22,0.1],[-0.14,0.1]], color:'#3a5a1a' },
      { points:[[-0.26,0.0],[-0.34,0.0],[-0.34,0.1],[-0.26,0.1]], color:'#3a5a1a' },
      { points:[[-0.07,0.05],[-0.09,0.05],[-0.09,0.1],[-0.07,0.1]], color:'#1a1a1a' },
      { points:[[-0.07,0.14],[-0.09,0.14],[-0.09,0.19],[-0.07,0.19]], color:'#1a1a1a' },
    ]
  },
  {
    id: 'a10', name: 'A-10 Thunderbolt II', role: 'Anti-Armor',
    unlockCost: 0, basePassivePerSec: 1.5,
    upgradeNames: ['Airframe', 'Crew Training', 'Avionics', 'Weapons Loadout', 'GAU-8 Overhaul'],
    specialDesc: 'Tank Killer: +30% payout on anti-armor missions',
    upgradeCosts: [
      [250,750,1800,4500,12000],
      [200,600,1500,3800,10000],
      [350,1050,2600,6500,17000],
      [500,1500,3800,9500,25000],
      [1200,3600,9500,24000,60000]
    ],
    color: '#6a7a4a',
    parts: [
      { points:[[0,-0.48],[0.07,-0.38],[0.08,0.08],[0.06,0.42],[0,0.45],[-0.06,0.42],[-0.08,0.08],[-0.07,-0.38]], color:'#6a7a4a' },
      { points:[[0.08,-0.08],[0.48,-0.05],[0.48,0.1],[0.08,0.1]], color:'#5a6a3a' },
      { points:[[-0.08,-0.08],[-0.48,-0.05],[-0.48,0.1],[-0.08,0.1]], color:'#5a6a3a' },
      { points:[[0.14,-0.05],[0.27,-0.05],[0.27,0.26],[0.14,0.26]], color:'#4a5a2a' },
      { points:[[-0.14,-0.05],[-0.27,-0.05],[-0.27,0.26],[-0.14,0.26]], color:'#4a5a2a' },
      { points:[[-0.22,0.38],[0.22,0.38],[0.22,0.46],[-0.22,0.46]], color:'#5a6a3a' },
    ]
  },
  {
    id: 'f16', name: 'F-16 Fighting Falcon', role: 'Air Superiority',
    unlockCost: 2500, basePassivePerSec: 2.5,
    upgradeNames: ['Airframe', 'Crew Training', 'Avionics', 'Weapons Loadout', 'Viper Aggressor'],
    specialDesc: 'Dogfight Pro: +20% income per other Air Superiority mission active',
    upgradeCosts: [
      [500,1500,3800,9500,25000],
      [400,1200,3000,7500,20000],
      [600,1800,4500,11000,28000],
      [800,2400,6000,15000,40000],
      [2000,6000,15000,38000,95000]
    ],
    color: '#7a8a9a',
    parts: [
      { points:[[0,-0.45],[0.04,-0.35],[0.08,-0.2],[0.42,0.05],[0.38,0.15],[0.12,0.1],[0.07,0.25],[0.05,0.38],[0,0.45],[-0.05,0.38],[-0.07,0.25],[-0.12,0.1],[-0.38,0.15],[-0.42,0.05],[-0.08,-0.2],[-0.04,-0.35]], color:'#7a8a9a' },
      { points:[[0.08,0.3],[0.3,0.35],[0.25,0.44],[0.08,0.4]], color:'#6a7a8a' },
      { points:[[-0.08,0.3],[-0.3,0.35],[-0.25,0.44],[-0.08,0.4]], color:'#6a7a8a' },
      { points:[[0.04,-0.15],[-0.04,-0.15],[-0.03,0.0],[0.03,0.0]], color:'#4a5a6a' },
    ]
  },
  {
    id: 'ah64', name: 'AH-64 Apache', role: 'Anti-Armor / CAS',
    unlockCost: 5000, basePassivePerSec: 3.0,
    upgradeNames: ['Airframe', 'Crew Training', 'Avionics', 'Weapons Loadout', 'Longbow Radar'],
    specialDesc: 'Night Stalker: +25% payout on all nocturnal missions',
    upgradeCosts: [
      [750,2250,5600,14000,37000],
      [600,1800,4500,11000,29000],
      [900,2700,6800,17000,44000],
      [1200,3600,9000,22500,60000],
      [3000,9000,22500,56000,140000]
    ],
    color: '#4a6a3a',
    parts: [
      { points:[[0,-0.35],[0.08,-0.28],[0.1,0.05],[0.08,0.18],[0.03,0.48],[0,0.5],[-0.03,0.48],[-0.08,0.18],[-0.1,0.05],[-0.08,-0.28]], color:'#4a6a3a' },
      { points:[[0.08,-0.1],[0.32,-0.05],[0.32,0.1],[0.08,0.08]], color:'#3a5a2a' },
      { points:[[-0.08,-0.1],[-0.32,-0.05],[-0.32,0.1],[-0.08,0.08]], color:'#3a5a2a' },
      { points:[[-0.44,-0.02],[0.44,-0.02],[0.44,0.02],[-0.44,0.02]], color:'#2a4a1a', alpha:0.7 },
      { points:[[-0.04,0.45],[-0.08,0.45],[-0.08,0.5],[-0.04,0.5]], color:'#2a4a1a' },
    ]
  },
  {
    id: 'f22', name: 'F-22 Raptor', role: 'Stealth Strike',
    unlockCost: 8000, basePassivePerSec: 4.0,
    upgradeNames: ['Airframe', 'Crew Training', 'Avionics', 'Weapons Loadout', 'Stealth Skin'],
    specialDesc: 'Ghost Mode: 50% chance mission completes 25% faster',
    upgradeCosts: [
      [1200,3600,9000,22500,60000],
      [1000,3000,7500,18750,50000],
      [1400,4200,10500,26250,70000],
      [1800,5400,13500,33750,90000],
      [4500,13500,33750,84000,210000]
    ],
    color: '#8a9aaa',
    parts: [
      { points:[[0,-0.48],[0.05,-0.35],[0.48,0.1],[0.35,0.25],[0.18,0.35],[0.12,0.45],[0,0.48],[-0.12,0.45],[-0.18,0.35],[-0.35,0.25],[-0.48,0.1],[-0.05,-0.35]], color:'#8a9aaa' },
      { points:[[0.1,0.3],[0.22,0.42],[0.15,0.48],[0.05,0.38]], color:'#7a8a9a' },
      { points:[[-0.1,0.3],[-0.22,0.42],[-0.15,0.48],[-0.05,0.38]], color:'#7a8a9a' },
    ]
  },
  {
    id: 'c17', name: 'C-17 Globemaster', role: 'Strategic Airlift',
    unlockCost: 15000, basePassivePerSec: 5.5,
    upgradeNames: ['Airframe', 'Crew Training', 'Avionics', 'Cargo Systems', 'JATO Boost'],
    specialDesc: 'Logistics King: building upgrade costs -10%',
    upgradeCosts: [
      [2500,7500,18750,46875,117000],
      [2000,6000,15000,37500,93750],
      [3000,9000,22500,56250,140000],
      [4000,12000,30000,75000,187500],
      [10000,30000,75000,187500,468000]
    ],
    color: '#6a7a8a',
    parts: [
      { points:[[0,-0.4],[0.08,-0.35],[0.09,0.32],[0.06,0.42],[0,0.45],[-0.06,0.42],[-0.09,0.32],[-0.08,-0.35]], color:'#6a7a8a' },
      { points:[[0.09,-0.1],[0.46,-0.06],[0.46,0.12],[0.09,0.1]], color:'#5a6a7a' },
      { points:[[-0.09,-0.1],[-0.46,-0.06],[-0.46,0.12],[-0.09,0.1]], color:'#5a6a7a' },
      { points:[[0.14,-0.02],[0.22,-0.02],[0.22,0.1],[0.14,0.1]], color:'#4a5a6a' },
      { points:[[0.28,-0.02],[0.36,-0.02],[0.36,0.1],[0.28,0.1]], color:'#4a5a6a' },
      { points:[[-0.14,-0.02],[-0.22,-0.02],[-0.22,0.1],[-0.14,0.1]], color:'#4a5a6a' },
      { points:[[-0.28,-0.02],[-0.36,-0.02],[-0.36,0.1],[-0.28,0.1]], color:'#4a5a6a' },
      { points:[[-0.2,0.37],[0.2,0.37],[0.2,0.44],[-0.2,0.44]], color:'#5a6a7a' },
    ]
  },
  {
    id: 'kc135', name: 'KC-135 Stratotanker', role: 'Air Refueling',
    unlockCost: 20000, basePassivePerSec: 6.0,
    upgradeNames: ['Airframe', 'Crew Training', 'Avionics', 'Fuel Systems', 'Buddy Store'],
    specialDesc: 'Tanker Support: all aircraft mission durations -15% while KC-135 deployed',
    upgradeCosts: [
      [3500,10500,26250,65625,164000],
      [2800,8400,21000,52500,131000],
      [4200,12600,31500,78750,196000],
      [5600,16800,42000,105000,262000],
      [14000,42000,105000,262000,655000]
    ],
    color: '#7a8a7a',
    parts: [
      { points:[[0,-0.42],[0.06,-0.38],[0.06,0.35],[0,0.45],[-0.06,0.35],[-0.06,-0.38]], color:'#7a8a7a' },
      { points:[[0.06,-0.08],[0.44,0.08],[0.44,0.2],[0.06,0.12]], color:'#6a7a6a' },
      { points:[[-0.06,-0.08],[-0.44,0.08],[-0.44,0.2],[-0.06,0.12]], color:'#6a7a6a' },
      { points:[[0.1,0.0],[0.19,0.04],[0.19,0.14],[0.1,0.1]], color:'#5a6a5a' },
      { points:[[0.22,0.04],[0.31,0.07],[0.31,0.17],[0.22,0.13]], color:'#5a6a5a' },
      { points:[[-0.1,0.0],[-0.19,0.04],[-0.19,0.14],[-0.1,0.1]], color:'#5a6a5a' },
      { points:[[-0.22,0.04],[-0.31,0.07],[-0.31,0.17],[-0.22,0.13]], color:'#5a6a5a' },
      { points:[[-0.02,0.4],[0.02,0.4],[0.025,0.52],[-0.025,0.52]], color:'#4a5a4a' },
    ]
  },
  {
    id: 'b52', name: 'B-52 Stratofortress', role: 'Strategic Bombing',
    unlockCost: 25000, basePassivePerSec: 8.0,
    upgradeNames: ['Airframe', 'Crew Training', 'Avionics', 'Bomb Bay', 'BUFF Enhancement'],
    specialDesc: 'Arc Light: ×2 payout when 3+ other aircraft are deployed simultaneously',
    upgradeCosts: [
      [4500,13500,33750,84375,210000],
      [3600,10800,27000,67500,168000],
      [5400,16200,40500,101250,252000],
      [7200,21600,54000,135000,337000],
      [18000,54000,135000,337500,843000]
    ],
    color: '#5a5a6a',
    parts: [
      { points:[[0,-0.46],[0.04,-0.4],[0.04,0.42],[0,0.46],[-0.04,0.42],[-0.04,-0.4]], color:'#5a5a6a' },
      { points:[[0.04,-0.12],[0.5,0.16],[0.5,0.28],[0.04,0.2]], color:'#4a4a5a' },
      { points:[[-0.04,-0.12],[-0.5,0.16],[-0.5,0.28],[-0.04,0.2]], color:'#4a4a5a' },
      { points:[[0.1,0.0],[0.18,0.04],[0.18,0.12],[0.1,0.08]], color:'#3a3a4a' },
      { points:[[0.2,0.04],[0.28,0.07],[0.28,0.15],[0.2,0.11]], color:'#3a3a4a' },
      { points:[[0.3,0.08],[0.38,0.11],[0.38,0.19],[0.3,0.15]], color:'#3a3a4a' },
      { points:[[0.4,0.12],[0.48,0.15],[0.48,0.23],[0.4,0.19]], color:'#3a3a4a' },
      { points:[[-0.1,0.0],[-0.18,0.04],[-0.18,0.12],[-0.1,0.08]], color:'#3a3a4a' },
      { points:[[-0.2,0.04],[-0.28,0.07],[-0.28,0.15],[-0.2,0.11]], color:'#3a3a4a' },
      { points:[[-0.3,0.08],[-0.38,0.11],[-0.38,0.19],[-0.3,0.15]], color:'#3a3a4a' },
      { points:[[-0.4,0.12],[-0.48,0.15],[-0.48,0.23],[-0.4,0.19]], color:'#3a3a4a' },
    ]
  },
  {
    id: 'e3', name: 'E-3 Sentry', role: 'AWACS / ISR',
    unlockCost: 50000, basePassivePerSec: 10.0,
    upgradeNames: ['Airframe', 'Crew Training', 'Avionics', 'Radar Suite', 'Joint STARS'],
    specialDesc: 'Force Multiplier: all other aircraft income ×1.3 while E-3 deployed',
    upgradeCosts: [
      [9000,27000,67500,168750,421000],
      [7200,21600,54000,135000,337000],
      [10800,32400,81000,202500,506000],
      [14400,43200,108000,270000,675000],
      [36000,108000,270000,675000,1687000]
    ],
    color: '#8a7a6a',
    parts: [
      { points:[[0,-0.42],[0.06,-0.38],[0.07,0.36],[0,0.44],[-0.07,0.36],[-0.06,-0.38]], color:'#8a7a6a' },
      { points:[[0.07,-0.06],[0.46,0.06],[0.46,0.18],[0.07,0.12]], color:'#7a6a5a' },
      { points:[[-0.07,-0.06],[-0.46,0.06],[-0.46,0.18],[-0.07,0.12]], color:'#7a6a5a' },
      { points:[[0.12,-0.01],[0.21,0.03],[0.21,0.13],[0.12,0.09]], color:'#6a5a4a' },
      { points:[[0.25,0.03],[0.34,0.06],[0.34,0.16],[0.25,0.12]], color:'#6a5a4a' },
      { points:[[-0.12,-0.01],[-0.21,0.03],[-0.21,0.13],[-0.12,0.09]], color:'#6a5a4a' },
      { points:[[-0.25,0.03],[-0.34,0.06],[-0.34,0.16],[-0.25,0.12]], color:'#6a5a4a' },
      { points:[[-0.03,-0.14],[0.03,-0.14],[0.03,0.08],[-0.03,0.08]], color:'#5a4a3a' },
      { points:[[-0.2,-0.18],[0.2,-0.18],[0.2,0.04],[-0.2,0.04]], color:'#aaa08a' },
    ]
  },
  {
    id: 'sr71', name: 'SR-71 Blackbird', role: 'Reconnaissance',
    unlockCost: 100000, basePassivePerSec: 15.0,
    upgradeNames: ['Airframe', 'Crew Training', 'Avionics', 'Recon Suite', 'Blackbird Elite'],
    specialDesc: 'Deep Recon: each mission completion unlocks a bonus mission zone for all aircraft',
    upgradeCosts: [
      [18000,54000,135000,337500,843000],
      [14400,43200,108000,270000,675000],
      [21600,64800,162000,405000,1012000],
      [28800,86400,216000,540000,1350000],
      [72000,216000,540000,1350000,3375000]
    ],
    color: '#2a2a3a',
    parts: [
      { points:[[0,-0.5],[0.04,-0.3],[0.18,-0.1],[0.22,0.0],[0.25,0.15],[0.22,0.3],[0.15,0.35],[0.08,0.42],[0,0.48],[-0.08,0.42],[-0.15,0.35],[-0.22,0.3],[-0.25,0.15],[-0.22,0.0],[-0.18,-0.1],[-0.04,-0.3]], color:'#2a2a3a' },
      { points:[[0.18,-0.06],[0.25,0.02],[0.25,0.26],[0.18,0.3]], color:'#3a3a4a' },
      { points:[[-0.18,-0.06],[-0.25,0.02],[-0.25,0.26],[-0.18,0.3]], color:'#3a3a4a' },
      { points:[[0.13,-0.15],[0.17,-0.06],[0.21,-0.03],[0.16,-0.13]], color:'#4a4a5a' },
      { points:[[-0.13,-0.15],[-0.17,-0.06],[-0.21,-0.03],[-0.16,-0.13]], color:'#4a4a5a' },
    ]
  },
];

export function getAircraftById(id) {
  return AIRCRAFT.find(a => a.id === id);
}
