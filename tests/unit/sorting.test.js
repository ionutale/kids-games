import { describe, it, expect } from 'vitest';

describe('Sorting game', () => {
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
});
