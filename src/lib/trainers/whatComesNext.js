import { makeRng, pickOne, shuffle } from './rng.js';
import { CATEGORIES, categoryOfEmoji, pickDistractors } from './emojiSets.js';

export function patternTier(level) {
  const n = Math.max(1, level);
  if (n <= 2) return 1;
  if (n <= 4) return 2;
  if (n <= 6) return 3;
  return 4;
}

/**
 * Per-level difficulty ladder — every level is a distinct step.
 * Levers: pattern unit, visible partial unit (strip length), distractor
 * similarity, and growing-block count (capped at 7 blocks for L11+).
 */
const STEPS = [
  null,
  { unit: ['A', 'B'], partial: 0, distractors: 'cross' },
  { unit: ['A', 'B'], partial: 1, distractors: 'cross' },
  { unit: ['A', 'A', 'B'], partial: 0, distractors: 'cross' },
  { unit: ['A', 'A', 'B', 'B'], partial: 1, distractors: 'cross' },
  { unit: ['A', 'B', 'C'], partial: 0, distractors: 'cross' },
  { unit: ['A', 'A', 'B', 'C'], partial: 1, distractors: 'same' }
];

export function ladderFor(level) {
  const n = Math.max(1, level);
  if (n <= 6) return { ...STEPS[n], growing: false };
  const blocks = 3 + Math.min(n - 7, 4);
  return { unit: null, partial: 0, growing: true, blocks, distractors: n >= 9 ? 'lookalike' : 'same' };
}

export function roundGoal(level) {
  return 4 + Math.min(Math.max(1, level), 6);
}

function pickPatternEmojis(unit, level, rng) {
  const needed = new Set(unit);
  const names = shuffle(Object.keys(CATEGORIES), rng);

  // low levels: each pattern emoji from a distinct category; always distinct emojis
  const bySymbol = {};
  let i = 0;
  const chosen = new Set();
  for (const sym of needed) {
    let guard = 0;
    let e;
    do {
      const catName = level <= 5 ? names[i % names.length] : pickOne(names, rng);
      e = pickOne(CATEGORIES[catName], rng);
      guard++;
    } while (chosen.has(e) && guard < 100);
    bySymbol[sym] = e;
    chosen.add(e);
    i++;
  }
  return { bySymbol };
}

/** Two wrong options for the ladder's distractor tier, with graceful fallbacks. */
function pickWrongs(tier, answer, symbols, rng) {
  const wrongs = [];
  const addFrom = (pool) => {
    for (const e of shuffle(pool, rng)) {
      if (wrongs.length >= 2) break;
      if (e !== answer && !wrongs.includes(e)) wrongs.push(e);
    }
  };

  if (tier === 'cross') {
    const usedCats = new Set([...symbols, answer].map(categoryOfEmoji).filter(Boolean));
    const outside = Object.values(CATEGORIES)
      .flat()
      .filter((e) => !usedCats.has(categoryOfEmoji(e)));
    addFrom(outside);
  } else {
    const order = tier === 'lookalike' ? ['lookalike', 'same', 'cross'] : ['same', 'cross'];
    for (const t of order) {
      if (wrongs.length >= 2) break;
      addFrom(pickDistractors(answer, t, 2, rng));
    }
  }
  if (wrongs.length < 2) addFrom(Object.values(CATEGORIES).flat());
  return wrongs.slice(0, 2);
}

export function makePrompt(level, seed = Date.now()) {
  const rng = makeRng(seed);
  const n = Math.max(1, level);
  const tier = patternTier(n);
  const ladder = ladderFor(n);

  let symbols;
  let answer;
  let unitLength;

  if (!ladder.growing) {
    const { unit } = ladder;
    const { bySymbol } = pickPatternEmojis(unit, n, rng);
    unitLength = unit.length;
    const prefixLength = 2 * unitLength + Math.min(ladder.partial, unitLength - 1);
    symbols = [];
    for (let i = 0; i < prefixLength; i++) {
      symbols.push(bySymbol[unit[i % unitLength]]);
    }
    answer = bySymbol[unit[prefixLength % unitLength]];
  } else {
    // growing patterns: blocks [A×k][B] for k = 1..blocks, answer starts block k+1
    const { bySymbol } = pickPatternEmojis(['A', 'B'], n, rng);
    const A = bySymbol['A'];
    const B = bySymbol['B'];
    symbols = [];
    for (let k = 1; k <= ladder.blocks; k++) {
      for (let j = 0; j < k; j++) symbols.push(A);
      symbols.push(B);
    }
    answer = A; // first element of the next growing block
    unitLength = null;
  }

  const wrongs = pickWrongs(ladder.distractors, answer, symbols, rng);
  const options = shuffle([answer, ...wrongs], rng);
  return {
    tier,
    symbols,
    answer,
    options,
    correctIndex: options.indexOf(answer),
    unitLength
  };
}
