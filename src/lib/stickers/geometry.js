export const EDGE_PERCENT = 4;
export const CENTER_PERCENT = 50;

export function clampPercent(value, min = EDGE_PERCENT, max = 100 - EDGE_PERCENT) {
  if (!Number.isFinite(value)) return CENTER_PERCENT;
  return Math.min(max, Math.max(min, value));
}

export function edgePercentForSize(size, extent) {
  if (!Number.isFinite(size) || !Number.isFinite(extent) || extent <= 0) {
    return EDGE_PERCENT;
  }

  // Keep the whole sticker inside the play area. A sticker wider than the
  // play area can only be centered.
  const half = (size / 2 / extent) * 100;
  return Math.min(CENTER_PERCENT, Math.max(EDGE_PERCENT, half));
}

export function clampPlacement(point, size = 0, width = 0, height = 0) {
  const minX = size > 0 && width > 0 ? edgePercentForSize(size, width) : EDGE_PERCENT;
  const minY = size > 0 && height > 0 ? edgePercentForSize(size, height) : EDGE_PERCENT;

  return {
    x: clampPercent(point?.x, minX, 100 - minX),
    y: clampPercent(point?.y, minY, 100 - minY)
  };
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
