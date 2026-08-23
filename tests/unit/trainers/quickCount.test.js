import { describe, it, expect } from 'vitest';
import { levelConfig, makePrompt } from '$lib/trainers/quickCount.js';

describe('levelConfig', () => {
  it('matches spec formulas at L1', () => {
    const c = levelConfig(1);
    expect(c.goal).toBe(6);
    expect(c.flashMs).toBe(2850);
    expect(c.max).toBe(5);
    expect(c.optionClampMax).toBe(7);
  });

  it('caps flash at 800ms and count at 20', () => {
    const c = levelConfig(15);
    expect(c.flashMs).toBe(800);
    expect(c.max).toBe(19); // 4 + 15
    const c30 = levelConfig(30);
    expect(c30.max).toBe(20); // capped
    expect(c30.flashMs).toBe(800);
    expect(c30.goal).toBe(15); // 5 + min(30,10)
  });
});

describe('makePrompt', () => {
  it('is deterministic per seed and diverse across seeds', () => {
    const a = makePrompt(1, 99);
    const b = makePrompt(1, 99);
    expect(a.count).toBe(b.count);
    expect(a.options).toEqual(b.options);
    const counts = new Set();
    for (let s = 1; s <= 25; s++) counts.add(makePrompt(2, s).count);
    expect(counts.size).toBeGreaterThan(2);
  });

  it('always offers exactly 3 unique pills including the correct count', () => {
    for (let level = 1; level <= 12; level++) {
      for (let s = 1; s <= 20; s++) {
        const p = makePrompt(level, s);
        expect(p.options.length).toBe(3);
        expect(new Set(p.options).size).toBe(3);
        expect(p.options).toContain(p.correct);
        const cfg = levelConfig(level);
        for (const o of p.options) {
          expect(o).toBeGreaterThanOrEqual(0);
          expect(o).toBeLessThanOrEqual(cfg.optionClampMax);
        }
      }
    }
  });

  it('places emojis on distinct cells (no overlap)', () => {
    for (let s = 1; s <= 20; s++) {
      const p = makePrompt(3, s);
      expect(p.emojis.length).toBe(p.cells.length);
      const keys = p.cells.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`);
      expect(new Set(keys).size).toBe(keys.length);
      for (const c of p.cells) {
        expect(c.x).toBeGreaterThanOrEqual(8);
        expect(c.x).toBeLessThanOrEqual(88);
      }
    }
  });

  it('count respects the level range', () => {
    for (let s = 1; s <= 30; s++) {
      const cfg = levelConfig(6);
      const p = makePrompt(6, s);
      expect(p.count).toBeGreaterThanOrEqual(cfg.min);
      expect(p.count).toBeLessThanOrEqual(cfg.max);
    }
  });
});
