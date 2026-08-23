function storageKey(gameId) {
  const camel = gameId.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return `${camel}Level`;
}

export function loadLevel(gameId) {
  if (typeof localStorage === 'undefined') return 1;
  const raw = localStorage.getItem(storageKey(gameId));
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function saveLevel(gameId, n) {
  if (typeof localStorage === 'undefined') return;
  const clamped = Math.max(1, parseInt(n, 10) || 1);
  localStorage.setItem(storageKey(gameId), String(clamped));
}
