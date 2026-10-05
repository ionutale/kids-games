import { makeRng, shuffle } from '../trainers/rng.js';

export const CATEGORIES = {
  animals: { id: 'animals', name: 'Animals', icon: '🐾', items: ['🐶', '🐱', '🐰', '🐸', '🦁', '🐘', '🦊', '🐼'] },
  food: { id: 'food', name: 'Food', icon: '🍽️', items: ['🍎', '🍕', '🍦', '🍪', '🍌', '🍇', '🍩', '🍭'] },
  vehicles: { id: 'vehicles', name: 'Vehicles', icon: '🚦', items: ['🚗', '🚌', '🚲', '✈️', '🚢', '🚁', '🚂', '🏎️'] },
  nature: { id: 'nature', name: 'Nature', icon: '🌿', items: ['🌳', '🌺', '🌻', '🌊', '⛰️', '🌈', '🌙', '☀️'] },
  clothes: { id: 'clothes', name: 'Clothes', icon: '👕', items: ['👖', '👗', '🧢', '👟', '🧥', '🧦', '🧣', '🩳'] },
  toys: { id: 'toys', name: 'Toys', icon: '🧸', items: ['🎲', '🎨', '🪁', '🎪', '🎭', '🎯', '🎮', '🪀'] }
};

/** Category sets by bin count — difficulty levers on the ladder. */
export const SETS = [
  ['animals', 'food'],
  ['vehicles', 'nature'],
  ['clothes', 'toys']
];
export const SETS_3 = [
  ['animals', 'food', 'vehicles'],
  ['nature', 'clothes', 'toys']
];
export const SETS_4 = [
  ['animals', 'food', 'vehicles', 'nature'],
  ['clothes', 'toys', 'animals', 'food']
];

/** Ladder difficulty: L1–4 → 2 bins, L5–7 → 3 bins, L8–10 → 4 bins. */
export function binsForLevel(level) {
  if (level <= 4) return 2;
  if (level <= 7) return 3;
  return 4;
}

/** Ladder difficulty: 6 items per round at L1, one more every two levels, cap 10. */
export function itemsForLevel(level) {
  const n = Math.max(1, level);
  return Math.min(6 + Math.floor((n - 1) / 2), 10);
}

export function setFor(level) {
  const n = binsForLevel(level);
  const pool = n === 2 ? SETS : n === 3 ? SETS_3 : SETS_4;
  const i = (((level - 1) % pool.length) + pool.length) % pool.length;
  return pool[i];
}

/**
 * Builds one round: bins from the level's category set and `count` shuffled
 * items sampled only from those categories.
 */
export function buildRound(level, count = itemsForLevel(level), rng = Math.random) {
  const r = typeof rng === 'function' ? rng : makeRng(rng);
  const ids = setFor(level);
  const bins = ids.map((id) => ({ ...CATEGORIES[id] }));

  const pool = [];
  for (const id of ids) {
    for (const emoji of CATEGORIES[id].items) {
      pool.push({ emoji, categoryId: id });
    }
  }
  const items = shuffle(pool, r).slice(0, count);
  return { roundIndex: level, bins, items };
}

/** The bin that matches the item's category, or null. */
export function correctBin(item, bins) {
  return bins.find((b) => b.id === item.categoryId) ?? null;
}
