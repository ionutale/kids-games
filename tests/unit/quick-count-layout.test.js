import { describe, it, expect } from 'vitest';
import { basketDots, MAX_BASKET_BERRIES } from '../../src/lib/quick-count/layout.js';
import { levelConfig } from '../../src/lib/trainers/quickCount.js';

describe('basketDots', () => {
  it('lights exactly the goal berries', () => {
    for (let goal = 6; goal <= 15; goal += 1) {
      expect(basketDots(goal).length).toBe(goal);
    }
  });

  it('caps the grid at the readable maximum', () => {
    expect(basketDots(30).length).toBe(MAX_BASKET_BERRIES);
    expect(basketDots(0)).toEqual([]);
  });

  it('keeps every berry inside the basket and spread out', () => {
    const dots = basketDots(15);
    for (const dot of dots) {
      expect(dot.left).toBeGreaterThanOrEqual(14);
      expect(dot.left).toBeLessThanOrEqual(86);
      expect(dot.top).toBeGreaterThanOrEqual(8);
      expect(dot.top).toBeLessThanOrEqual(80);
    }
    const keys = dots.map((d) => `${d.left.toFixed(1)},${d.top.toFixed(1)}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('fits the highest goal the ladder can ask for', () => {
    const goal = levelConfig(10).goal;
    expect(goal).toBe(15);
    expect(basketDots(goal).length).toBe(goal);
  });
});
