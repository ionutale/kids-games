import { describe, it, expect } from 'vitest';
import { makePuzzle, isDifference, gridSpecFor, POOL } from '$lib/spot-difference/game.js';

describe('grid spec by age', () => {
  it('matches the spec table', () => {
    expect(gridSpecFor(2)).toEqual({ size: 3, diffs: 2 });
    expect(gridSpecFor(4)).toEqual({ size: 4, diffs: 3 });
    expect(gridSpecFor(6)).toEqual({ size: 5, diffs: 4 });
  });
});

describe('makePuzzle', () => {
  it('produces exactly N differences for every age/seed combo', () => {
    for (const age of [2, 3, 4, 5, 6]) {
      for (let s = 1; s <= 25; s++) {
        const p = makePuzzle(age, s * 5);
        const spec = gridSpecFor(age);
        expect(p.size).toBe(spec.size);
        expect(p.diffCells.size).toBe(spec.diffs);
        expect(p.left.length).toBe(spec.size * spec.size);
        expect(p.right.length).toBe(spec.size * spec.size);

        let actualDiffs = 0;
        for (let i = 0; i < p.left.length; i++) {
          if (p.left[i] !== p.right[i]) {
            actualDiffs++;
            expect(p.diffCells.has(i)).toBe(true);
          }
        }
        expect(actualDiffs).toBe(spec.diffs);
      }
    }
  });

  it('replacements always change the cell (no accidental no-op diffs)', () => {
    for (let s = 1; s <= 40; s++) {
      const p = makePuzzle(5, s);
      for (const pos of p.diffCells) {
        expect(p.right[pos]).not.toBe(p.left[pos]);
      }
      // untouched cells stay identical
      for (let i = 0; i < p.base.length; i++) {
        if (!p.diffCells.has(i)) expect(p.right[i]).toBe(p.left[i]);
      }
    }
  });

  it('all emojis come from the shared pool', () => {
    for (let s = 1; s <= 20; s++) {
      const p = makePuzzle(4, s);
      for (const e of p.left) expect(POOL).toContain(e);
      for (const e of p.right) expect(POOL).toContain(e);
    }
  });

  it('isDifference validates correctly', () => {
    const p = makePuzzle(4, 42);
    for (let i = 0; i < p.left.length; i++) {
      expect(isDifference(p, i)).toBe(p.left[i] !== p.right[i]);
    }
  });

  it('is deterministic per seed', () => {
    expect(makePuzzle(3, 999)).toEqual(makePuzzle(3, 999));
  });
});
