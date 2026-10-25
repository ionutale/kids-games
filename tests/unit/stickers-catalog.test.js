import { describe, it, expect } from 'vitest';
import {
  WORLD,
  STICKERS,
  STANDARD_SHELF,
  YOUNG_SHELF,
  SOFT_CAP,
  SHELF_BUTTON_SIZE,
  PLACED_SIZE_SCALE,
  getSticker,
  getShelf,
  getShelfButtonSize,
  getPlacedSize
} from '$lib/stickers/catalog.js';

function countGroups(types) {
  return types.reduce((counts, type) => {
    const group = getSticker(type).group;
    counts[group] = (counts[group] ?? 0) + 1;
    return counts;
  }, {});
}

describe('Stickers catalog (Dino Valley)', () => {
  it('has one world', () => {
    expect(WORLD.id).toBe('dino-valley');
    expect(WORLD.nameKey).toBe('stickerWorldDinoValley');
  });

  it('has 24 unique sticker types in a 6/6/6/6 mix', () => {
    expect(STICKERS).toHaveLength(24);
    expect(new Set(STICKERS.map((sticker) => sticker.type)).size).toBe(24);

    const groups = STICKERS.reduce((counts, sticker) => {
      counts[sticker.group] = (counts[sticker.group] ?? 0) + 1;
      return counts;
    }, {});

    expect(groups).toEqual({ dino: 6, camp: 6, nature: 6, vehicle: 6 });
  });

  it('keeps the 6/6/6/6 groups contiguous in standard order', () => {
    const runs = STANDARD_SHELF.map((type) => getSticker(type).group).filter(
      (group, index, all) => index === 0 || group !== all[index - 1]
    );

    expect(runs).toEqual(['dino', 'camp', 'nature', 'vehicle']);
  });

  it('has a shelf entry and a label for every sticker', () => {
    for (const sticker of STICKERS) {
      expect(STANDARD_SHELF).toContain(sticker.type);
      expect(sticker.labelKey).toMatch(/^sticker[A-Z]/);
      expect(sticker.size).toBeGreaterThanOrEqual(72);
      expect(sticker.size).toBeLessThanOrEqual(96);
      expect(getSticker(sticker.type)).toBe(sticker);
    }
  });

  it('keeps the age-2 palette explicit at 8 types and a 4/2/2 mix', () => {
    expect(YOUNG_SHELF).toHaveLength(8);
    expect(new Set(YOUNG_SHELF).size).toBe(8);
    expect(YOUNG_SHELF.every((type) => STANDARD_SHELF.includes(type))).toBe(true);
    expect(YOUNG_SHELF).not.toEqual(STANDARD_SHELF);

    expect(countGroups(YOUNG_SHELF)).toEqual({ dino: 4, camp: 2, nature: 2 });
  });

  it('uses 64px shelf targets for ages 3-5 and 72px for age 2', () => {
    expect(getShelfButtonSize(2)).toBe(72);
    expect(getShelfButtonSize(3)).toBe(64);
    expect(getShelfButtonSize(5)).toBe(64);
    expect(SHELF_BUTTON_SIZE).toEqual({ standard: 64, young: 72 });

    expect(getShelf(2)).toEqual(YOUNG_SHELF);
    expect(getShelf(2)).toHaveLength(8);
    expect(getShelf(5)).toEqual(STANDARD_SHELF);
    expect(getShelf(5)).toHaveLength(24);
  });

  it('makes age-2 stickers larger on the canvas', () => {
    const standard = getPlacedSize('trex', 5);
    const young = getPlacedSize('trex', 2);

    expect(young).toBeGreaterThan(standard);
    expect(young).toBeGreaterThanOrEqual(88);
    expect(young).toBeLessThanOrEqual(112);
    expect(PLACED_SIZE_SCALE).toEqual({ standard: 1, young: 1.2 });
    expect(young).toBe(Math.round(getSticker('trex').size * 1.2));
  });

  it('sizes every placed sticker within 72-96px at the standard scale and 1.2x for age 2', () => {
    for (const sticker of STICKERS) {
      const standard = getPlacedSize(sticker.type, 5);
      const young = getPlacedSize(sticker.type, 2);

      expect(standard).toBeGreaterThanOrEqual(72);
      expect(standard).toBeLessThanOrEqual(96);
      expect(young).toBe(Math.round(standard * 1.2));
      expect(young).toBeGreaterThanOrEqual(86);
      expect(young).toBeLessThanOrEqual(115);
    }
  });

  it('caps the canvas at 80 placed stickers', () => {
    expect(SOFT_CAP).toBe(80);
  });
});
