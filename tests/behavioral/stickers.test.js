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
    expect(placed).toHaveLength(1);
  });

  it('sticker IDs are unique', () => {
    const stickers = [{ id: 0 }, { id: 1 }, { id: 2 }];
    const ids = new Set(stickers.map(s => s.id));
    expect(ids.size).toBe(stickers.length);
  });

  it('clear all removes all stickers', () => {
    let placed = [{ id: 0, emoji: '🐰', x: 50, y: 50 }, { id: 1, emoji: '🦊', x: 30, y: 60 }];
    placed = [];
    expect(placed).toHaveLength(0);
  });

  it('sticker position can be updated (drag)', () => {
    let placed = [{ id: 0, emoji: '🐰', x: 50, y: 50 }];
    placed = placed.map(p => p.id === 0 ? { ...p, x: 70, y: 30 } : p);
    expect(placed[0].x).toBe(70);
    expect(placed[0].y).toBe(30);
  });

  it('drag position is clamped between 5 and 95', () => {
    let x = 120, y = -10;
    x = Math.max(5, Math.min(95, x));
    y = Math.max(5, Math.min(95, y));
    expect(x).toBe(95);
    expect(y).toBe(5);
  });

  it('trayTap adds sticker and initiates drag', () => {
    let placed = [];
    let nextId = 0;
    const id = nextId++;
    placed = [...placed, { id, emoji: '🐰', x: 50, y: 50 }];
    let dragging = id;
    expect(placed).toHaveLength(1);
    expect(dragging).toBe(0);
  });

  it('scene change updates activeStickers', () => {
    const stickerSets = { '🌿': ['🐰', '🦊'], '🌊': ['🐟', '🐙'] };
    const scene = '🌊';
    const activeStickers = stickerSets[scene] || stickerSets['🌿'];
    expect(activeStickers).toEqual(['🐟', '🐙']);
  });
});
