import { describe, it, expect } from 'vitest';
import {
  EDGE_PERCENT,
  clampPercent,
  clampPlacement,
  pointToPercent,
  isOverShelf
} from '$lib/stickers/geometry.js';

describe('Stickers geometry', () => {
  it('clamps positions away from the canvas edges', () => {
    expect(EDGE_PERCENT).toBe(4);
    expect(clampPercent(120)).toBe(96);
    expect(clampPercent(-10)).toBe(4);
    expect(clampPercent(50)).toBe(50);
    expect(clampPercent(Number.NaN)).toBe(50);
  });

  it('clamps a placement without dropping the other coordinate', () => {
    expect(clampPlacement({ x: 120, y: -10 })).toEqual({ x: 96, y: 4 });
    expect(clampPlacement({ x: 42, y: 61 })).toEqual({ x: 42, y: 61 });
  });

  it('converts a client point to percentages of a rect', () => {
    const rect = { left: 10, top: 20, width: 200, height: 400 };
    expect(pointToPercent(110, 220, rect)).toEqual({ x: 50, y: 50 });
    expect(pointToPercent(10, 20, rect)).toEqual({ x: 0, y: 0 });
  });

  it('returns the center for a missing or degenerate rect', () => {
    expect(pointToPercent(10, 20, null)).toEqual({ x: 50, y: 50 });
    expect(pointToPercent(10, 20, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 50, y: 50 });
  });

  it('detects a pointer over the shelf', () => {
    expect(isOverShelf(700, 680)).toBe(true);
    expect(isOverShelf(680, 680)).toBe(true);
    expect(isOverShelf(679, 680)).toBe(false);
    expect(isOverShelf(Number.NaN, 680)).toBe(false);
  });
});
