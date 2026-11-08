// The harbor album. Every solved picture prepends one postcard to
// `spotPostcards`; the album keeps them all and the set card shows the latest
// twelve. Storage may be missing, full or corrupt — the game still plays.
export const POSTCARD_KEY = 'spotPostcards';
export const ALBUM_LIMIT = 12;

function storageOrNull() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadPostcards(storage = storageOrNull()) {
  if (!storage) return [];
  try {
    const raw = JSON.parse(storage.getItem(POSTCARD_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

/**
 * Prepend a postcard and persist the whole album. `base` lets the route keep its
 * accumulated session album when storage is blocked or full; without it the
 * store is read first. Returns the new in-memory album even when the write
 * fails, so the set card never goes blank.
 */
export function addPostcard(card, base = null, storage = storageOrNull()) {
  const all = Array.isArray(base) ? base : loadPostcards(storage);
  const next = [{ ...card, at: card?.at ?? Date.now() }, ...all];
  if (storage) {
    try {
      storage.setItem(POSTCARD_KEY, JSON.stringify(next));
    } catch {
      // A full or disabled store must not break the set.
    }
  }
  return next;
}

/** The latest `limit` postcards, newest first. */
export function latestPostcards(postcards, limit = ALBUM_LIMIT) {
  if (!Array.isArray(postcards)) return [];
  return postcards.slice(0, Math.max(0, limit));
}
