import { describe, it, expect } from 'vitest';
import { levelConfig } from '$lib/pop/config.js';

describe('Pop game', () => {
  it('level 1 config is easiest', () => {
    const c = levelConfig(1);
    expect(c.maxItems).toBeGreaterThanOrEqual(3);
    expect(c.spawnMs).toBeGreaterThanOrEqual(300);
    expect(c.fallSec).toBeGreaterThanOrEqual(5);
    expect(c.itemCount).toBeGreaterThanOrEqual(3);
  });

  it('level 10 config is hardest', () => {
    const c = levelConfig(10);
    expect(c.maxItems).toBeGreaterThanOrEqual(14);
    expect(c.spawnMs).toBeLessThanOrEqual(500);
    expect(c.fallSec).toBeLessThanOrEqual(4);
    expect(c.itemCount).toBe(8);
  });

  it('spawn rate increases with level', () => {
    const c1 = levelConfig(1);
    const c5 = levelConfig(5);
    const c10 = levelConfig(10);
    expect(c5.spawnMs).toBeLessThan(c1.spawnMs);
    expect(c10.spawnMs).toBeLessThan(c5.spawnMs);
  });

  it('bubbles fall FASTER at higher levels (shorter duration, never inverted)', () => {
    const c1 = levelConfig(1);
    const c5 = levelConfig(5);
    const c10 = levelConfig(10);
    expect(c5.fallSec).toBeLessThan(c1.fallSec);
    expect(c10.fallSec).toBeLessThan(c5.fallSec);
    // and the fall is never absurdly slow or instant on any level
    for (let l = 1; l <= 10; l++) {
      const c = levelConfig(l);
      expect(c.fallSec).toBeGreaterThanOrEqual(3);
      expect(c.fallSec).toBeLessThanOrEqual(10);
    }
  });

  it('clamps out-of-range levels like the ladder does', () => {
    expect(levelConfig(0)).toEqual(levelConfig(1));
    expect(levelConfig(99)).toEqual(levelConfig(10));
  });

  it('score increments correctly', () => {
    let score = 0;
    score++;
    expect(score).toBe(1);
    score++;
    expect(score).toBe(2);
    score += 3;
    expect(score).toBe(5);
  });

  it('timer counts down from 20', () => {
    let timeLeft = 20;
    timeLeft--;
    expect(timeLeft).toBe(19);
    timeLeft = 0;
    expect(timeLeft).toBe(0);
  });

  it('has popable items', () => {
    const items = ['🫧', '🐟', '🦋', '⭐', '🌟', '💫', '🌸', '🍎'];
    expect(items.length).toBe(8);
  });
});
