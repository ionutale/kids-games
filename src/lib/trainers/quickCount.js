import { makeRng, shuffle, pickOne } from './rng.js';
import { CATEGORIES, pickTarget } from './emojiSets.js';

export function levelConfig(level) {
  const n = Math.max(1, level);
  const max = Math.min(4 + n, 20);
  return {
    goal: 5 + Math.min(n, 10),
    flashMs: Math.max(800, 3000 - 150 * n),
    min: 1,
    max,
    optionClampMax: max + 2
  };
}

function buildCells(count, rng) {
  // jittered grid: one emoji per cell ⇒ never overlap
  const side = Math.ceil(Math.sqrt(Math.max(count, 1)));
  const cells = [];
  for (let row = 0; row < side; row++) {
    for (let col = 0; col < side; col++) {
      const cx = ((col + 0.5) / side) * 100;
      const cy = ((row + 0.5) / side) * 100;
      cells.push({
        x: Math.min(88, Math.max(8, cx + (rng() - 0.5) * (70 / side))),
        y: Math.min(88, Math.max(8, cy + (rng() - 0.5) * (70 / side)))
      });
    }
  }
  return shuffle(cells, rng);
}

export function makePrompt(level, seed = Date.now()) {
  const rng = makeRng(seed);
  const config = levelConfig(level);
  const count = config.min + Math.floor(rng() * (config.max - config.min + 1));

  const categoryName = pickOne(Object.keys(CATEGORIES), rng);
  const pool = CATEGORIES[categoryName];
  const seen = new Set();
  const emojis = [];
  let guard = 0;
  while (emojis.length < count && guard < 500) {
    guard++;
    const e = pickTarget(pool, rng);
    if (!seen.has(e)) {
      seen.add(e);
      emojis.push(e);
    }
  }

  // answer pills: correct ±1/±2, unique, clamped
  const deltas = shuffle([1, 2, -1, -2], rng);
  const options = [count];
  for (const d of deltas) {
    if (options.length >= 3) break;
    const v = count + d;
    if (v >= 0 && v <= config.optionClampMax && !options.includes(v)) options.push(v);
  }

  return {
    count,
    emojis,
    category: categoryName,
    cells: buildCells(emojis.length, rng).slice(0, emojis.length),
    options: shuffle(options, rng),
    correct: count
  };
}
