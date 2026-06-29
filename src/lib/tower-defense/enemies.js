export const ENEMY_TYPES = [
  { id: 'basic', emoji: '🟢', name: 'Basic',  speed: 1,   health: 20, reward: 10, firstLevel: 1 },
  { id: 'fast',  emoji: '🔵', name: 'Fast',   speed: 2,   health: 10, reward: 15, firstLevel: 2 },
  { id: 'heavy', emoji: '🟠', name: 'Heavy',  speed: 0.7, health: 60, reward: 25, firstLevel: 3 },
  { id: 'boss',  emoji: '🔴', name: 'Boss',   speed: 0.5, health: 200, reward: 50, firstLevel: 4 },
];

export function scaledHealth(baseHealth, level) {
  return Math.round(baseHealth * (1 + (level - 1) * 0.3));
}
