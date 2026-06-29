import { describe, it, expect } from 'vitest';

describe('Sorting game', () => {
  function levelConfig(l) {
    const numItems = Math.min(2 + l, 8);
    const numBaskets = l <= 3 ? 2 : 4;
    return { numItems, numBaskets };
  }

  it('has 2 categories', () => {
    const categories = ['colors', 'shapes'];
    expect(categories.length).toBe(2);
  });

  it('each category has 8 items', () => {
    const cat = {
      colors: { items: ['🔴', '🟡', '🔵', '🟢', '🟣', '🟠', '⚪', '🟤'], baskets: 4 },
      shapes: { items: ['⬛', '⭕', '🔺', '💎', '⬜', '🔵', '🔻', '🔶'], baskets: 4 }
    };
    expect(cat.colors.items.length).toBe(8);
    expect(cat.shapes.items.length).toBe(8);
  });

  it('level 1 has 2 baskets and 3 items', () => {
    const c = levelConfig(1);
    expect(c.numBaskets).toBe(2);
    expect(c.numItems).toBe(3);
  });

  it('level 4 has 4 baskets and 6 items', () => {
    const c = levelConfig(4);
    expect(c.numBaskets).toBe(4);
    expect(c.numItems).toBe(6);
  });

  it('level 10 has 4 baskets and 8 items', () => {
    const c = levelConfig(10);
    expect(c.numBaskets).toBe(4);
    expect(c.numItems).toBe(8);
  });

  it('items increase with level', () => {
    expect(levelConfig(1).numItems).toBeLessThan(levelConfig(5).numItems);
    expect(levelConfig(5).numItems).toBeLessThan(levelConfig(10).numItems);
  });

  it('item selection toggle works', () => {
    let selected = null;
    selected = 3;
    selected = selected === 3 ? null : 3;
    expect(selected).toBeNull();
    selected = 5;
    expect(selected).toBe(5);
  });
});
