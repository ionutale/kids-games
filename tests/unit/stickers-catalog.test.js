import { describe, it, expect } from 'vitest';
import {
  WORLD,
  STICKERS,
  STANDARD_SHELF,
  YOUNG_SHELF,
  SOFT_CAP,
  getSticker,
  getShelf,
  getShelfButtonSize,
  getPlacedSize
} from '$lib/stickers/catalog.js';

describe('Stickers catalog (Dino Valley slice)', () => {
  it('has one world', () => {
    expect(WORLD.id).toBe('dino-valley');
    expect(WORLD.nameKey).toBe('stickerWorldDinoValley');
  });

  it('has 8 unique sticker types in a 4/2/2 mix', () => {
    expect(STICKERS).toHaveLength(8);
    expect(new Set(STICKERS.map((sticker) => sticker.type)).size).toBe(8);

    const groups = STICKERS.reduce((counts, sticker) => {
      counts[sticker.group] = (counts[sticker.group] ?? 0) + 1;
      return counts;
    }, {});

    expect(groups).toEqual({ dino: 4, camp: 2, nature: 2 });
  });

  it('has a shelf entry and a label for every sticker', () => {
    for (const sticker of STICKERS) {
      expect(STANDARD_SHELF).toContain(sticker.type);
      expect(YOUNG_SHELF).toContain(sticker.type);
      expect(sticker.labelKey).toMatch(/^sticker[A-Z]/);
      expect(sticker.size).toBeGreaterThanOrEqual(72);
      expect(sticker.size).toBeLessThanOrEqual(96);
      expect(getSticker(sticker.type)).toBe(sticker);
    }
  });

  it('uses 64px shelf targets for ages 3-5 and 72px for age 2', () => {
    expect(getShelfButtonSize(2)).toBe(72);
    expect(getShelfButtonSize(3)).toBe(64);
    expect(getShelfButtonSize(5)).toBe(64);
    expect(getShelf(2)).toEqual(YOUNG_SHELF);
    expect(getShelf(5)).toEqual(STANDARD_SHELF);
  });

  it('makes age-2 stickers larger on the canvas', () => {
    const standard = getPlacedSize('trex', 5);
    const young = getPlacedSize('trex', 2);

    expect(young).toBeGreaterThan(standard);
    expect(young).toBeGreaterThanOrEqual(88);
    expect(young).toBeLessThanOrEqual(112);
  });

  it('caps the canvas at 80 placed stickers', () => {
    expect(SOFT_CAP).toBe(80);
  });
});
