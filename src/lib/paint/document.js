import { getSheet, DEFAULT_SHEET_ID } from './sheets.js';
import {
  clamp01,
  thinPoint,
  DEFAULT_ARTBOARD,
  MAX_STROKE_POINTS
} from './geometry.js';

// A sheet document is the unit of save and undo. The factory below owns one
// sheet plus its in-memory history; switching sheets resets history.
//
// Sheet shape:
//   free     { kind: 'free', strokes: [], stamps: [] }
//   coloring { kind: 'coloring', fills: { [regionId]: color }, strokes: [], stamps: [] }
//
// Stroke: { color, size, region, points } (points normalized 0-1)
// Stamp:  { type, x, y, size } (x/y normalized 0-1)
export const MAX_UNDO = 20;

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function usableNumber(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function asString(value) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function resolveArtboard(options) {
  return {
    width: usableNumber(options?.width, DEFAULT_ARTBOARD.width),
    height: usableNumber(options?.height, DEFAULT_ARTBOARD.height)
  };
}

function toRegionSet(regions) {
  if (regions instanceof Set) return regions;
  if (regions == null) return null;
  if (Array.isArray(regions)) return new Set(regions);
  if (typeof regions[Symbol.iterator] === 'function') return new Set(regions);
  return null;
}

// null is a valid region (painting outside a coloring shape); undefined means
// the saved value was malformed and the stroke must be dropped.
function cleanRegion(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || value.length === 0) return undefined;
  return value;
}

function cleanPoints(points, artboard) {
  if (!Array.isArray(points)) return [];

  let kept = [];
  for (const point of points) {
    if (kept.length >= MAX_STROKE_POINTS) break;
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    kept = thinPoint(kept, point, artboard);
  }
  return kept;
}

function cleanStroke(raw, artboard, allowedRegions) {
  if (!isPlainObject(raw)) return null;

  const color = asString(raw.color);
  const size = raw.size;
  const region = cleanRegion(raw.region);
  if (!color || !Number.isFinite(size) || size <= 0 || region === undefined) {
    return null;
  }
  if (allowedRegions && region !== null && !allowedRegions.has(region)) {
    return null;
  }

  const points = cleanPoints(raw.points, artboard);
  if (points.length === 0) return null;

  return { color, size, region, points };
}

function cleanStamp(raw) {
  if (!isPlainObject(raw)) return null;

  const type = asString(raw.type);
  if (
    !type ||
    !Number.isFinite(raw.x) ||
    !Number.isFinite(raw.y) ||
    !Number.isFinite(raw.size) ||
    raw.size <= 0
  ) {
    return null;
  }

  return { type, x: clamp01(raw.x), y: clamp01(raw.y), size: raw.size };
}

function cleanFills(raw, allowedRegions) {
  const fills = {};
  if (!isPlainObject(raw)) return fills;

  for (const [regionId, color] of Object.entries(raw)) {
    if (!regionId || regionId === '__proto__') continue;
    if (allowedRegions && !allowedRegions.has(regionId)) continue;
    const value = asString(color);
    if (value) fills[regionId] = value;
  }
  return fills;
}

export function emptySheet(sheetId = DEFAULT_SHEET_ID) {
  const sheet = getSheet(sheetId);
  if (sheet?.kind === 'coloring') {
    return { kind: 'coloring', fills: {}, strokes: [], stamps: [] };
  }
  return { kind: 'free', strokes: [], stamps: [] };
}

/**
 * Validate/normalize one saved sheet. Returns null for an unknown sheet id or
 * a non-object payload. Pass `regions` (iterable of ids) to drop fills and
 * strokes for regions the current line art no longer has.
 */
export function normalizeSheet(sheetId, raw, options = {}) {
  const catalog = getSheet(sheetId);
  if (!catalog || !isPlainObject(raw)) return null;

  const artboard = resolveArtboard(options);
  const allowedRegions = toRegionSet(options.regions);

  const strokes = [];
  for (const value of Array.isArray(raw.strokes) ? raw.strokes : []) {
    const stroke = cleanStroke(value, artboard, allowedRegions);
    if (stroke) {
      strokes.push(catalog.kind === 'free' ? { ...stroke, region: null } : stroke);
    }
  }

  const stamps = [];
  for (const value of Array.isArray(raw.stamps) ? raw.stamps : []) {
    const stamp = cleanStamp(value);
    if (stamp) stamps.push(stamp);
  }

  if (catalog.kind !== 'coloring') {
    return { kind: 'free', strokes, stamps };
  }

  return {
    kind: 'coloring',
    fills: cleanFills(raw.fills, allowedRegions),
    strokes,
    stamps
  };
}

