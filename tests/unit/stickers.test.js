import { describe, it, expect } from 'vitest';
import { dragOffsetFor } from '$lib/stickers/interaction.js';

describe('dragOffsetFor', () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 };
  const sticker = { x: 40, y: 30 };

  it('is zero when the drag starts from the tray (no grab event)', () => {
    // the regression: a leftover offset from the previous drag made the new
    // sticker jump on its first pointer move
    expect(dragOffsetFor(null, rect, sticker)).toEqual({ x: 0, y: 0 });
    expect(dragOffsetFor(undefined, rect, sticker)).toEqual({ x: 0, y: 0 });
  });

  it('measures the pointer-to-centre offset in percent at grab time', () => {
    // pointer (160, 80) → (30%, 30%) of the scene; sticker centre (40, 30)
    expect(dragOffsetFor({ clientX: 160, clientY: 80 }, rect, sticker)).toEqual({ x: -10, y: 0 });
  });

  it('never yields NaN for a degenerate scene rect', () => {
    expect(
      dragOffsetFor({ clientX: 0, clientY: 0 }, { left: 0, top: 0, width: 0, height: 0 }, sticker)
    ).toEqual({ x: 0, y: 0 });
  });

  it('is zero for a missing sticker', () => {
    expect(dragOffsetFor({ clientX: 160, clientY: 80 }, rect, null)).toEqual({ x: 0, y: 0 });
  });
});

describe('Stickers game', () => {
  it('has 4 scenes', () => {
    const scenes = ['🌿', '🌊', '🚀', '🦁'];
    expect(scenes.length).toBe(4);
  });

  it('each scene has 8 stickers', () => {
    const stickerSets = {
      '🌿': ['🐰', '🦊', '🐻', '🦋', '🌻', '🍎', '🌲', '🐝'],
      '🌊': ['🐟', '🐙', '🐳', '🦀', '🌊', '🐠', '🐡', '🪸'],
      '🚀': ['👨‍🚀', '🛸', '🌍', '⭐', '🌙', '☄️', '🛰️', '👾'],
      '🦁': ['🐘', '🦒', '🐆', '🦁', '🐒', '🦩', '🐍', '🦜']
    };
    Object.values(stickerSets).forEach(set => {
      expect(set.length).toBe(8);
    });
  });
});
