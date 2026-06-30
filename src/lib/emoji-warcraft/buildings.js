export const BUILDINGS = [
  { id: 'townHall',  emoji: '🏰', name: 'Town Hall', cost: { g: 0, w: 0 }, hp: 500, produces: 'peasant', range: 0 },
  { id: 'barracks',  emoji: '⚔️', name: 'Barracks',  cost: { g: 100, w: 50 }, hp: 200, produces: 'soldier', range: 0 },
  { id: 'farm',      emoji: '🌾', name: 'Farm',      cost: { g: 50, w: 0 },  hp: 100, produces: null, range: 0, popBonus: 5 },
  { id: 'tower',     emoji: '🗼', name: 'Tower',     cost: { g: 75, w: 25 }, hp: 150, produces: null, range: 2, damage: 8 },
  { id: 'lumberMill',emoji: '🪵', name: 'Lumber Mill', cost: { g: 60, w: 0 }, hp: 100, produces: null, range: 0 },
  { id: 'goldMine',  emoji: '⛏️', name: 'Gold Mine', cost: { g: 80, w: 0 }, hp: 80, produces: null, range: 0 },
];
