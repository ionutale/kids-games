// Quick Count — the Flash Picnic engine.
//
// The old prompt drew distinct emoji from one random category, so the real
// count was capped by the smallest category pool (about eight) even though
// levelConfig asked for twenty. The picnic repeats one themed object instead,
// and the count comes from the explicit `countMax` ramp below.

import { makeRng, shuffle } from './rng.js';

export const THEMES = [
  { id: 'berry', emoji: '🍓' },
  { id: 'egg', emoji: '🥚' },
  { id: 'cookie', emoji: '🍪' },
  { id: 'apple', emoji: '🍎' }
];

/**
 * The Flash Picnic count ramp: 1–3 at L1, 1–6 at L4, 1–8 at L7, 1–10 at L10.
 * Deliberately independent of `levelConfig.max`; repeats make counts past the
 * distinct-emoji cap possible.
 */
export function countMax(level) {
  const n = Math.max(1, Math.floor(level) || 1);
  if (n <= 2) return 3;
  if (n <= 5) return 6;
  if (n <= 7) return 8;
  if (n <= 9) return 9;
  return 10;
}

export function levelConfig(level) {
  const n = Math.max(1, level);
  return {
    goal: 5 + Math.min(n, 10),
    flashMs: Math.max(800, 3000 - 150 * n)
  };
}

function buildCells(count, rng) {
  // One object per jittered grid cell, so repeated objects never overlap.
  const side = Math.ceil(Math.sqrt(Math.max(count, 1)));
  const step = 100 / side;
  const jitter = Math.min(step * 0.18, 5);
  const cells = [];
  for (let row = 0; row < side; row++) {
    for (let col = 0; col < side; col++) {
      const x = (col + 0.5) * step + (rng() - 0.5) * 2 * jitter;
      const y = (row + 0.5) * step + (rng() - 0.5) * 2 * jitter;
      cells.push({
        x: Math.min(88, Math.max(12, x)),
        y: Math.min(88, Math.max(12, y))
      });
    }
  }
  return shuffle(cells, rng).slice(0, count);
}

/**
 * A picnic prompt: one theme object repeated `n` times plus three answer pills
 * showing the digit and the matching dots.
 *
 * Pass `promptIndex` to rotate themes deterministically (the play route uses
 * the solved count), otherwise the theme is seeded at random.
 */
export function makePrompt(level, seed = Date.now(), promptIndex = null) {
  const rng = makeRng(seed);
  const max = countMax(level);
  const n = 1 + Math.floor(rng() * max);
  const themeIndex =
    promptIndex == null
      ? Math.floor(rng() * THEMES.length)
      : ((Math.floor(promptIndex) % THEMES.length) + THEMES.length) % THEMES.length;
  const theme = THEMES[themeIndex];

  // Answer pills: correct ±1/±2, unique, at least 1, within the level range ±2.
  const options = [n];
  for (const delta of shuffle([1, 2, -1, -2], rng)) {
    if (options.length >= 3) break;
    const value = n + delta;
    if (value >= 1 && value <= max + 2 && !options.includes(value)) options.push(value);
  }

  return {
    n,
    count: n,
    correct: n,
    theme,
    options: shuffle(options, rng),
    // The object repeats, so `objects.length` is the real count shown.
    objects: Array.from({ length: n }, (_, id) => ({ id, emoji: theme.emoji })),
    cells: buildCells(n, rng)
  };
}
