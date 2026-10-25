// Pure normalized-coordinate helpers for the Paint studio. Points live in a
// 0-1 space over the sheet artboard so a stroke survives resizes.
export const TAP_THRESHOLD_PX = 4;
export const MIN_POINT_DISTANCE_PX = 2;
export const MAX_STROKE_POINTS = 400;
export const DEFAULT_ARTBOARD = Object.freeze({ width: 390, height: 844 });

export function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function distance(a, b) {
  const dx = b?.x - a?.x;
  const dy = b?.y - a?.y;
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return Number.POSITIVE_INFINITY;
  return Math.hypot(dx, dy);
}

// A pointer that moved no more than 4px is a tap, not a drag: the eraser and
// the brush both make a dot/clear a fill from it.
export function isTap(start, end) {
  return distance(start, end) <= TAP_THRESHOLD_PX;
}

function isUsableRect(rect) {
  return (
    rect &&
    Number.isFinite(rect.left) &&
    Number.isFinite(rect.top) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    rect.width > 0 &&
    rect.height > 0
  );
}

// Rect is a plain {left, top, width, height}; no DOM object is required.
export function toNormalized(point, rect) {
  if (
    !isUsableRect(rect) ||
    !Number.isFinite(point?.x) ||
    !Number.isFinite(point?.y)
  ) {
    return { x: 0.5, y: 0.5 };
  }

  return {
    x: clamp01((point.x - rect.left) / rect.width),
    y: clamp01((point.y - rect.top) / rect.height)
  };
}

export function fromNormalized(point, rect) {
  if (
    !isUsableRect(rect) ||
    !Number.isFinite(point?.x) ||
    !Number.isFinite(point?.y)
  ) {
    return null;
  }

  return {
    x: rect.left + clamp01(point.x) * rect.width,
    y: rect.top + clamp01(point.y) * rect.height
  };
}

function usableExtent(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * Append a normalized point when it is at least `minDistance` pixels from the
 * previous one on the artboard. The first point always lands; the stroke stops
 * growing at `maxPoints`. Returns the same array when nothing was added.
 */
export function thinPoint(points, point, options = {}) {
  const list = Array.isArray(points) ? points : [];
  const width = usableExtent(options.width, DEFAULT_ARTBOARD.width);
  const height = usableExtent(options.height, DEFAULT_ARTBOARD.height);
  const minDistance = usableExtent(options.minDistance, MIN_POINT_DISTANCE_PX);
  const maxPoints = usableExtent(options.maxPoints, MAX_STROKE_POINTS);
  const next = {
    x: clamp01(point?.x),
    y: clamp01(point?.y)
  };

  if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) return list;
  if (list.length >= maxPoints) return list;
  if (list.length === 0) return [next];

  const last = list[list.length - 1];
  const dx = (next.x - last.x) * width;
  const dy = (next.y - last.y) * height;
  if (Math.hypot(dx, dy) < minDistance) return list;

  return [...list, next];
}
