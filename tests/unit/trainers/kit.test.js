import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  const store = {};
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(key => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { for (const key in store) delete store[key]; })
  });
});

describe('makeRng (mulberry32)', () => {
  it('is deterministic for the same seed', async () => {
    const { makeRng } = await import('$lib/trainers/rng');
    const a = makeRng(42);
    const b = makeRng(42);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it('diverges for different seeds and stays in [0,1)', async () => {
    const { makeRng } = await import('$lib/trainers/rng');
    const a = makeRng(1);
    const b = makeRng(2);
    let diverged = false;
    for (let i = 0; i < 50; i++) {
      const x = a(), y = b();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      if (x !== y) diverged = true;
    }
    expect(diverged).toBe(true);
  });

  it('handles seed 0 without locking up', async () => {
    const { makeRng } = await import('$lib/trainers/rng');
    const r = makeRng(0);
    expect(r()).not.toBeNaN();
  });
});

describe('progress', () => {
  it('defaults to level 1 when nothing saved', async () => {
    const { loadLevel } = await import('$lib/trainers/progress');
    expect(loadLevel('focus-tap')).toBe(1);
  });

  it('round-trips saveLevel/loadLevel with camelCase keys', async () => {
    const { loadLevel, saveLevel } = await import('$lib/trainers/progress');
    saveLevel('focus-tap', 7);
    expect(localStorage.getItem('focusTapLevel')).toBe('7');
    expect(loadLevel('focus-tap')).toBe(7);
  });

  it('clamps garbage and negatives to >= 1', async () => {
    const { loadLevel, saveLevel } = await import('$lib/trainers/progress');
    saveLevel('quick-count', -3);
    expect(loadLevel('quick-count')).toBe(1);
    localStorage.setItem('speedMatchLevel', 'not-a-number');
    expect(loadLevel('speed-match')).toBe(1);
  });
});

describe('emojiSets catalog', () => {
  it('exposes six categories with at least eight emojis each', async () => {
    const { CATEGORIES } = await import('$lib/trainers/emojiSets');
    const names = Object.keys(CATEGORIES);
    expect(names.sort()).toEqual(['animals', 'food', 'nature', 'sea', 'toys', 'vehicles']);
    for (const name of names) {
      expect(CATEGORIES[name].length).toBeGreaterThanOrEqual(8);
      expect(new Set(CATEGORIES[name]).size).toBe(CATEGORIES[name].length);
    }
  });

  it('lookalike pairs reference distinct emojis', async () => {
    const { LOOKALIKES } = await import('$lib/trainers/emojiSets');
    expect(LOOKALIKES.length).toBeGreaterThanOrEqual(6);
    for (const [a, b] of LOOKALIKES) {
      expect(a).not.toBe(b);
      expect(typeof a).toBe('string');
      expect(typeof b).toBe('string');
    }
  });
});

describe('pickTarget / pickDistractors', () => {
  it('pickTarget picks uniformly from the pool', async () => {
    const { pickTarget } = await import('$lib/trainers/emojiSets');
    const pool = ['🍎', '🍌', '🍒'];
    for (let s = 1; s <= 10; s++) {
      expect(pool).toContain(pickTarget(pool, s));
    }
  });

  it('cross tier excludes the target category entirely', async () => {
    const { pickDistractors, CATEGORIES } = await import('$lib/trainers/emojiSets');
    const target = '🐶'; // animals
    const animalSet = new Set(CATEGORIES.animals);
    for (let s = 1; s <= 20; s++) {
      const picks = pickDistractors(target, 'cross', 3, s);
      expect(picks.length).toBe(3);
      for (const p of picks) {
        expect(p).not.toBe(target);
        expect(animalSet.has(p)).toBe(false);
      }
    }
  });

  it('same tier draws only from the target category', async () => {
    const { pickDistractors, CATEGORIES } = await import('$lib/trainers/emojiSets');
    const target = '🍎';
    const foodSet = new Set(CATEGORIES.food);
    for (let s = 1; s <= 20; s++) {
      const picks = pickDistractors(target, 'same', 2, s);
      for (const p of picks) {
        expect(p).not.toBe(target);
        expect(foodSet.has(p)).toBe(true);
      }
    }
  });

  it('lookalike tier draws only from the target lookalike partners', async () => {
    const { pickDistractors, LOOKALIKES } = await import('$lib/trainers/emojiSets');
    const target = '🍎';
    const partners = new Set(
      LOOKALIKES.filter(([a, b]) => a === target || b === target).flat()
    );
    partners.delete(target);
    for (let s = 1; s <= 20; s++) {
      const picks = pickDistractors(target, 'lookalike', 2, s);
      for (const p of picks) expect(partners.has(p)).toBe(true);
    }
  });

  it('never returns duplicates nor the target, even when count is high', async () => {
    const { pickDistractors } = await import('$lib/trainers/emojiSets');
    const picks = pickDistractors('🍎', 'cross', 5, 9);
    expect(new Set(picks).size).toBe(picks.length);
    expect(picks).not.toContain('🍎');
  });
});
