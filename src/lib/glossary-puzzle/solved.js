import { MAX_LEVEL } from '$lib/ladder/progress.js';

export const SOLVED_KEY = 'glossary-puzzle-solved';

/**
 * Per-image best level ever solved. Kept in its own key instead of the shared
 * ladder so the gallery can badge every picture without touching game progress.
 * Returns `{}` rather than throwing: a child mid-game must never see an error
 * because localStorage was cleared or holds foreign data.
 */
export function loadSolved() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SOLVED_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return data;
  } catch {
    return {};
  }
}

/** Bumps the stored level only upward — replaying an easier level must not erase a win. */
export function recordSolved(imageId, level) {
  if (typeof localStorage === 'undefined') return;
  try {
    const solved = loadSolved();
    solved[imageId] = Math.max(solved[imageId] || 0, level);
    localStorage.setItem(SOLVED_KEY, JSON.stringify(solved));
  } catch {}
}

/**
 * Which badge a picture shows in the gallery for the level being browsed:
 * gold once mastered at the top level, a check once solved at (or beyond) the
 * current level, nothing otherwise.
 */
export function badgeFor(solvedMap, imageId, currentLevel) {
  const highest = solvedMap[imageId] ?? 0;
  if (highest >= MAX_LEVEL) return 'gold';
  if (highest >= currentLevel) return 'check';
  return 'none';
}
