import { makeRng, shuffle } from '../trainers/rng.js';

export const FRUITS = ['🍎', '🍌', '🍊', '🍇', '🍓'];

export function equationTypeFor(ageLevel) {
  const age = Number(ageLevel) || 3;
  if (age <= 3) return 'count';
  if (age === 4) return 'addsub'; // add and subtract within 10
  return 'mixed'; // add, subtract, and comparison interleaved
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

function addQuestion(ageLevel, rng, emoji) {
  const cap = ageLevel >= 5 ? 20 : 10;
  const a = 1 + Math.floor(rng() * (cap / 2));
  const b = 1 + Math.floor(rng() * Math.min(cap / 2, cap - a));
  return { type: 'add', emoji, op: '+', groups: [a, b], answer: a + b, options: numericOptions(a + b, rng) };
}

function subtractQuestion(ageLevel, rng, emoji) {
  const cap = ageLevel >= 5 ? 20 : 10;
  const a = 2 + Math.floor(rng() * (cap - 1)); // 2..cap
  const b = 1 + Math.floor(rng() * (a - 1)); // 1..a−1 → answer ≥ 1
  return { type: 'subtract', emoji, op: '−', groups: [a, b], answer: a - b, options: numericOptions(a - b, rng) };
}

/**
 * Builds one question for the given age level.
 * Types: count | add | subtract | compare — { type, emoji, op?, groups, answer, options }
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

  if (type === 'addsub') {
    return rng() < 0.5 ? addQuestion(ageLevel, rng, emoji) : subtractQuestion(ageLevel, rng, emoji);
  }

  // mixed at 5+: equal thirds add / subtract / compare
  const roll = rng();
  if (roll < 1 / 3) return addQuestion(ageLevel, rng, emoji);
  if (roll < 2 / 3) return subtractQuestion(ageLevel, rng, emoji);
  const a = 1 + Math.floor(rng() * 6);
  let bb = 1 + Math.floor(rng() * 6);
  if (bb === a) bb = (bb % 6) + 1; // guarantee a clear winner
  const answer = Math.max(a, bb);
  return { type: 'compare', emoji, groups: [a, bb], answer, options: numericOptions(answer, rng) };
}
