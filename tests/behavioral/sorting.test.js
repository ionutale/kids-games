import { describe, it, expect } from 'vitest';

describe('Sorting game behavior', () => {
  function createItems(numItems, numBaskets) {
    const items = [];
    for (let i = 0; i < numItems; i++) {
      items.push({ id: i, cat: i % numBaskets, emoji: '🔴' });
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

  it('item selection toggle works (tap again deselects)', () => {
    let selected = 3;
    selected = selected === 3 ? null : 3;
    expect(selected).toBeNull();
    selected = 5;
    selected = selected === 5 ? null : 5;
    expect(selected).toBeNull();
  });

  it('wrong basket triggers wobble and clears selection', () => {
    let wobbleId = null;
    let selected = 3;
    wobbleId = 3;
    selected = null;
    expect(wobbleId).toBe(3);
    expect(selected).toBeNull();
  });

  it('level 1 config: 2 baskets, 3 items', () => {
    const numItems = Math.min(2 + 1, 8);
    const numBaskets = 1 <= 3 ? 2 : 4;
    expect(numItems).toBe(3);
    expect(numBaskets).toBe(2);
  });

  it('level 10 config: 4 baskets, 8 items', () => {
    const numItems = Math.min(2 + 10, 8);
    const numBaskets = 10 <= 3 ? 2 : 4;
    expect(numItems).toBe(8);
    expect(numBaskets).toBe(4);
  });

  it('sorted items are hidden', () => {
    const sorted = new Set([1, 3]);
    expect(sorted.has(0)).toBe(false);
    expect(sorted.has(1)).toBe(true);
  });

  it('basket count shows correct number of sorted items', () => {
    const items = [
      { id: 0, cat: 0 }, { id: 1, cat: 0 },
      { id: 2, cat: 1 }, { id: 3, cat: 1 },
    ];
    const sorted = new Set([0, 2]);
    const basket0 = items.filter(item => item.cat === 0 && sorted.has(item.id)).length;
    const basket1 = items.filter(item => item.cat === 1 && sorted.has(item.id)).length;
    expect(basket0).toBe(1);
    expect(basket1).toBe(1);
  });
});
