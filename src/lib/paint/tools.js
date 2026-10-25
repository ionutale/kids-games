// Studio tool set. Order matters: the palette is a 4x2 grid and the age-2 set
// is the literal first six colors, so coral through grape stay in place.
export const PAINT_COLORS = Object.freeze([
  Object.freeze({ id: 'coral', value: '#FF6B6B', labelKey: 'paintColorCoral' }),
  Object.freeze({ id: 'tangerine', value: '#FF9F43', labelKey: 'paintColorTangerine' }),
  Object.freeze({ id: 'sunshine', value: '#FFD54F', labelKey: 'paintColorSunshine' }),
  Object.freeze({ id: 'leaf', value: '#81C784', labelKey: 'paintColorLeaf' }),
  Object.freeze({ id: 'sky', value: '#4FC3F7', labelKey: 'paintColorSky' }),
  Object.freeze({ id: 'grape', value: '#8A6FD1', labelKey: 'paintColorGrape' }),
  Object.freeze({ id: 'bubblegum', value: '#FF8FB1', labelKey: 'paintColorBubblegum' }),
  Object.freeze({ id: 'cocoa', value: '#8B5A3C', labelKey: 'paintColorCocoa' })
]);

export const AGE2_COLORS = Object.freeze(PAINT_COLORS.slice(0, 6));

export const BRUSH_SIZES = Object.freeze([
  Object.freeze({ id: 'small', size: 6, labelKey: 'paintBrushSmall' }),
  Object.freeze({ id: 'medium', size: 12, labelKey: 'paintBrushMedium' }),
  Object.freeze({ id: 'big', size: 20, labelKey: 'paintBrushBig' })
]);

export const AGE2_BRUSH_SIZES = Object.freeze([
  BRUSH_SIZES[1],
  BRUSH_SIZES[2]
]);

export const STAMPS = Object.freeze([
  Object.freeze({ type: 'star', labelKey: 'paintStampStar' }),
  Object.freeze({ type: 'heart', labelKey: 'paintStampHeart' }),
  Object.freeze({ type: 'butterfly', labelKey: 'paintStampButterfly' }),
  Object.freeze({ type: 'flower', labelKey: 'paintStampFlower' })
]);

export const AGE2_STAMPS = Object.freeze([
  STAMPS[0],
  STAMPS[1],
  STAMPS[3]
]);

const STANDARD_TOOLS = Object.freeze({
  colors: PAINT_COLORS,
  brushSizes: BRUSH_SIZES,
  stamps: STAMPS
});

const YOUNG_TOOLS = Object.freeze({
  colors: AGE2_COLORS,
  brushSizes: AGE2_BRUSH_SIZES,
  stamps: AGE2_STAMPS
});

export function getToolsForAge(ageLevel) {
  const young = Number.isFinite(ageLevel) && ageLevel <= 2;
  return young ? YOUNG_TOOLS : STANDARD_TOOLS;
}
