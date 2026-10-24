export const EDGE_PERCENT = 4;
export const CENTER_PERCENT = 50;

export function clampPercent(value, min = EDGE_PERCENT, max = 100 - EDGE_PERCENT) {
  if (!Number.isFinite(value)) return CENTER_PERCENT;
  return Math.min(max, Math.max(min, value));
}

export function clampPlacement(point) {
  return { x: clampPercent(point?.x), y: clampPercent(point?.y) };
}

export function pointToPercent(clientX, clientY, rect) {
  if (
    !rect ||
    !Number.isFinite(rect.width) ||
    !Number.isFinite(rect.height) ||
    rect.width <= 0 ||
    rect.height <= 0
  ) {
    return { x: CENTER_PERCENT, y: CENTER_PERCENT };
  }

  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100
  };
}

export function isOverShelf(clientY, shelfTop) {
  return Number.isFinite(clientY) && Number.isFinite(shelfTop) && clientY >= shelfTop;
}
