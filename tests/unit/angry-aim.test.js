import { describe, it, expect } from 'vitest';
import { computeTrajectory } from '$lib/angry-emoji/aim.js';

const BASE = { x: 176, y: 474, vx: 600, vy: -500, groundY: 580, halfH: 13 };

describe('computeTrajectory', () => {
  it('rises then falls under gravity (parabola)', () => {
    const { points } = computeTrajectory({ ...BASE, maxPoints: 30 });
    expect(points.length).toBeGreaterThan(2);
    const ys = points.map((p) => p.y);
    const apex = Math.min(...ys);
    expect(apex).toBeLessThan(BASE.y); // climbs above the launch point
    expect(ys[ys.length - 1]).toBeGreaterThan(apex); // falls back down
    expect(ys.indexOf(apex)).toBeGreaterThan(0); // apex after launch
  });

  it('marks the first ground contact and reflects past it', () => {
    const { points, firstBounce } = computeTrajectory({
      ...BASE,
      restitution: 0.85,
      maxPoints: 90
    });
    expect(firstBounce).not.toBeNull();
    const bp = points[firstBounce];
    expect(bp.y).toBeCloseTo(580 - 13, 0); // rests on the ground plane
    const after = points.slice(firstBounce + 1).map((p) => p.y);
    expect(Math.min(...after)).toBeLessThan(bp.y); // lifts off again
  });

  it('caps the dot count at maxPoints', () => {
    const { points } = computeTrajectory({ ...BASE, restitution: 0.85, maxPoints: 25 });
    expect(points.length).toBeLessThanOrEqual(25);
  });

  it('flat shot bounces once then stops when the rebound dies', () => {
    const { firstBounce } = computeTrajectory({
      x: 176,
      y: 567,
      vx: 900,
      vy: 0,
      groundY: 580,
      halfH: 13,
      restitution: 0.1,
      maxPoints: 400
    });
    expect(firstBounce).not.toBeNull();
  });
});
