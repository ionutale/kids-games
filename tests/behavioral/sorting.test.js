import { describe, it, expect } from 'vitest';

describe('Sorting game behavior', () => {
  function createItems(numItems, numBaskets) {
    const items = [];
    for (let i = 0; i < numItems; i++) {
      items.push({ id: i, cat: i % numBaskets });
    }
    return items;
  }

  function sortItem(items, sorted, itemId, basketIdx) {
    const item = items.find(i => i.id === itemId);
    if (!item) return { sorted, correct: false, won: false };
    if (item.cat === basketIdx) {
      const next = new Set(sorted);
      next.add(itemId);
      return { sorted: next, correct: true, won: next.size === items.length };
    }
    return { sorted, correct: false, won: false };
  }

  it('items have categories within basket range', () => {
    const items = createItems(6, 4);
    items.forEach(item => {
      expect(item.cat).toBeGreaterThanOrEqual(0);
      expect(item.cat).toBeLessThan(4);
    });
  });

  it('sorting to correct basket succeeds', () => {
    const items = createItems(4, 2);
    const result = sortItem(items, new Set(), 0, items[0].cat);
    expect(result.correct).toBe(true);
  });

  it('sorting to wrong basket fails', () => {
    const items = createItems(4, 2);
    const wrong = items[0].cat === 0 ? 1 : 0;
    const result = sortItem(items, new Set(), 0, wrong);
    expect(result.correct).toBe(false);
  });

  it('win when all items sorted', () => {
    const items = createItems(2, 2);
    let sorted = new Set();
    sorted = sortItem(items, sorted, 0, items[0].cat).sorted;
    const result = sortItem(items, sorted, 1, items[1].cat);
    expect(result.won).toBe(true);
  });

  it('not won until all items sorted', () => {
    const items = createItems(4, 2);
    let sorted = new Set();
    sorted = sortItem(items, sorted, 0, items[0].cat).sorted;
    const result = sortItem(items, sorted, 1, items[1].cat);
    expect(result.won).toBe(false);
  });
});
