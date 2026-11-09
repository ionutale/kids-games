import { describe, it, expect } from 'vitest';
import {
  countMax,
  levelConfig,
  makePrompt,
  THEMES
} from '../../../src/lib/trainers/quickCount.js';

describe('levelConfig', () => {
  it('keeps the flash and goal formulas', () => {
    expect(levelConfig(1)).toEqual({ goal: 6, flashMs: 2850 });
    expect(levelConfig(4)).toEqual({ goal: 9, flashMs: 2400 });
    expect(levelConfig(10)).toEqual({ goal: 15, flashMs: 1500 });
  });

  it('caps the flash at 800ms and the goal at 15', () => {
    const c = levelConfig(30);
    expect(c.flashMs).toBe(800);
    expect(c.goal).toBe(15); // 5 + min(30, 10)
  });
});

describe('countMax — the explicit Flash Picnic ramp', () => {
  it('matches the ticket ramp at L1, L4, L7 and L10', () => {
    expect(countMax(1)).toBe(3);
    expect(countMax(4)).toBe(6);
    expect(countMax(7)).toBe(8);
    expect(countMax(10)).toBe(10);
  });

  it('never shrinks as the level grows', () => {
    for (let level = 1; level < 20; level += 1) {
      expect(countMax(level + 1)).toBeGreaterThanOrEqual(countMax(level));
    }
  });

  it('is independent of levelConfig.max (the old distinct-emoji cap)', () => {
    for (let level = 1; level <= 12; level += 1) {
      expect(countMax(level)).toBeLessThanOrEqual(10);
      expect(countMax(level)).not.toBe(4 + level);
    }
  });
});

describe('makePrompt', () => {
  it('is deterministic per seed and diverse across seeds', () => {
    const a = makePrompt(1, 99);
    const b = makePrompt(1, 99);
    expect(a.n).toBe(b.n);
    expect(a.theme.id).toBe(b.theme.id);
    expect(a.options).toEqual(b.options);
    expect(a.cells).toEqual(b.cells);

    const counts = new Set();
    for (let s = 1; s <= 40; s += 1) counts.add(makePrompt(2, s).n);
    expect(counts.size).toBeGreaterThan(1);
  });

  it('always offers exactly 3 unique pills including the correct count', () => {
    for (let level = 1; level <= 12; level += 1) {
      for (let s = 1; s <= 20; s += 1) {
        const p = makePrompt(level, s);
        expect(p.options.length, `L${level} s${s}`).toBe(3);
        expect(new Set(p.options).size).toBe(3);
        expect(p.options).toContain(p.correct);
        const max = countMax(level);
        for (const o of p.options) {
          expect(o).toBeGreaterThanOrEqual(1);
          expect(o).toBeLessThanOrEqual(max + 2);
        }
      }
    }
  });

  it('counts stay inside the explicit level range', () => {
    for (let level = 1; level <= 10; level += 1) {
      for (let s = 1; s <= 60; s += 1) {
        const p = makePrompt(level, s);
        expect(p.n).toBeGreaterThanOrEqual(1);
        expect(p.n).toBeLessThanOrEqual(countMax(level));
        expect(p.correct).toBe(p.n);
      }
    }
  });

  it('repeats one themed object N times instead of distinct emoji', () => {
    for (let level = 1; level <= 10; level += 1) {
      const p = makePrompt(level, 17);
      expect(p.objects.length).toBe(p.n);
      expect(new Set(p.objects.map((o) => o.emoji)).size).toBe(1);
      expect(p.objects.every((o) => o.emoji === p.theme.emoji)).toBe(true);
    }
  });

  it('reaches counts past the old distinct-emoji cap at level 10', () => {
    let largest = 0;
    for (let s = 1; s <= 300; s += 1) {
      const p = makePrompt(10, s);
      largest = Math.max(largest, p.objects.length);
    }
    expect(largest).toBe(10);
    expect(largest).toBeGreaterThan(8); // the old category pool capped below this
  });

  it('rotates berries, eggs, cookies and apples by prompt index', () => {
    for (let i = 0; i < 8; i += 1) {
      const p = makePrompt(3, 5, i);
      expect(p.theme.id).toBe(THEMES[i % THEMES.length].id);
    }
  });

  it('places one object per non-overlapping cell, inside the cloth', () => {
    for (let level = 1; level <= 10; level += 1) {
      for (let s = 1; s <= 15; s += 1) {
        const p = makePrompt(level, s);
        expect(p.cells.length).toBe(p.n);
        const keys = p.cells.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`);
        expect(new Set(keys).size).toBe(keys.length);
        for (const c of p.cells) {
          expect(c.x).toBeGreaterThanOrEqual(12);
          expect(c.x).toBeLessThanOrEqual(88);
          expect(c.y).toBeGreaterThanOrEqual(12);
          expect(c.y).toBeLessThanOrEqual(88);
        }
      }
    }
  });
});
