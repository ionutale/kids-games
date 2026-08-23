import { describe, it, expect } from 'vitest';
import { CATEGORIES, SETS, buildRound, correctBin } from '$lib/category-sort/categories.js';

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

  it('every set references known categories (2 or 3 bins)', () => {
    for (const set of SETS) {
      expect([2, 3]).toContain(set.length);
      for (const id of set) expect(CATEGORIES[id]).toBeTruthy();
    }
  });
});

describe('buildRound', () => {
  it('produces `count` items whose categories all belong to the round set', () => {
    for (let si = 0; si < SETS.length; si++) {
      const round = buildRound(si, 8);
      expect(round.items.length).toBe(8);
      const ids = new Set(round.bins.map((b) => b.id));
      for (const item of round.items) {
        expect(ids.has(item.categoryId)).toBe(true);
        expect(CATEGORIES[item.categoryId].items).toContain(item.emoji);
      }
    }
  });

  it('rotates sets by index (and wraps negatives)', () => {
    expect(buildRound(0).bins[0].id).toBe(SETS[0][0]);
    expect(buildRound(1).bins[0].id).toBe(SETS[1][0]);
    expect(buildRound(-1).bins[0].id).toBe(SETS[SETS.length - 1][0]);
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
    const round = buildRound(0, 8);
    for (const item of round.items) {
      const bin = correctBin(item, round.bins);
      expect(bin?.id).toBe(item.categoryId);
    }
  });
});
