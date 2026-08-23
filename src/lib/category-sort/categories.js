import { makeRng, shuffle } from '../trainers/rng.js';

export const CATEGORIES = {
  animals: { id: 'animals', name: 'Animals', icon: '🐾', items: ['🐶', '🐱', '🐰', '🐸', '🦁', '🐘', '🦊', '🐼'] },
  food: { id: 'food', name: 'Food', icon: '🍽️', items: ['🍎', '🍕', '🍦', '🍪', '🍌', '🍇', '🍩', '🍭'] },
  vehicles: { id: 'vehicles', name: 'Vehicles', icon: '🚦', items: ['🚗', '🚌', '🚲', '✈️', '🚢', '🚁', '🚂', '🏎️'] },
  nature: { id: 'nature', name: 'Nature', icon: '🌿', items: ['🌳', '🌺', '🌻', '🌊', '⛰️', '🌈', '🌙', '☀️'] },
  clothes: { id: 'clothes', name: 'Clothes', icon: '👕', items: ['👖', '👗', '🧢', '👟', '🧥', '🧦', '🧣', '🩳'] },
  toys: { id: 'toys', name: 'Toys', icon: '🧸', items: ['🎲', '🎨', '🪁', '🎪', '🎭', '🎯', '🎮', '🪀'] }
};

/** Round-robin category sets — 2-bin rounds plus one 3-bin round. */
export const SETS = [
  ['animals', 'food'],
  ['vehicles', 'nature'],
  ['clothes', 'toys'],
  ['animals', 'food', 'vehicles'],
  ['nature', 'clothes', 'toys']
];

export function setFor(roundIndex) {
  const i = ((roundIndex % SETS.length) + SETS.length) % SETS.length;
  return SETS[i];
}

/**
 * Builds one round: bins from the round's category set and `count` shuffled
 * items sampled only from those categories.
 */
export function buildRound(roundIndex, count = 8, rng = Math.random) {
  const r = typeof rng === 'function' ? rng : makeRng(rng);
  const ids = setFor(roundIndex);
  const bins = ids.map((id) => ({ ...CATEGORIES[id] }));

  const pool = [];
  for (const id of ids) {
    for (const emoji of CATEGORIES[id].items) {
      pool.push({ emoji, categoryId: id });
    }
  }
  const items = shuffle(pool, r).slice(0, count);
  return { roundIndex, bins, items };
}

/** The bin that matches the item's category, or null. */
export function correctBin(item, bins) {
  return bins.find((b) => b.id === item.categoryId) ?? null;
}
