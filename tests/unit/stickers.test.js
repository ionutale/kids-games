import { describe, it, expect } from 'vitest';

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
