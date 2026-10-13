import { makeRng, shuffle } from '../trainers/rng.js';

export const POOL = [
  ...['🐶', '🐱', '🐰', '🐸', '🐼'],
  ...['🍎', '🍌', '🍓', '🍇'],
  ...['🌸', '🌻', '🌈'],
  ...['🧸', '⚽', '🎁']
];

export function gridSpecFor(ageLevel) {
  const age = Number(ageLevel) || 3;
  if (age <= 3) return { size: 3, diffs: 2 };
  if (age === 4) return { size: 4, diffs: 3 };
  return { size: 5, diffs: 4 };
}

/**
 * Builds a Spot-the-Difference puzzle.
 * Returns { size, base, diffCells:Set<index>, left, right }.
 * `right` differs from `left` at EXACTLY `diffs` cells; every replacement
 * changes the original emoji.
 *
 * Age ≤3 keeps the toddler aid (replacements are emojis absent from the grid,
 * so a swapped cell is easy to spot). From age 4 the replacements reuse emojis
 * that are already in the puzzle — otherwise a child could solve every puzzle
 * by scanning for a foreign emoji instead of comparing cells.
 */
export function makePuzzle(ageLevel, seed = Date.now()) {
  const rng = makeRng(seed);
  const { size, diffs } = gridSpecFor(ageLevel);
  const age = Number(ageLevel) || 3;
  const cells = size * size;

  const base = Array.from({ length: cells }, () => POOL[Math.floor(rng() * POOL.length) % POOL.length]);
  const positions = shuffle(
    Array.from({ length: cells }, (_, i) => i),
    rng
  ).slice(0, diffs);

  const left = [...base];
  const right = [...base];
  const baseSet = new Set(base);
  const usedReplacements = new Set();

  for (const pos of positions) {
    const original = left[pos];
    let candidates;
    if (age <= 3) {
      // Toddler band: a brand-new emoji is the accessibility aid.
      candidates = POOL.filter((e) => e !== original && !baseSet.has(e));
    } else {
      // Reuse an emoji already in the grid, and don't reuse it across diffs.
      candidates = POOL.filter((e) => e !== original && baseSet.has(e) && !usedReplacements.has(e));
      if (candidates.length === 0) {
        candidates = POOL.filter((e) => e !== original && baseSet.has(e));
      }
    }
    if (candidates.length === 0) {
      candidates = POOL.filter((e) => e !== original);
    }
    const replacement = candidates[Math.floor(rng() * candidates.length) % candidates.length];
    right[pos] = replacement;
    usedReplacements.add(replacement);
  }

  return { size, base, diffCells: new Set(positions), left, right };
}

/** True when tapping `index` is a genuine difference cell. */
export function isDifference(puzzle, index) {
  return puzzle.diffCells.has(index);
}
