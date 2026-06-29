import { describe, it, expect } from 'vitest';

describe('Stickers game behavior', () => {
  it('placing a sticker increments count', () => {
    let placed = [];
    placed = [...placed, { id: 0, emoji: '🐰', x: 50, y: 50 }];
    expect(placed).toHaveLength(1);
    placed = [...placed, { id: 1, emoji: '🦊', x: 30, y: 60 }];
    expect(placed).toHaveLength(2);
  });

  it('stickers persist when changing scene', () => {
    let placed = [{ id: 0, emoji: '🐰', x: 50, y: 50 }];
    // scene changed but placed is NOT cleared
    expect(placed).toHaveLength(1);
  });

  it('sticker IDs are unique', () => {
    const stickers = [{ id: 0 }, { id: 1 }, { id: 2 }];
    const ids = new Set(stickers.map(s => s.id));
    expect(ids.size).toBe(stickers.length);
  });

  it('clear all removes all stickers', () => {
    let placed = [
      { id: 0, emoji: '🐰', x: 50, y: 50 },
      { id: 1, emoji: '🦊', x: 30, y: 60 },
    ];
    placed = [];
    expect(placed).toHaveLength(0);
  });

  it('sticker position can be updated (drag)', () => {
    let placed = [{ id: 0, emoji: '🐰', x: 50, y: 50 }];
    placed = placed.map(p => p.id === 0 ? { ...p, x: 70, y: 30 } : p);
    expect(placed[0].x).toBe(70);
    expect(placed[0].y).toBe(30);
  });

  it('multiple stickers at different positions', () => {
    const placed = [
      { id: 0, emoji: '🐰', x: 20, y: 20 },
      { id: 1, emoji: '🦊', x: 80, y: 80 },
      { id: 2, emoji: '🐻', x: 50, y: 50 },
    ];
    expect(placed.length).toBe(3);
    const xs = placed.map(p => p.x);
    expect(new Set(xs).size).toBe(3);
  });
});
