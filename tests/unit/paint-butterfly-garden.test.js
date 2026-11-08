import { describe, it, expect } from 'vitest';
import {
  BUTTERFLY_GARDEN_VIEWBOX,
  BUTTERFLY_GARDEN_REGIONS,
  BUTTERFLY_GARDEN_LINES,
  BUTTERFLY_GARDEN_DOTS,
  BUTTERFLY_GARDEN_SMILES
} from '#lib/paint/paper/butterflyGarden.js';

const EXPECTED_IDS = [
  'sky',
  'sun',
  'cloud-left',
  'cloud-right',
  'meadow',
  'flower-bed',
  'stems',
  'flower-left',
  'flower-center',
  'flower-right',
  'flower-centers',
  'butterfly',
  'watering-can',
  'snail',
  'garden-stones',
  'path'
];

/** Lowest art each character may reach: the age-2 app dock starts around y=644. */
const DOCK_SAFE_Y = 620;

/** Sample a path and return the lowest y it touches (M/L/C/H/V/Z, absolute). */
function pathMaxY(d) {
  const tokens = d.match(/[MLCHVZ]|-?\d+(?:\.\d+)?/g) ?? [];
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
    } else if (command === 'H') {
      current = { x: num(), y: current.y };
    } else if (command === 'V') {
      current = { x: current.x, y: num() };
      maxY = Math.max(maxY, current.y);
    } else if (command === 'Z') {
      current = start;
    }
  }

  return maxY;
}

function region(id) {
  const found = BUTTERFLY_GARDEN_REGIONS.find((candidate) => candidate.id === id);
  expect(found, `missing region ${id}`).toBeTruthy();
  return found;
}

describe('Butterfly Garden coloring page', () => {
  it('is a 390x844 portrait artboard', () => {
    expect(BUTTERFLY_GARDEN_VIEWBOX).toEqual({ width: 390, height: 844 });
  });

  it('defines 10-16 closed, paintable regions', () => {
    expect(BUTTERFLY_GARDEN_REGIONS.length).toBeGreaterThanOrEqual(10);
    expect(BUTTERFLY_GARDEN_REGIONS.length).toBeLessThanOrEqual(16);
  });

  it('keeps the region ids stable and in back-to-front order', () => {
    expect(BUTTERFLY_GARDEN_REGIONS.map((candidate) => candidate.id)).toEqual(EXPECTED_IDS);
  });

  it('has unique ids and unique, closed, non-empty paths', () => {
    const ids = BUTTERFLY_GARDEN_REGIONS.map((candidate) => candidate.id);
    expect(new Set(ids).size).toBe(ids.length);

    const paths = BUTTERFLY_GARDEN_REGIONS.map((candidate) => candidate.d);
    expect(new Set(paths).size).toBe(paths.length);

    for (const candidate of BUTTERFLY_GARDEN_REGIONS) {
      expect(candidate.d.trim()).toMatch(/^M\s/);
      expect(candidate.d.trim().endsWith('Z')).toBe(true);
    }
  });

  it('has a usable ink layer', () => {
    expect(BUTTERFLY_GARDEN_LINES.length).toBeGreaterThan(8);
    for (const line of BUTTERFLY_GARDEN_LINES) {
      expect(line.d.trim().length).toBeGreaterThan(0);
    }
    expect(BUTTERFLY_GARDEN_DOTS.length).toBeGreaterThan(0);
    expect(BUTTERFLY_GARDEN_SMILES.length).toBe(3);
  });

  it('keeps every character above the floating dock (age-2 top ~y=644)', () => {
    const inkMargin = 2.5;
    for (const id of [
      'flower-bed',
      'flower-left',
      'flower-center',
      'flower-right',
      'flower-centers',
      'butterfly',
      'watering-can',
      'snail'
    ]) {
      expect(pathMaxY(region(id).d) + inkMargin).toBeLessThanOrEqual(DOCK_SAFE_Y);
    }
  });
});
