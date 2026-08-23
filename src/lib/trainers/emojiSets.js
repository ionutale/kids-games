import { makeRng, pickOne } from './rng.js';

export const CATEGORIES = {
  animals: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐸', '🐵', '🐼', '🦁', '🐮'],
  food: ['🍎', '🍌', '🍒', '🍇', '🍓', '🍊', '🍉', '🍍', '🥕', '🌽'],
  vehicles: ['🚗', '🚌', '🚒', '🚀', '✈️', '🚂', '🚲', '🚜', '🛵', '🚁'],
  nature: ['🌸', '🌻', '🌳', '🌈', '⭐', '🌙', '☀️', '🍀', '🌼', '🍁'],
  sea: ['🐠', '🐙', '🐬', '🐳', '🦀', '🐡', '🦑', '🐢'],
  toys: ['🧸', '🎈', '🎁', '⚽', '🏀', '🎲', '🪀', '🪁']
};

export const LOOKALIKES = [
  ['🍎', '🍏'],
  ['🐶', '🐺'],
  ['⭐', '🌟'],
  ['🍋', '🍐'],
  ['🚗', '🚙'],
  ['🦋', '🐝'],
  ['🌸', '🌺'],
  ['🐭', '🐹']
];

const categoryOf = new Map();
for (const [name, emojis] of Object.entries(CATEGORIES)) {
  for (const e of emojis) categoryOf.set(e, name);
}

const lookalikePartners = new Map();
for (const [a, b] of LOOKALIKES) {
  if (!lookalikePartners.has(a)) lookalikePartners.set(a, []);
  if (!lookalikePartners.has(b)) lookalikePartners.set(b, []);
  lookalikePartners.get(a).push(b);
  lookalikePartners.get(b).push(a);
}

export function categoryOfEmoji(emoji) {
  return categoryOf.get(emoji) ?? null;
}

export function lookalikePartner(emoji) {
  const partners = lookalikePartners.get(emoji);
  return partners && partners.length > 0 ? partners[0] : null;
}

function asRng(rng) {
  if (typeof rng === 'function') return rng;
  return makeRng(typeof rng === 'number' ? rng : 1);
}

export function pickTarget(pool, rng = 1) {
  return pool[Math.floor(asRng(rng)() * pool.length) % pool.length];
}

function poolFor(target, tier) {
  if (tier === 'same') {
    const cat = categoryOf.get(target);
    return cat ? CATEGORIES[cat].filter((e) => e !== target) : [];
  }
  if (tier === 'lookalike') {
    return (lookalikePartners.get(target) ?? []).filter((e) => e !== target);
  }
  // cross: any emoji from other categories
  const cat = categoryOf.get(target);
  const out = [];
  for (const [name, emojis] of Object.entries(CATEGORIES)) {
    if (name !== cat) out.push(...emojis);
  }
  return out;
}

export function pickDistractors(target, tier, count, rng = 1) {
  const pool = poolFor(target, tier);
  const next = asRng(rng);
  const picks = [];
  let guard = 0;
  while (picks.length < count && guard < 500) {
    guard++;
    let candidate;
    if (pool.length > 0) {
      candidate = pickOne(pool, next);
    } else {
      // exhausted pool (e.g. same-tier with too few): fall back to cross
      candidate = pickOne(poolFor(target, 'cross'), next);
      if (!candidate) break;
    }
    if (candidate !== target && !picks.includes(candidate)) picks.push(candidate);
  }
  return picks;
}
