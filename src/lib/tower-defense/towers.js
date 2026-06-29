export const TOWERS = [
  { id: 'arrow',  emoji: '🏹', name: 'Arrow',     cost: 30, damage: 10, range: 2, fireRate: 1,   splash: 0,   slow: 0,   chain: 0,   desc: 'Single target, fast fire' },
  { id: 'cannon', emoji: '💣', name: 'Cannon',    cost: 50, damage: 25, range: 2, fireRate: 2,   splash: 1,   slow: 0,   chain: 0,   desc: 'Area splash, slow fire' },
  { id: 'ice',    emoji: '❄️', name: 'Ice',       cost: 40, damage: 5,  range: 2, fireRate: 1.5, splash: 0,   slow: 0.5, chain: 0,   desc: 'Slows enemies' },
  { id: 'bolt',   emoji: '⚡', name: 'Lightning', cost: 70, damage: 15, range: 3, fireRate: 1.5, splash: 0,   slow: 0,   chain: 3,   desc: 'Chains to 3 enemies' },
  { id: 'star',   emoji: '🌟', name: 'Star',      cost: 100,damage: 40, range: 3, fireRate: 2.5, splash: 0,   slow: 0,   chain: 0,   desc: 'Single target, huge damage' },
];

export function upgradedStats(towerBase, level) {
  const mult = 1 + level * 0.5;
  return {
    damage: Math.round(towerBase.damage * mult),
    range: Math.round(towerBase.range * mult),
    upgradeCost: Math.round(towerBase.cost * (level + 1)),
  };
}
