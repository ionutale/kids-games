// Soccer's own star memory: the best stars earned per ladder level.
//
// ADR 0001 keeps stars off the shared ladder, so this small store owns the
// `soccerStars` key and the Soccer page renders a local star row from it.
// The value is a plain JSON object keyed by level, e.g. { "1": 2, "4": 3 }.
import { MAX_LEVEL } from '#lib/ladder/progress.js';

export const STARS_KEY = 'soccerStars';
const MAX_STARS = 3;

function clampStars(value) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(MAX_STARS, Math.max(0, n));
}

function clampLevel(level) {
  const n = parseInt(level, 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_LEVEL, Math.max(1, n));
}

/** The whole saved map, sanitised. Bad JSON or stray values never throw. */
export function loadSoccerStars() {
  if (typeof localStorage === 'undefined') return {};
  let raw;
  try {
    raw = JSON.parse(localStorage.getItem(STARS_KEY) || '{}');
  } catch {
    return {};
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const clean = {};
  for (const [key, value] of Object.entries(raw)) {
    const level = clampLevel(key);
    const stars = clampStars(value);
    if (String(level) === String(key) && stars > 0) clean[String(level)] = stars;
  }
  return clean;
}

/** Best stars remembered for one level, 0 when the level was never starred. */
export function bestStarsFor(level) {
  return loadSoccerStars()[String(clampLevel(level))] ?? 0;
}

/**
 * Remember a better round. A lower or zero result never overwrites a best.
 * Returns the best now stored for the level.
 */
export function saveBestStars(level, stars) {
  const n = clampLevel(level);
  const earned = clampStars(stars);
  if (typeof localStorage === 'undefined') return earned;

  const all = loadSoccerStars();
  const previous = all[String(n)] ?? 0;
  if (earned > previous) {
    all[String(n)] = earned;
    try {
      localStorage.setItem(STARS_KEY, JSON.stringify(all));
    } catch {
      return Math.max(previous, earned);
    }
    return earned;
  }
  return previous;
}
