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
