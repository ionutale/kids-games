// Pacing and level contract for the memory game. Kept out of the page so
// unit tests pin the numbers the player actually feels.
export const PEEK_MS = 1200;
export const PEEK_LATE_MS = 800;
export const MATCH_HOLD_MS = 700;

export function pairsFromLevel(level) {
  if (level >= 10) return 12;
  return level + 1;
}

export function colsFromCount(count) {
  if (count <= 8) return 2;
  return 4;
}

export function peekDuration(level) {
  return level <= 4 ? PEEK_MS : PEEK_LATE_MS;
}

export function mismatchDelay(level) {
  return Math.max(800, 1500 - level * 60);
}