function cloneSheet(sheet) {
  const copy = {
    kind: sheet.kind,
    strokes: sheet.strokes.map((stroke) => ({
      ...stroke,
      points: stroke.points.map((point) => ({ ...point }))
    })),
    stamps: sheet.stamps.map((stamp) => ({ ...stamp }))
  };
  if (sheet.kind === 'coloring') copy.fills = { ...sheet.fills };
  return copy;
}

/**
 * Create the document for one sheet.
 *
 * Every mutation returns a value and leaves the new sheet on `doc.sheet`.
 * Read `doc.sheet` (or call `doc.toJSON()`) after an action to hand it to
 * Svelte state and to the saver.
 *
 *   doc.sheet, doc.sheetId, doc.kind, doc.canUndo, doc.undoDepth, doc.isDrawing
 *   doc.beginStroke({ color, size, region })
 *   doc.appendPoint({ x, y })       // normalized, thinned; false when too close
 *   doc.endStroke()                 // commits; returns stroke or null
 *   doc.cancelStroke()
 *   doc.addStroke({ color, size, region, points })
 *   doc.addStamp({ type, x, y, size })
 *   doc.setFill(regionId, color)    // coloring sheets only
 *   doc.clearFill(regionId)         // coloring sheets only
 *   doc.clearSheet()                // one undoable clear
 *   doc.undo()                      // no redo
 *   doc.load(sheet)                 // replace + reset history
 *   doc.toJSON()                    // detached plain object
 */
export function createPaintDocument(sheetId = DEFAULT_SHEET_ID, options = {}) {
  const id = getSheet(sheetId) ? sheetId : DEFAULT_SHEET_ID;
  const artboard = resolveArtboard(options);

  let current = emptySheet(id);
  let past = [];
  let pending = null;

  function commit(next) {
    past = [...past, current];
    if (past.length > MAX_UNDO) past = past.slice(past.length - MAX_UNDO);
    current = next;
  }

  function addStroke(raw) {
    const stroke = cleanStroke(raw, artboard, null);
    if (!stroke) return null;

    const committed = current.kind === 'free' ? { ...stroke, region: null } : stroke;
    commit({ ...current, strokes: [...current.strokes, committed] });
    return committed;
  }

  function beginStroke(tool) {
    const color = asString(tool?.color);
    const size = tool?.size;
    const region = cleanRegion(tool?.region);
    if (!color || !Number.isFinite(size) || size <= 0 || region === undefined) {
      return false;
    }

    pending = {
      color,
      size,
      region: current.kind === 'free' ? null : region,
      points: []
    };
    return true;
  }

  function appendPoint(point) {
    if (!pending) return false;
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return false;

    const points = thinPoint(pending.points, point, artboard);
    if (points === pending.points) return false;

    pending = { ...pending, points };
    return true;
  }

  function endStroke() {
    if (!pending) return null;
    const stroke = pending;
    pending = null;
    return addStroke(stroke);
  }

  function cancelStroke() {
    pending = null;
  }

  function addStamp(raw) {
    const stamp = cleanStamp(raw);
    if (!stamp) return null;

    commit({ ...current, stamps: [...current.stamps, stamp] });
    return stamp;
  }

  function setFill(regionId, color) {
    if (current.kind !== 'coloring') return false;
    const id = asString(regionId);
    const value = asString(color);
    if (!id || !value || current.fills[id] === value) return false;

    commit({ ...current, fills: { ...current.fills, [id]: value } });
    return true;
  }

  function clearFill(regionId) {
    if (current.kind !== 'coloring') return false;
    const id = asString(regionId);
    if (!id || !Object.hasOwn(current.fills, id)) return false;

    const fills = { ...current.fills };
    delete fills[id];
    commit({ ...current, fills });
    return true;
  }

  function clearSheet() {
    const hasContent =
      current.strokes.length > 0 ||
      current.stamps.length > 0 ||
      (current.kind === 'coloring' && Object.keys(current.fills).length > 0);
    if (!hasContent) return false;

    pending = null;
    commit(emptySheet(id));
    return true;
  }

  function undo() {
    if (past.length === 0) return false;

    pending = null;
    current = past[past.length - 1];
    past = past.slice(0, -1);
    return true;
  }

  function load(raw) {
    current = normalizeSheet(id, raw, artboard) ?? emptySheet(id);
    past = [];
    pending = null;
    return current;
  }

  return {
    get sheetId() {
      return id;
    },
    get sheet() {
      return current;
    },
    get kind() {
      return current.kind;
    },
    get canUndo() {
      return past.length > 0;
    },
    get undoDepth() {
      return past.length;
    },
    get isDrawing() {
      return pending !== null;
    },
    beginStroke,
    appendPoint,
    endStroke,
    cancelStroke,
    addStroke,
    addStamp,
    setFill,
    clearFill,
    clearSheet,
    undo,
    load,
    toJSON() {
      return cloneSheet(current);
    }
  };
}
