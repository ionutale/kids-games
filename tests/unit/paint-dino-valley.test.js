import { describe, it, expect } from 'vitest';
import {
  DINO_VALLEY_VIEWBOX,
  DINO_VALLEY_REGIONS,
  DINO_VALLEY_LINES,
  DINO_VALLEY_DOTS,
  DINO_VALLEY_SMILES
} from '#lib/paint/paper/dinoValley.js';

/**
 * The Paint page, the bucket, the brush clip and the e2e tests all look regions
 * up by id, so this list is the public contract of the coloring sheet. It is
 * ordered back-to-front and must stay in sync with UI expectations.
 */
const EXPECTED_IDS = [
  'sky',
  'sun',
  'cloud-left',
  'cloud-right',
  'mountain-left',
  'mountain-right',
  'volcano',
  'lava',
  'lake',
  'meadow',
  'palm',
  'tent',
  'brachiosaurus',
  'triceratops',
  'ferns',
  'path'
];

/** Lowest art each character may reach: the age-2 app dock starts around y=644. */
const DOCK_SAFE_Y = 620;

/**
 * Sample a path's cubic segments and return the lowest y it touches.
 * Only the commands the character paths use are handled (M/L/C/Z).
 */
function pathMaxY(d) {
  const tokens = d.match(/[MLCZ]|-?\d+(?:\.\d+)?/g) ?? [];
  let index = 0;
  let current = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };
  let maxY = 0;
  const num = () => Number(tokens[index++]);

  while (index < tokens.length) {
    const command = tokens[index++];
    if (command === 'M' || command === 'L') {
      current = { x: num(), y: num() };
      if (command === 'M') start = current;
      maxY = Math.max(maxY, current.y);
    } else if (command === 'C') {
      const p1 = { x: num(), y: num() };
      const p2 = { x: num(), y: num() };
      const p3 = { x: num(), y: num() };
      for (let step = 0; step <= 40; step += 1) {
        const t = step / 40;
        const mt = 1 - t;
        const y =
          mt ** 3 * current.y +
          3 * mt * mt * t * p1.y +
          3 * mt * t * t * p2.y +
          t ** 3 * p3.y;
        maxY = Math.max(maxY, y);
      }
      current = p3;
    } else if (command === 'Z') {
      current = start;
    }
  }

  return maxY;
}

describe('Dino Valley coloring page', () => {
  it('is a 390x844 portrait artboard', () => {
    expect(DINO_VALLEY_VIEWBOX).toEqual({ width: 390, height: 844 });
  });

  it('defines 10-16 closed, paintable regions', () => {
    expect(DINO_VALLEY_REGIONS.length).toBeGreaterThanOrEqual(10);
    expect(DINO_VALLEY_REGIONS.length).toBeLessThanOrEqual(16);
  });

  it('keeps the region ids stable and in back-to-front order', () => {
    expect(DINO_VALLEY_REGIONS.map((region) => region.id)).toEqual(EXPECTED_IDS);
  });

  it('has a unique id on every region', () => {
    const ids = DINO_VALLEY_REGIONS.map((region) => region.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has non-empty path data on every region', () => {
    for (const region of DINO_VALLEY_REGIONS) {
      expect(typeof region.d).toBe('string');
      expect(region.d.trim().length).toBeGreaterThan(0);
      expect(region.d).toMatch(/^M\s/);
      expect(region.d.trim().endsWith('Z')).toBe(true);
    }
  });

  it('does not repeat a region path', () => {
    const paths = DINO_VALLEY_REGIONS.map((region) => region.d);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('draws an ink layer made of paths and dots', () => {
    expect(DINO_VALLEY_LINES.length).toBeGreaterThan(0);
    for (const line of DINO_VALLEY_LINES) {
      expect(line.d.trim().length).toBeGreaterThan(0);
    }
    expect(DINO_VALLEY_DOTS.length).toBeGreaterThan(0);
    for (const dot of DINO_VALLEY_DOTS) {
      expect(dot.r).toBeGreaterThan(0);
    }
    expect(DINO_VALLEY_SMILES.length).toBe(2);
  });

  it('keeps every character above the floating dock (age-2 top ~y=644)', () => {
    // 4.5px stroke is centered on the path, so leave room for half of it.
    const inkMargin = 2.5;
    for (const id of ['brachiosaurus', 'triceratops', 'tent']) {
      const region = DINO_VALLEY_REGIONS.find((candidate) => candidate.id === id);
      expect(pathMaxY(region.d) + inkMargin).toBeLessThanOrEqual(DOCK_SAFE_Y);
    }
  });
});
