import { describe, it, expect } from 'vitest';
import {
  getSplashBudget,
  shouldSpawn,
  appendWithCap,
  estimatedLive
} from '$lib/splash/budget.js';

describe('Splash budget', () => {
  it('gives age 2 the half budget', () => {
    const budget = getSplashBudget(2);

    expect(budget.cap).toBe(20);
    expect(budget.perBurst).toBe(2);
    expect(budget.intervalMs).toBe(180);
    expect(budget.lifetimeMs).toBe(1800);
    expect(budget.minDistancePx).toBe(8);
    expect(budget.sizeMin).toBe(20);
    expect(budget.sizeMax).toBe(50);
  });

  it('gives ages 3-5 the full budget', () => {
    for (const age of [3, 4, 5]) {
      const budget = getSplashBudget(age);

      expect(budget.cap).toBe(40);
      expect(budget.perBurst).toBe(3);
      expect(budget.intervalMs).toBe(100);
      expect(budget.lifetimeMs).toBe(1300);
      expect(budget.minDistancePx).toBe(8);
      expect(budget.sizeMin).toBe(20);
      expect(budget.sizeMax).toBe(40);
    }
  });

  it('never estimates more live particles than the cap', () => {
    for (const age of [2, 3, 4, 5]) {
      const budget = getSplashBudget(age);
      expect(estimatedLive(budget)).toBeLessThanOrEqual(budget.cap);
    }
  });

  it('estimates the steady-state live count from cadence and lifetime', () => {
    expect(estimatedLive(getSplashBudget(2))).toBeCloseTo(20, 5);
    expect(estimatedLive(getSplashBudget(3))).toBeCloseTo(39, 5);
  });
});

describe('shouldSpawn', () => {
  const base = {
    now: 1000,
    lastSpawnAt: 800,
    x: 100,
    y: 100,
    lastX: 100,
    lastY: 100,
    intervalMs: 100,
    minDistancePx: 8
  };

  it('allows the first burst', () => {
    expect(shouldSpawn({ ...base, lastSpawnAt: -Infinity })).toBe(true);
  });

  it('blocks a burst before the interval', () => {
    expect(shouldSpawn({ ...base, now: 850, x: 200, y: 200 })).toBe(false);
  });

  it('blocks a burst that has not moved 8px', () => {
    expect(shouldSpawn({ ...base, x: 105, y: 100 })).toBe(false);
  });

  it('allows a burst once time and distance are both satisfied', () => {
    expect(shouldSpawn({ ...base, x: 108, y: 100 })).toBe(true);
  });

  it('treats exactly 8px as enough movement', () => {
    expect(shouldSpawn({ ...base, x: 100, y: 108 })).toBe(true);
  });
});

describe('appendWithCap', () => {
  it('keeps every particle while under the cap', () => {
    const current = [{ id: 1 }, { id: 2 }];
    const incoming = [{ id: 3 }, { id: 4 }];

    expect(appendWithCap(current, incoming, 10)).toEqual([
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 }
    ]);
  });

  it('keeps the newest particles and evicts the oldest', () => {
    const current = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const incoming = [{ id: 4 }, { id: 5 }];

    expect(appendWithCap(current, incoming, 4)).toEqual([
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 }
    ]);
  });

  it('returns an empty array when the cap is zero', () => {
    expect(appendWithCap([{ id: 1 }], [{ id: 2 }], 0)).toEqual([]);
  });
});
