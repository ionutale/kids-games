import { getSheet, DEFAULT_SHEET_ID } from './sheets.js';
import { emptySheet, normalizeSheet } from './document.js';

export const SAVE_KEY = 'kids-games-paint';
export const SAVE_VERSION = 1;

export function getStorage() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    // Blocked cookies or a sandboxed view can throw on the accessor itself.
    return null;
  }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function emptyDocument() {
  return {
    activeSheet: DEFAULT_SHEET_ID,
    sheets: { [DEFAULT_SHEET_ID]: emptySheet(DEFAULT_SHEET_ID) }
  };
}

// `regions` may be a Map keyed by sheet id, a plain object of the same shape,
// or one flat list/Set of ids shared by every sheet.
function regionsFor(regions, sheetId) {
  if (!regions) return null;
  if (regions instanceof Map) return regions.get(sheetId) ?? null;
  if (Array.isArray(regions) || regions instanceof Set) return regions;
  if (isPlainObject(regions)) return regions[sheetId] ?? null;
  return null;
}

function readAll(storage, options = {}) {
  try {
    const raw = storage?.getItem?.(SAVE_KEY);
    if (!raw) return emptyDocument();

    const data = JSON.parse(raw);
    if (
      !isPlainObject(data) ||
      data.version !== SAVE_VERSION ||
      !isPlainObject(data.sheets)
    ) {
      return emptyDocument();
    }

    const sheets = {};
    for (const [sheetId, rawSheet] of Object.entries(data.sheets)) {
      if (!getSheet(sheetId)) continue;
      const sheet = normalizeSheet(sheetId, rawSheet, {
        regions: regionsFor(options.regions, sheetId)
      });
      if (sheet) sheets[sheetId] = sheet;
    }

    if (!sheets[DEFAULT_SHEET_ID]) {
      sheets[DEFAULT_SHEET_ID] = emptySheet(DEFAULT_SHEET_ID);
    }

    const activeSheet = getSheet(data.activeSheet)
      ? data.activeSheet
      : DEFAULT_SHEET_ID;
    if (!sheets[activeSheet]) sheets[activeSheet] = emptySheet(activeSheet);

    return { activeSheet, sheets };
  } catch {
    return emptyDocument();
  }
}

export function loadPaint(storage, options = {}) {
  return readAll(storage, options);
}

export function savePaint(storage, doc) {
  if (!storage?.setItem) return false;
  if (!isPlainObject(doc) || !isPlainObject(doc.sheets)) return false;

  try {
    // Re-read first so sheets the UI is not holding right now survive the write.
    const data = readAll(storage);
    const sheets = { ...data.sheets };

    for (const [sheetId, rawSheet] of Object.entries(doc.sheets)) {
      if (!getSheet(sheetId)) continue;
      const sheet = normalizeSheet(sheetId, rawSheet);
      if (sheet) sheets[sheetId] = sheet;
    }

    const activeSheet = getSheet(doc.activeSheet)
      ? doc.activeSheet
      : data.activeSheet;
    if (!sheets[activeSheet]) sheets[activeSheet] = emptySheet(activeSheet);

    storage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: SAVE_VERSION, activeSheet, sheets })
    );
    return true;
  } catch {
    // Quota, private mode, or a hostile storage shim: the studio stays usable.
    return false;
  }
}
