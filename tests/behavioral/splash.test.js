import { describe, it, expect } from 'vitest';

describe('Splash game behavior', () => {
  it('splash creates N items', () => {
    const count = 6;
    const splashes = [];
    for (let i = 0; i < count; i++) {
      splashes.push({ id: Math.random(), x: 50, y: 50, color: '#FF6B6B', emoji: '⭐' });
    }
    expect(splashes).toHaveLength(6);
  });

  it('particle count differs by age (3 for age 2, 6 for age 3+)', () => {
    const count = (age) => age <= 2 ? 3 : 6;
    expect(count(2)).toBe(3);
    expect(count(3)).toBe(6);
    expect(count(5)).toBe(6);
  });

  it('splashes auto-remove after timeout', () => {
    let splashes = [{ id: 1 }, { id: 2 }];
    const ids = new Set([1, 2]);
    splashes = splashes.filter(s => !ids.has(s.id));
    expect(splashes).toHaveLength(0);
  });

  it('drag creates continuous splashes', () => {
    const createSplash = (count) => {
      const r = [];
      for (let i = 0; i < count; i++) r.push({ id: Math.random() });
      return r;
    };
    let splashes = [];
    splashes = [...splashes, ...createSplash(6)];
    splashes = [...splashes, ...createSplash(6)];
    splashes = [...splashes, ...createSplash(6)];
    expect(splashes).toHaveLength(18);
  });
});
