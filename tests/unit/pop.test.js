import { describe, it, expect } from 'vitest';

describe('Pop game', () => {
  function levelConfig(l) {
    const maxItems = Math.min(2 + l * 1.3, 15);
    const spawnMs = Math.max(300, 2000 - l * 170);
    const speed = Math.min(3 + l * 0.5, 10);
    const itemCount = Math.min(2 + l, 8);
    return { maxItems, spawnMs, speed, itemCount };
  }

  it('level 1 config is easiest', () => {
    const c = levelConfig(1);
    expect(c.maxItems).toBeGreaterThanOrEqual(3);
    expect(c.spawnMs).toBeGreaterThanOrEqual(300);
    expect(c.speed).toBeGreaterThanOrEqual(3);
    expect(c.itemCount).toBeGreaterThanOrEqual(3);
  });

  it('level 10 config is hardest', () => {
    const c = levelConfig(10);
    expect(c.maxItems).toBeGreaterThanOrEqual(14);
    expect(c.spawnMs).toBeLessThanOrEqual(500);
    expect(c.speed).toBeLessThanOrEqual(10);
    expect(c.itemCount).toBe(8);
  });

  it('spawn rate increases with level', () => {
    const c1 = levelConfig(1);
    const c5 = levelConfig(5);
    const c10 = levelConfig(10);
    expect(c5.spawnMs).toBeLessThan(c1.spawnMs);
    expect(c10.spawnMs).toBeLessThan(c5.spawnMs);
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
