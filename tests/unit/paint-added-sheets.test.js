import { describe, it, expect } from 'vitest';
import * as farm from '../../src/lib/paint/paper/farm.js';
import * as space from '../../src/lib/paint/paper/space.js';
import * as jungle from '../../src/lib/paint/paper/jungle.js';
import * as arctic from '../../src/lib/paint/paper/arctic.js';
import * as castle from '../../src/lib/paint/paper/castle.js';
import * as vehicles from '../../src/lib/paint/paper/vehicles.js';
import * as princesses from '../../src/lib/paint/paper/princesses.js';
import * as snow from '../../src/lib/paint/paper/snow.js';
import * as ocean from '../../src/lib/paint/paper/ocean.js';
import * as robot from '../../src/lib/paint/paper/robot.js';

const SHEETS = [
  {
    name: 'Farm',
    art: farm,
    prefix: 'FARM',
    characters: ['cow', 'sheep']
  },
  {
    name: 'Space',
    art: space,
    prefix: 'SPACE',
    characters: ['moon', 'planet', 'rocket', 'fins', 'flame', 'astronaut', 'comet']
  },
  {
    name: 'Jungle',
    art: jungle,
    prefix: 'JUNGLE',
    characters: ['tiger', 'parrot', 'monkey', 'snake']
  },
  {
    name: 'Arctic',
    art: arctic,
    prefix: 'ARCTIC',
    characters: ['polar-bear', 'penguin', 'seal', 'fish']
  },
  {
    name: 'Castle',
    art: castle,
    prefix: 'CASTLE',
    characters: ['dragon', 'flag']
  },
  {
    name: 'Vehicles',
    art: vehicles,
    prefix: 'VEHICLES',
    characters: ['bus', 'car', 'truck']
  },
  {
    name: 'Princesses',
    art: princesses,
    prefix: 'PRINCESSES',
    characters: ['carriage', 'princess', 'crown', 'unicorn']
  },
  {
    name: 'Snow',
    art: snow,
    prefix: 'SNOW',
    characters: ['house', 'snowman', 'sled', 'pines']
  },
  {
    name: 'Ocean',
    art: ocean,
    prefix: 'OCEAN',
    characters: ['dolphin', 'turtle', 'clownfish', 'chest']
  },
  {
    name: 'Robot',
    art: robot,
    prefix: 'ROBOT',
    characters: ['antenna', 'robot-head', 'robot-body', 'arms', 'workbench']
  }
];

/** Lowest y a path reaches (M/L/C/Q/H/V/Z/A, absolute coordinates). */
function pathMaxY(d) {
  const tokens = d.match(/[MLCQHVAZ]|-?\d+(?:\.\d+)?/g) ?? [];
  let index = 0;
  let current = { x: 0, y: 0 };
  let maxY = 0;
  const num = () => Number(tokens[index++]);

  while (index < tokens.length) {
    const command = tokens[index++];
    if (command === 'M' || command === 'L') {
      current = { x: num(), y: num() };
      maxY = Math.max(maxY, current.y);
    } else if (command === 'C') {
      const points = [
        { x: num(), y: num() },
        { x: num(), y: num() },
        { x: num(), y: num() }
      ];
      for (const point of points) maxY = Math.max(maxY, point.y);
      current = points[2];
    } else if (command === 'Q') {
      const control = { x: num(), y: num() };
      const end = { x: num(), y: num() };
      maxY = Math.max(maxY, control.y, end.y);
      current = end;
    } else if (command === 'H') {
      current = { x: num(), y: current.y };
    } else if (command === 'V') {
      current = { x: current.x, y: num() };
      maxY = Math.max(maxY, current.y);
    } else if (command === 'A') {
      // rx ry rotation large-arc sweep x y; the endpoints cover the full
      // circles used by the new sheets.
      num();
      num();
      num();
      num();
      num();
      current = { x: num(), y: num() };
      maxY = Math.max(maxY, current.y);
    }
  }

  return maxY;
}

describe('Paint — ten added coloring sheets', () => {
  for (const sheet of SHEETS) {
    describe(sheet.name, () => {
      const viewbox = sheet.art[`${sheet.prefix}_VIEWBOX`];
      const regions = sheet.art[`${sheet.prefix}_REGIONS`];
      const lines = sheet.art[`${sheet.prefix}_LINES`];
      const dots = sheet.art[`${sheet.prefix}_DOTS`];
      const smiles = sheet.art[`${sheet.prefix}_SMILES`];

      it('is a 390x844 portrait sheet', () => {
        expect(viewbox).toEqual({ width: 390, height: 844 });
      });

      it('has 8-14 unique, closed regions', () => {
        expect(regions.length).toBeGreaterThanOrEqual(8);
        expect(regions.length).toBeLessThanOrEqual(14);
        const ids = regions.map((region) => region.id);
        const paths = regions.map((region) => region.d);
        expect(new Set(ids).size).toBe(ids.length);
        expect(new Set(paths).size).toBe(paths.length);
        for (const region of regions) {
          expect(region.d.trim()).toMatch(/^M\s/);
          expect(region.d.trim().endsWith('Z')).toBe(true);
        }
      });

      it('has enough ink detail for a coloring page', () => {
        expect(lines.length).toBeGreaterThanOrEqual(8);
        for (const line of lines) expect(line.d.trim().length).toBeGreaterThan(0);
        expect(dots.length).toBeGreaterThanOrEqual(2);
        expect(smiles.length).toBeGreaterThanOrEqual(1);
      });

      it('keeps every character above the age-2 dock', () => {
        for (const id of sheet.characters) {
          const region = regions.find((candidate) => candidate.id === id);
          expect(region, `missing ${id}`).toBeTruthy();
          expect(pathMaxY(region.d), id).toBeLessThanOrEqual(620);
        }
      });
    });
  }
});
