import { describe, it, expect } from 'vitest';
import {
  PAINT_COLORS,
  AGE2_COLORS,
  BRUSH_SIZES,
  AGE2_BRUSH_SIZES,
  STAMPS,
  AGE2_STAMPS,
  getToolsForAge
} from '#lib/paint/tools.js';

const HEXES = [
  '#FF6B6B',
  '#FF9F43',
  '#FFD54F',
  '#81C784',
  '#4FC3F7',
  '#8A6FD1',
  '#FF8FB1',
  '#8B5A3C'
];

describe('Paint tools', () => {
  it('has the eight studio colors in palette order', () => {
    expect(PAINT_COLORS.map((color) => color.value)).toEqual(HEXES);
    expect(PAINT_COLORS.map((color) => color.id)).toEqual([
      'coral',
      'tangerine',
      'sunshine',
      'leaf',
      'sky',
      'grape',
      'bubblegum',
      'cocoa'
    ]);
  });

  it('labels every color with a paintColor* key', () => {
    for (const color of PAINT_COLORS) {
      expect(color.labelKey).toBe(
        `paintColor${color.id.charAt(0).toUpperCase()}${color.id.slice(1)}`
      );
    }
  });

  it('gives age 2 the first six colors only', () => {
    expect(AGE2_COLORS.map((color) => color.id)).toEqual([
      'coral',
      'tangerine',
      'sunshine',
      'leaf',
      'sky',
      'grape'
    ]);
    expect(AGE2_COLORS.some((color) => color.id === 'bubblegum')).toBe(false);
    expect(AGE2_COLORS.some((color) => color.id === 'cocoa')).toBe(false);
  });

  it('has the three brush sizes in pixels', () => {
    expect(BRUSH_SIZES.map((brush) => brush.id)).toEqual(['small', 'medium', 'big']);
    expect(BRUSH_SIZES.map((brush) => brush.size)).toEqual([6, 12, 20]);
    expect(BRUSH_SIZES.map((brush) => brush.labelKey)).toEqual([
      'paintBrushSmall',
      'paintBrushMedium',
      'paintBrushBig'
    ]);
  });

  it('drops the small brush at age 2', () => {
    expect(AGE2_BRUSH_SIZES.map((brush) => brush.id)).toEqual(['medium', 'big']);
    expect(AGE2_BRUSH_SIZES.map((brush) => brush.size)).toEqual([12, 20]);
  });

  it('has the four original stamps', () => {
    expect(STAMPS.map((stamp) => stamp.type)).toEqual([
      'star',
      'heart',
      'butterfly',
      'flower'
    ]);
    expect(STAMPS.map((stamp) => stamp.labelKey)).toEqual([
      'paintStampStar',
      'paintStampHeart',
      'paintStampButterfly',
      'paintStampFlower'
    ]);
  });

  it('drops the butterfly at age 2', () => {
    expect(AGE2_STAMPS.map((stamp) => stamp.type)).toEqual([
      'star',
      'heart',
      'flower'
    ]);
  });

  it('returns the standard studio for ages 3-5', () => {
    for (const age of [3, 4, 5]) {
      expect(getToolsForAge(age)).toEqual({
        colors: PAINT_COLORS,
        brushSizes: BRUSH_SIZES,
        stamps: STAMPS
      });
    }
    expect(getToolsForAge(undefined).colors).toBe(PAINT_COLORS);
  });

  it('returns the reduced studio at age 2', () => {
    expect(getToolsForAge(2)).toEqual({
      colors: AGE2_COLORS,
      brushSizes: AGE2_BRUSH_SIZES,
      stamps: AGE2_STAMPS
    });
  });

  it('keeps the tool sets frozen', () => {
    expect(Object.isFrozen(PAINT_COLORS)).toBe(true);
    expect(Object.isFrozen(PAINT_COLORS[0])).toBe(true);
    expect(Object.isFrozen(BRUSH_SIZES)).toBe(true);
    expect(Object.isFrozen(STAMPS)).toBe(true);
  });
});
