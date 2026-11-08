import { describe, it, expect } from 'vitest';
import {
  TAP_THRESHOLD_PX,
  MIN_POINT_DISTANCE_PX,
  MAX_STROKE_POINTS,
  DEFAULT_ARTBOARD,
  clamp01,
  distance,
  isTap,
  toNormalized,
  fromNormalized,
  thinPoint
} from '../../src/lib/paint/geometry.js';

const point = (x, y) => ({ x, y });
const rect = { left: 10, top: 20, width: 200, height: 400 };

describe('Paint geometry', () => {
  it('clamps to the unit square', () => {
    expect(clamp01(0.25)).toBe(0.25);
    expect(clamp01(0)).toBe(0);
    expect(clamp01(1)).toBe(1);
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(7)).toBe(1);
    expect(clamp01(Number.NaN)).toBe(0);
    expect(clamp01('0.5')).toBe(0);
  });

  it('measures distance in any coordinate space', () => {
    expect(distance(point(0, 0), point(3, 4))).toBe(5);
    expect(distance(point(1, 1), point(1, 1))).toBe(0);
    expect(distance(point(0, 0), null)).toBe(Number.POSITIVE_INFINITY);
    expect(distance(point(0, 0), point(Number.NaN, 4))).toBe(Number.POSITIVE_INFINITY);
  });

  it('treats a move of 4px or less as a tap', () => {
    expect(TAP_THRESHOLD_PX).toBe(4);
    expect(isTap(point(0, 0), point(4, 0))).toBe(true);
    expect(isTap(point(0, 0), point(3, 4))).toBe(false); // exactly 5px
    expect(isTap(point(0, 0), point(0, 0))).toBe(true);
    expect(isTap(point(0, 0), null)).toBe(false);
  });

  it('maps client pixels to normalized sheet coordinates', () => {
    expect(toNormalized(point(110, 220), rect)).toEqual({ x: 0.5, y: 0.5 });
    expect(toNormalized(point(10, 20), rect)).toEqual({ x: 0, y: 0 });
    expect(toNormalized(point(210, 420), rect)).toEqual({ x: 1, y: 1 });
    expect(toNormalized(point(-90, 20), rect)).toEqual({ x: 0, y: 0 });
    expect(toNormalized(point(310, 620), rect)).toEqual({ x: 1, y: 1 });
  });

  it('centers a point for a missing or degenerate rect', () => {
    expect(toNormalized(point(10, 20), null)).toEqual({ x: 0.5, y: 0.5 });
    expect(toNormalized(point(10, 20), { left: 0, top: 0, width: 0, height: 0 })).toEqual({
      x: 0.5,
      y: 0.5
    });
    expect(toNormalized(point(Number.NaN, 20), rect)).toEqual({ x: 0.5, y: 0.5 });
  });

  it('maps normalized coordinates back to client pixels', () => {
    expect(fromNormalized(point(0.5, 0.5), rect)).toEqual({ x: 110, y: 220 });
    expect(fromNormalized(point(0, 0), rect)).toEqual({ x: 10, y: 20 });
    expect(fromNormalized(point(1, 1), rect)).toEqual({ x: 210, y: 420 });
    expect(fromNormalized(point(2, -1), rect)).toEqual({ x: 210, y: 20 });
    expect(fromNormalized(point(0.5, 0.5), null)).toBeNull();
    expect(fromNormalized(null, rect)).toBeNull();
  });

  it('starts a thinned stroke with the first point', () => {
    expect(thinPoint([], point(0.5, 0.5))).toEqual([point(0.5, 0.5)]);
    expect(thinPoint(null, point(0.2, 0.3))).toEqual([point(0.2, 0.3)]);
  });

  it('drops points closer than 2px on the artboard', () => {
    expect(MIN_POINT_DISTANCE_PX).toBe(2);

    const start = point(0.5, 0.5);
    const tooClose = point(0.5 + 1 / DEFAULT_ARTBOARD.width, 0.5);
    const farEnough = point(0.5 + 3 / DEFAULT_ARTBOARD.width, 0.5);

    const one = thinPoint([start], tooClose);
    expect(one).toHaveLength(1);
    expect(one[0]).toBe(start);

    const two = thinPoint(one, farEnough);
    expect(two).toHaveLength(2);
    expect(two[1]).toEqual(farEnough);
  });

  it('respects a custom artboard and distance', () => {
    const options = { width: 100, height: 100, minDistance: 10 };
    const start = point(0.5, 0.5);

    expect(thinPoint([start], point(0.55, 0.5), options)).toHaveLength(1); // 5px
    expect(thinPoint([start], point(0.61, 0.5), options)).toHaveLength(2); // 11px
  });

  it('caps a stroke at 400 points', () => {
    const options = { width: 100000, height: 100000 };
    let points = [];
    for (let i = 0; i < 500; i += 1) {
      points = thinPoint(points, point(i / 10000, 0.5), options);
    }

    expect(MAX_STROKE_POINTS).toBe(400);
    expect(points).toHaveLength(400);
    expect(points[399]).toEqual(point(399 / 10000, 0.5));
  });

  it('ignores malformed points and clamps the rest', () => {
    const points = thinPoint([], point(1.4, -0.2));
    expect(points).toEqual([point(1, 0)]);

    expect(thinPoint(points, point(Number.NaN, 0.5))).toBe(points);
    expect(thinPoint(points, point(0.5, Number.POSITIVE_INFINITY))).toBe(points);
    expect(thinPoint(points, null)).toBe(points);
  });
});
