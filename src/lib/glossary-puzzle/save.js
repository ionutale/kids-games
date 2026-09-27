export const STORAGE_KEY = 'glossary-puzzle-save';
export const HANDOFF_KEY = 'glossary-puzzle-handoff';

export function buildSaveData(imageId, level, placedIds) {
  return {
    imageId,
    level: Math.max(1, Math.floor(level) || 1),
    placedIds: [...placedIds],
  };
}

export function readSave() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data.imageId !== 'string' || !Array.isArray(data.placedIds)) return null;
    return { ...data, level: Math.max(1, Math.floor(parseInt(data.level, 10)) || 1) };
  } catch {
    return null;
  }
}

export function writeSave(data) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function clearSave() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Decides which placed ids to restore when a resume link opens. The handoff
 * from the gallery wins; otherwise the stored save is used only when it is for
 * this exact image and level. This makes reloading a `?resume=1` URL
 * idempotent — the stored save survives instead of being consumed by the URL.
 */
export function restorePlaced({ handoff, stored, imageId, level }) {
  if (handoff) return handoff;
  if (stored && stored.imageId === imageId && stored.level === level) return stored.placedIds;
  return null;
}

export function stashHandoff(placedIds) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(placedIds || []));
  } catch {}
}

export function takeHandoff() {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    sessionStorage.removeItem(HANDOFF_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
