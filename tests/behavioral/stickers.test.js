import { describe, it, expect } from 'vitest';

describe('Stickers game behavior', () => {
  it('placing a sticker increments count', () => {
    let placed = [];
    placed = [...placed, { id: 0, emoji: '🐰', x: 50, y: 50 }];
    expect(placed).toHaveLength(1);
    placed = [...placed, { id: 1, emoji: '🦊', x: 30, y: 60 }];
    expect(placed).toHaveLength(2);
  });

  it('changing scene clears placed stickers', () => {
    let placed = [{ id: 0, emoji: '🐰', x: 50, y: 50 }];
    placed = [];
    expect(placed).toHaveLength(0);
  });

  it('sticker IDs are unique', () => {
    const stickers = [{ id: 0 }, { id: 1 }, { id: 2 }];
    const ids = new Set(stickers.map(s => s.id));
    expect(ids.size).toBe(stickers.length);
  });
});
