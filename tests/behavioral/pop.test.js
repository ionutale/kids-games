import { describe, it, expect } from 'vitest';
import {
  targetFor,
  typesFor,
  popValue,
  miniKinds,
  jarPercent,
  jarIsFull
} from '../../src/lib/pop/config.js';

// The Rising Pond has no timer digits and no numeric score: the jar is the
// score and the moon is the clock. These tests exercise the round as a child
// plays it rather than re-checking every config table (see tests/unit/pop.test.js).
describe('Pop — a Rising Pond round', () => {
  it('fills the level-1 jar in six normal pops', () => {
    const target = targetFor(1);
    let points = 0;
    let pops = 0;

    while (!jarIsFull(points, target)) {
      points += popValue('normal');
      pops += 1;
    }

    expect(pops).toBe(6);
    expect(jarPercent(points, target)).toBe(1);
  });

  it('finishes the level-10 jar faster with giant and star bubbles', () => {
    const target = targetFor(10);
    const popsFor = (types) => {
      let points = 0;
      let pops = 0;
      for (let i = 0; !jarIsFull(points, target); i += 1) {
        points += popValue(types[i % types.length]);
        pops += 1;
      }
      return pops;
    };

    const normalOnly = popsFor(['normal']);
    const mixed = popsFor(['giant', 'star']);

    expect(normalOnly).toBe(15);
    expect(mixed).toBeLessThan(normalOnly);
  });

  it('teaches bubble types in order and never takes one away', () => {
    expect(typesFor(1)).toEqual(['normal']);
    expect(typesFor(3)).toContain('giant');
    expect(typesFor(3)).not.toContain('star');
    expect(typesFor(6)).toContain('star');

    for (let level = 2; level <= 10; level += 1) {
      const before = typesFor(level - 1);
      const now = typesFor(level);
      for (const type of before) expect(now).toContain(type);
      expect(now.length).toBeGreaterThanOrEqual(before.length);
    }
  });

  it('pushes one trinket into the jar for every point, so minis match the fill', () => {
    for (const type of ['normal', 'giant', 'star']) {
      const minis = miniKinds(type, 'fish');
      expect(minis).toHaveLength(popValue(type));
      expect(new Set(minis).size).toBe(1);
    }
  });
});
