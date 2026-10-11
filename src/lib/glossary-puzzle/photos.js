// On-device photo store for the Puzzle gallery.
//
// The PWA has no backend: user photos are decoded and re-compressed in the
// browser, then kept in IndexedDB as JPEG blobs. Two caps bound the store — a
// photo count and a total byte budget — so a child cannot fill the device.
//
// Two sizes are persisted per photo: a full image (longest edge 1600px, q0.85)
// for the puzzle board and a thumbnail (longest edge 400px, q0.8) for the
// gallery grid. Neither pipeline ever upscales.

export const PHOTO_LIMIT = 30;
export const MAX_PHOTO_BYTES = 50 * 1024 * 1024;

const DB_NAME = 'kids-games-photos';
const STORE = 'photos';

const FULL_EDGE = 1600;
const FULL_QUALITY = 0.85;
const THUMB_EDGE = 400;
const THUMB_QUALITY = 0.8;

export class PhotoError extends Error {
  constructor(code) {
    super(code);
    this.name = 'PhotoError';
    this.code = code;
  }
}

// Scale (w, h) so the longest edge is at most `maxEdge`; smaller images pass
// through unchanged — upsizing a photo would only blur it and add bytes.
export function fitDims(w, h, maxEdge) {
  const longest = Math.max(w, h);
  if (longest <= maxEdge) return { w, h };
  const scale = maxEdge / longest;
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

// Pure admission check: both caps must hold, so a photo is rejected up front
// rather than after a failed IndexedDB write.
export function canAdd({ count, bytes }, fileBytes) {
  return count < PHOTO_LIMIT && bytes + fileBytes <= MAX_PHOTO_BYTES;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listPhotos() {
  const db = await openDB();
  try {
    const all = await requestToPromise(db.transaction(STORE).objectStore(STORE).getAll());
    return all.sort((a, b) => a.createdAt - b.createdAt);
  } finally {
    db.close();
  }
}

export async function getPhoto(id) {
  const db = await openDB();
  try {
    const record = await requestToPromise(db.transaction(STORE).objectStore(STORE).get(id));
    return record ?? null;
  } finally {
    db.close();
  }
}

export async function deletePhoto(id) {
  const db = await openDB();
  try {
    await requestToPromise(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id));
  } finally {
    db.close();
  }
}

export async function photosStats() {
  const db = await openDB();
  try {
    const store = db.transaction(STORE).objectStore(STORE);
    const [count, all] = await Promise.all([
      requestToPromise(store.count()),
      requestToPromise(store.getAll()),
    ]);
    const bytes = all.reduce((sum, r) => sum + (r.blob?.size ?? 0) + (r.thumb?.size ?? 0), 0);
    return { count, bytes };
  } finally {
    db.close();
  }
}

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Decode chain pinned for Safari: createImageBitmap with EXIF orientation is
// the only path that bakes rotation into the pixels. Older Safari lacks the
// option (and some WebViews lack the API), so fall back to a plain bitmap and
// finally to a detached <img> with an object URL.
async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {}
    }
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

// Draw the decoded source into a fresh canvas at the fitted size and encode as
// JPEG. toBlob can yield null (e.g. the canvas was tainted or too large), which
// is a decode failure rather than a silent empty photo.
function draw(src, maxEdge, quality) {
  const w0 = src.width ?? src.naturalWidth ?? 0;
  const h0 = src.height ?? src.naturalHeight ?? 0;
  const { w, h } = fitDims(w0, h0, maxEdge);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(src, 0, 0, w, h);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve({ blob, w, h }) : reject(new PhotoError('decode'))),
      'image/jpeg',
      quality
    );
  });
}

export async function addPhotoFromFile(file) {
  const stats = await photosStats();

  let src;
  try {
    src = await decode(file);
  } catch {
    throw new PhotoError('decode');
  }

  let full;
  let thumb;
  try {
    full = await draw(src, FULL_EDGE, FULL_QUALITY);
    thumb = await draw(src, THUMB_EDGE, THUMB_QUALITY);
  } catch (err) {
    throw err instanceof PhotoError ? err : new PhotoError('decode');
  } finally {
    src.close?.();
  }

  // Re-check against the actual stored bytes: recompression can shrink or grow
  // a file well past what its original size suggested.
  const size = (full.blob.size ?? 0) + (thumb.blob.size ?? 0);
  if (!canAdd(stats, size)) throw new PhotoError('limit');

  const record = {
    id: newId(),
    seq: stats.count + 1,
    blob: full.blob,
    thumb: thumb.blob,
    w: full.w,
    h: full.h,
    createdAt: Date.now(),
  };

  const db = await openDB();
  try {
    await requestToPromise(db.transaction(STORE, 'readwrite').objectStore(STORE).add(record));
  } catch (err) {
    if (/quota/i.test(err?.name ?? '')) throw new PhotoError('quota');
    throw err;
  } finally {
    db.close();
  }

  return record;
}
