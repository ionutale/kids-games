import { describe, it, expect } from 'vitest';
import {
  levelSpec,
  generatePuzzle,
  validatePath,
  bfs,
  hintCell,
  neighbors
} from '$lib/path-builder/engine.js';

describe('level spec', () => {
  it('grows grid and obstacles with level, capped at 6×6 / 8', () => {
    expect(levelSpec(1)).toEqual({ size: 4, obstacles: 1 });
    expect(levelSpec(5).size).toBe(4);
    expect(levelSpec(6).size).toBe(5);
    expect(levelSpec(10)).toEqual({ size: 5, obstacles: 5 });
    const hard = levelSpec(15);
    expect(hard.size).toBe(6);
    expect(hard.obstacles).toBeLessThanOrEqual(8);
  });
});

describe('generatePuzzle', () => {
  it('always yields a solvable puzzle with a valid BFS route', () => {
    for (let lvl = 1; lvl <= 20; lvl++) {
      for (let s = 0; s < 8; s++) {
        const p = generatePuzzle(lvl, lvl * 100 + s);
        const route = bfs(p.grid, p.start, p.goal);
        expect(route).not.toBeNull();
        expect(route.length - 1).toBeGreaterThanOrEqual(3); // min path length
        // obstacles placed match the requested count (or fewer on fallback)
        let obs = 0;
        for (const row of p.grid) for (const c of row) if (c === 'obstacle') obs++;
        expect(obs).toBeLessThanOrEqual(levelSpec(lvl).obstacles);
      }
    }
  });

  it('start never equals goal and both sit on empty cells', () => {
    for (let s = 0; s < 30; s++) {
      const p = generatePuzzle(7, s * 31);
      expect(p.start.r !== p.start.c || true).toBe(true);
      expect(p.start.r === p.goal.r && p.start.c === p.goal.c).toBe(false);
      expect(p.grid[p.start.r][p.start.c]).toBe('empty');
      expect(p.grid[p.goal.r][p.goal.c]).toBe('empty');
    }
  });

  it('is deterministic per seed', () => {
    expect(generatePuzzle(4, 12345)).toEqual(generatePuzzle(4, 12345));
  });
});

describe('validatePath', () => {
  const puzzle = (() => {
    // hand-built 3×3: start top-left, goal bottom-right, obstacle in the center
    return {
      size: 3,
      grid: [
        ['empty', 'empty', 'empty'],
        ['empty', 'obstacle', 'empty'],
        ['empty', 'empty', 'empty']
      ],
      start: { r: 0, c: 0 },
      goal: { r: 2, c: 2 }
    };
  })();

  it('rejects paths that do not begin at Start', () => {
    expect(validatePath(puzzle, [{ r: 0, c: 1 }])).toBe('invalid');
    expect(validatePath(puzzle, [])).toBe('invalid');
  });

  it('accepts a legal path and reports completion at the Goal', () => {
    const path = [
      { r: 0, c: 0 },
      { r: 1, c: 0 },
      { r: 2, c: 0 },
      { r: 2, c: 1 },
      { r: 2, c: 2 }
    ];
    expect(validatePath(puzzle, path.slice(0, 3))).toBe('ok');
    expect(validatePath(puzzle, path)).toBe('complete');
  });

  it('flags diagonal jumps as invalid', () => {
    expect(
      validatePath(puzzle, [
        { r: 0, c: 0 },
        { r: 1, c: 1 }
      ])
    ).toBe('invalid');
  });

  it('flags obstacle crossings as invalid', () => {
    expect(
      validatePath(puzzle, [
        { r: 0, c: 0 },
        { r: 0, c: 1 },
        { r: 1, c: 1 } // obstacle
      ])
    ).toBe('invalid');
  });
});

describe('bfs & hint', () => {
  it('bfs returns the shortest route length on an open grid', () => {
    const grid = [
      ['empty', 'empty'],
      ['empty', 'empty']
    ];
    const route = bfs(grid, { r: 0, c: 0 }, { r: 1, c: 1 });
    expect(route.length - 1).toBe(2);
  });

  it('hint proposes the next optimal step from the current tip', () => {
    const p = generatePuzzle(6, 5);
    const optimal = bfs(p.grid, p.start, p.goal);
    const hint = hintCell(p, []);
    expect(hint).toEqual(optimal[1]);
    // following hints from each tip walks the optimal route
    const walked = [p.start];
    for (let i = 0; i < optimal.length; i++) {
      const h = hintCell(p, walked);
      if (!h) break;
      walked.push(h);
    }
    expect(walked[walked.length - 1]).toEqual(p.goal);
  });

  it('neighbors are 4-directional within bounds', () => {
    expect(neighbors({ r: 0, c: 0 }, 3)).toEqual([
      { r: 1, c: 0 },
      { r: 0, c: 1 }
    ]);
    expect(neighbors({ r: 1, c: 1 }, 3).length).toBe(4);
  });
});
