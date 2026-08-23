import { makeRng, pickOne, shuffle } from './rng.js';
import { CATEGORIES, categoryOfEmoji, pickDistractors } from './emojiSets.js';

export function patternTier(level) {
  const n = Math.max(1, level);
  if (n <= 2) return 1;
  if (n <= 4) return 2;
  if (n <= 6) return 3;
  return 4;
}

const UNITS_BY_TIER = {
  1: [['A', 'B']],
  2: [
    ['A', 'A', 'B'],
    ['A', 'B', 'B'],
    ['A', 'A', 'B', 'B']
  ],
  3: [
    ['A', 'B', 'C'],
    ['A', 'A', 'B', 'C'],
    ['A', 'B', 'C', 'C']
  ]
};

export function roundGoal(level) {
  return 4 + Math.min(Math.max(1, level), 6);
}

function pickPatternEmojis(tier, level, rng) {
  const needed = new Set();
  const units = UNITS_BY_TIER[tier];
  const unit = tier <= 3 ? pickOne(units, rng) : ['A', 'B'];
  for (const sym of unit) needed.add(sym);
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
  return { unit, bySymbol };
}

export function makePrompt(level, seed = Date.now()) {
  const rng = makeRng(seed);
  const n = Math.max(1, level);
  const tier = patternTier(n);

  let symbols;
  let answer;
  let unitLength;

  if (tier <= 3) {
    const { unit, bySymbol } = pickPatternEmojis(tier, level, rng);
    unitLength = unit.length;
    const reps = 2;
    const extra = Math.floor(rng() * unitLength);
    const prefixLength = reps * unitLength + extra;
    symbols = [];
    for (let i = 0; i < prefixLength; i++) {
      symbols.push(bySymbol[unit[i % unitLength]]);
    }
    answer = bySymbol[unit[prefixLength % unitLength]];
  } else {
    // growing patterns: blocks [A×k][B] for k = 1..K, answer starts block K+1
    const { bySymbol } = pickPatternEmojis(4, level, rng);
    const A = bySymbol['A'];
    const B = bySymbol['B'];
    const blocks = 3 + Math.min(n - 7, 4);
    symbols = [];
    for (let k = 1; k <= blocks; k++) {
      for (let j = 0; j < k; j++) symbols.push(A);
      symbols.push(B);
    }
    answer = A; // first element of the next growing block
    unitLength = null;
  }

  // distractors: strict cross-category at low levels; same/lookalike later
  let wrongs;
  if (level <= 5) {
    const usedCats = new Set(
      [...new Set([...symbols, answer])].map(categoryOfEmoji).filter(Boolean)
    );
    const outside = Object.values(CATEGORIES)
      .flat()
      .filter((e) => !usedCats.has(categoryOfEmoji(e)));
    const pool = outside.filter((e) => e !== answer);
    wrongs = [pickOne(pool, rng)];
    while (wrongs.length < 2 && wrongs[0] !== undefined) {
      const e = pickOne(pool, rng);
      if (!wrongs.includes(e)) wrongs.push(e);
      break;
    }
    while (wrongs.length < 2) {
      const e = pickOne(Object.values(CATEGORIES).flat(), rng);
      if (e !== answer && !wrongs.includes(e)) wrongs.push(e);
    }
  } else {
    wrongs = pickDistractors(answer, 'same', 2, rng);
    if (wrongs.length < 2) {
      wrongs = wrongs.concat(pickDistractors(answer, 'cross', 2 - wrongs.length, rng));
    }
  }

  const options = shuffle([answer, ...wrongs.slice(0, 2)], rng);
  return {
    tier,
    symbols,
    answer,
    options,
    correctIndex: options.indexOf(answer),
    unitLength
  };
}
