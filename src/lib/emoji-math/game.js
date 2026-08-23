import { makeRng, shuffle } from '../trainers/rng.js';

export const FRUITS = ['🍎', '🍌', '🍊', '🍇', '🍓'];

export function equationTypeFor(ageLevel) {
  const age = Number(ageLevel) || 3;
  if (age <= 3) return 'count';
  if (age === 4) return 'add';
  return 'mixed'; // add ≤20 and comparison interleaved
}

function numericOptions(correct, rng, clampMin = 0) {
  const opts = new Set([correct]);
  let guard = 0;
  while (opts.size < 4 && guard < 50) {
    guard++;
    const delta = [1, 2, -1, -2][Math.floor(rng() * 4)];
    const v = correct + delta;
    if (v >= clampMin && !opts.has(v)) opts.add(v);
  }
  return shuffle([...opts], rng).map(String);
}

/**
 * Builds one question for the given age level.
 * Types: count | add | compare — { type, emoji, groups, answer, options }
 * `groups` is the array of group sizes rendered as emoji clusters.
 */
export function makeQuestion(ageLevel, seed = Date.now()) {
  const rng = makeRng(seed);
  const type = equationTypeFor(ageLevel);
  const emoji = FRUITS[Math.floor(rng() * FRUITS.length) % FRUITS.length];

  if (type === 'count') {
    const n = 1 + Math.floor(rng() * 5);
    return { type, emoji, groups: [n], answer: n, options: numericOptions(n, rng) };
  }

  if (type === 'add') {
    const cap = ageLevel >= 5 ? 20 : 10;
    const a = 1 + Math.floor(rng() * (cap / 2));
    const b = 1 + Math.floor(rng() * Math.min(cap / 2, cap - a));
    return { type, emoji, groups: [a, b], answer: a + b, options: numericOptions(a + b, rng) };
  }

  // mixed at 5+: alternate plain addition ≤20 with comparison
  if (rng() < 0.5) {
    const a = 1 + Math.floor(rng() * 9);
    const b = 1 + Math.floor(rng() * (20 - a));
    return { type: 'add', emoji, groups: [a, b], answer: a + b, options: numericOptions(a + b, rng) };
  }
  const a = 1 + Math.floor(rng() * 6);
  let bb = 1 + Math.floor(rng() * 6);
  if (bb === a) bb = (bb % 6) + 1; // guarantee a clear winner
  const answer = Math.max(a, bb);
  return { type: 'compare', emoji, groups: [a, bb], answer, options: numericOptions(answer, rng) };
}
