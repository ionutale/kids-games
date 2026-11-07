import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  SWATCHES,
  SHAPE_PATHS,
  signFor,
  levelConfig,
  buildRound
} from '../../src/lib/sorting/data.js';

describe('Sorting game data', () => {
  it('has two categories with four baskets each', () => {
    expect(Object.keys(CATEGORIES)).toEqual(['colors', 'shapes']);
    expect(CATEGORIES.colors.baskets).toHaveLength(4);
    expect(CATEGORIES.shapes.baskets).toHaveLength(4);
  });

  it('each category has eight items', () => {
    expect(CATEGORIES.colors.items).toHaveLength(8);
    expect(CATEGORIES.shapes.items).toHaveLength(8);
  });

  it('level 1 has 2 baskets and 3 items', () => {
    expect(levelConfig(1)).toEqual({ numBaskets: 2, numItems: 3 });
  });

  it('level 4 has 4 baskets and 6 items', () => {
    expect(levelConfig(4)).toEqual({ numBaskets: 4, numItems: 6 });
  });

  it('level 10 has 4 baskets and 8 items', () => {
    expect(levelConfig(10)).toEqual({ numBaskets: 4, numItems: 8 });
  });

  it('builds a colour round that only uses the visible baskets', () => {
    const round = buildRound(1, 'colors');
    expect(round.category).toBe('colors');
    expect(round.baskets).toEqual(['red', 'yellow']);
    expect(round.items).toHaveLength(3);
    expect(round.items.every((item) => item.cat < 2)).toBe(true);
    expect(new Set(round.items.map((item) => item.art)).size).toBe(3);
  });

  it('fills all four shape baskets at level 10', () => {
    const round = buildRound(10, 'shapes');
    expect(round.baskets).toHaveLength(4);
    expect(round.items).toHaveLength(8);
    expect(new Set(round.items.map((item) => item.cat)).size).toBe(4);
    expect(new Set(round.items.map((item) => item.art)).size).toBe(8);
  });

  it('maps colour baskets to their swatch', () => {
    expect(signFor('colors', 'red')).toEqual({ kind: 'swatch', value: SWATCHES.red });
    expect(signFor('colors', 'green')).toEqual({ kind: 'swatch', value: SWATCHES.green });
  });

  it('maps shape baskets to their path', () => {
    expect(signFor('shapes', 'triangle')).toEqual({
      kind: 'shape',
      value: SHAPE_PATHS.triangle
    });
    expect(signFor('shapes', 'diamond')).toEqual({
      kind: 'shape',
      value: SHAPE_PATHS.diamond
    });
  });

  it('has a sign for every basket in both categories', () => {
    for (const [category, data] of Object.entries(CATEGORIES)) {
      for (const basket of data.baskets) {
        const sign = signFor(category, basket);
        expect(sign.value, `${category}/${basket}`).toBeTruthy();
      }
    }
  });
});
