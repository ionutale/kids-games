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
 * changes the original emoji, preferring emojis absent from the base grid
 * so swapped cells stand out (best-effort when the grid exceeds the pool).
 */
export function makePuzzle(ageLevel, seed = Date.now()) {
  const rng = makeRng(seed);
  const { size, diffs } = gridSpecFor(ageLevel);
  const cells = size * size;

  const base = Array.from({ length: cells }, () => POOL[Math.floor(rng() * POOL.length) % POOL.length]);
  const positions = shuffle(
    Array.from({ length: cells }, (_, i) => i),
    rng
  ).slice(0, diffs);

  const left = [...base];
  const right = [...base];
  const baseSet = new Set(base);

  for (const pos of positions) {
    // prefer emojis that don't appear in the base grid at all (clearly "different")
    let candidates = POOL.filter((e) => e !== left[pos] && !baseSet.has(e));
    if (candidates.length === 0) {
      candidates = POOL.filter((e) => e !== left[pos]);
    }
    right[pos] = candidates[Math.floor(rng() * candidates.length) % candidates.length];
  }

  return { size, base, diffCells: new Set(positions), left, right };
}

/** True when tapping `index` is a genuine difference cell. */
export function isDifference(puzzle, index) {
  return puzzle.diffCells.has(index);
}
