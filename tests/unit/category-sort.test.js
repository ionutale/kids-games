import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  SETS,
  SETS_3,
  SETS_4,
  binsForLevel,
  itemsForLevel,
  buildRound,
  correctBin
} from '$lib/category-sort/categories.js';

describe('category data integrity', () => {
  it('every category has ≥8 unique items and metadata', () => {
    for (const cat of Object.values(CATEGORIES)) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.icon).toBeTruthy();
      expect(cat.items.length).toBeGreaterThanOrEqual(8);
      expect(new Set(cat.items).size).toBe(cat.items.length);
    }
  });

  it('no emoji belongs to two categories', () => {
    const seen = new Map();
    for (const [id, cat] of Object.entries(CATEGORIES)) {
      for (const e of cat.items) {
        expect(seen.has(e), `${e} duplicated in ${id} and ${seen.get(e)}`).toBe(false);
        seen.set(e, id);
      }
    }
  });

  it('every set references known categories (2–4 bins)', () => {
    for (const set of [...SETS, ...SETS_3, ...SETS_4]) {
      expect([2, 3, 4]).toContain(set.length);
      for (const id of set) expect(CATEGORIES[id]).toBeTruthy();
    }
  });
});

describe('ladder difficulty', () => {
  it('bins grow with level and cap at 4', () => {
    expect(binsForLevel(1)).toBe(2);
    expect(binsForLevel(4)).toBe(2);
    expect(binsForLevel(5)).toBe(3);
    expect(binsForLevel(7)).toBe(3);
    expect(binsForLevel(8)).toBe(4);
    expect(binsForLevel(10)).toBe(4);
  });

  it('items grow with level and cap at 10', () => {
    expect(itemsForLevel(1)).toBe(6);
    expect(itemsForLevel(3)).toBe(7);
    expect(itemsForLevel(5)).toBe(8);
    expect(itemsForLevel(9)).toBe(10);
    expect(itemsForLevel(12)).toBe(10);
  });
});

describe('buildRound', () => {
  it('produces `count` items whose categories all belong to the round set', () => {
    for (let level = 1; level <= 10; level++) {
      const round = buildRound(level, itemsForLevel(level));
      expect(round.items.length).toBe(itemsForLevel(level));
      expect(round.bins.length).toBe(binsForLevel(level));
      const ids = new Set(round.bins.map((b) => b.id));
      for (const item of round.items) {
        expect(ids.has(item.categoryId)).toBe(true);
        expect(CATEGORIES[item.categoryId].items).toContain(item.emoji);
      }
    }
  });

  it('rotates sets within the level\'s pool (and wraps negatives)', () => {
    expect(buildRound(1).bins[0].id).toBe(SETS[0][0]);
    expect(buildRound(2).bins[0].id).toBe(SETS[1][0]);
    expect(buildRound(5).bins[0].id).toBe(SETS_3[0][0]);
    expect(buildRound(8).bins[0].id).toBe(SETS_4[1][0]);
    expect(buildRound(9).bins[0].id).toBe(SETS_4[0][0]);
    expect(buildRound(-1).bins[0].id).toBe(SETS[1][0]);
  });

  it('is deterministic with a seeded rng', () => {
    let s1 = 5;
    const rngA = () => ((s1 = (s1 * 9301 + 49297) % 233280) / 233280);
    const a = buildRound(2, 6, rngA);
    let s2 = 5;
    const rngB = () => ((s2 = (s2 * 9301 + 49297) % 233280) / 233280);
    const b = buildRound(2, 6, rngB);
    expect(a).toEqual(b);
  });
});

describe('correctBin', () => {
  it('maps an item to its matching bin only', () => {
    const round = buildRound(1);
    for (const item of round.items) {
      const bin = correctBin(item, round.bins);
      expect(bin?.id).toBe(item.categoryId);
    }
  });
});
