// Shared level-ladder progress store — one contract for every level game:
// 10 levels, the current level persists, finishing level 10 marks mastery.
export const MAX_LEVEL = 10;

function camel(gameId) {
  return gameId.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function levelKey(gameId) {
  return `${camel(gameId)}Level`;
}

function masteryKey(gameId) {
  return `${camel(gameId)}Mastered`;
}

// Games that saved their level under bespoke keys before the shared ladder
// existed. Migrated on first read so kids keep their progress.
const LEGACY_LEVEL_KEYS = {
  memory: 'memory-unlocked-level',
  'path-builder': 'path-builder-level'
};

function clampLevel(n) {
  const parsed = parseInt(n, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(MAX_LEVEL, Math.max(1, parsed));
}

export function loadLevel(gameId) {
  if (typeof localStorage === 'undefined') return 1;
  const legacy = LEGACY_LEVEL_KEYS[gameId];
  if (legacy) {
    const raw = localStorage.getItem(legacy);
    if (raw !== null) {
      localStorage.removeItem(legacy);
      saveLevel(gameId, raw);
    }
  }
  const n = parseInt(localStorage.getItem(levelKey(gameId)), 10);
  return Number.isFinite(n) ? clampLevel(n) : 1;
}

export function saveLevel(gameId, n) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(levelKey(gameId), String(clampLevel(n)));
}

export function loadMastered(gameId) {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(masteryKey(gameId)) === '1';
}

export function saveMastered(gameId) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(masteryKey(gameId), '1');
}
