import { describe, it, expect } from 'vitest';
import { SHAPES, TYPES, spawn, rotateCW, rotateCCW, randomType } from '$lib/tetris/pieces.js';
import {
  DIFFICULTIES,
  SPEED_FLOOR_MS,
  SCORES,
  createBoard,
  stepInterval,
  collide,
  placePiece,
  rotatePiece,
  ghostY,
  findFullRows,
  clearLines,
  softDropScore,
  hardDropScore,
  bestPlacement,
  isGameOver
} from '$lib/tetris/engine.js';

describe('pieces', () => {
  it('defines exactly the 7 tetrominoes', () => {
    expect(TYPES.sort()).toEqual(['I', 'J', 'L', 'O', 'S', 'T', 'Z']);
    for (const t of TYPES) {
      expect(SHAPES[t].cells.length).toBeGreaterThan(0);
      expect(SHAPES[t].color).toMatch(/^#/);
    }
  });

  it('spawns with correct dimensions and position', () => {
    const i = spawn('I', 3, 5);
    expect(i.cells).toEqual([[1, 1, 1, 1]]);
    expect(i.x).toBe(3);
    expect(i.y).toBe(5);
    const o = spawn('O');
    expect(o.cells.length).toBe(2);
    expect(o.cells[0].length).toBe(2);
    expect(o.y).toBe(0);
  });

  it('CW rotation round-trips back to original via CCW', () => {
    for (const t of TYPES) {
      const p = spawn(t);
      const cw = rotateCW(p.cells);
      const back = rotateCCW(cw);
      expect(back).toEqual(p.cells);
    }
  });

  it('rotates I from horizontal to vertical', () => {
    const i = spawn('I');
    const vert = rotateCW(i.cells);
    expect(vert.length).toBe(4);
    expect(vert[0].length).toBe(1);
    expect(vert.every((r) => r[0] === 1)).toBe(true);
  });

  it('randomType returns valid types', () => {
    let seed = 1;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 30; i++) expect(TYPES).toContain(randomType(rng));
  });
});

describe('stepInterval', () => {
  it('matches difficulty base rates at level 1', () => {
    expect(stepInterval(1, 'easy')).toBe(1000);
    expect(stepInterval(1, 'medium')).toBe(700);
    expect(stepInterval(1, 'hard')).toBe(450);
  });

  it('shrinks ~8% per level and floors at 100ms', () => {
    const l5 = stepInterval(5, 'easy');
    expect(l5).toBeCloseTo(1000 * Math.pow(0.92, 4), -1);
    expect(stepInterval(100, 'easy')).toBe(SPEED_FLOOR_MS);
    expect(stepInterval(50, 'hard')).toBe(SPEED_FLOOR_MS);
    // ~8% shrink between consecutive low levels
    const a = stepInterval(1, 'medium');
    const b = stepInterval(2, 'medium');
    expect(b / a).toBeCloseTo(0.92, 2);
  });

  it('falls back to medium for unknown difficulty', () => {
    expect(stepInterval(1, 'chaos')).toBe(DIFFICULTIES.medium.dropMs);
  });
});

describe('collide / placePiece / ghostY', () => {
  it('detects walls, floor, and stack', () => {
    const board = createBoard();
    const o = spawn('O', 0, 0);
    expect(collide(board, o, -1, 0)).toBe(true); // left wall
    const i = spawn('I', 6, 19);
    expect(collide(board, i, 0, 1)).toBe(true); // floor
    board[18][3] = '#FFF';
    const t = spawn('T', 3, 16); // T bottom row at y=17; drop 1 → 18 overlap col 4? T cells row1=[1,1,1]
    expect(collide(board, t, 0, 1)).toBe(true);
    expect(collide(board, t, 0, 0)).toBe(false);
  });

  it('placePiece writes colors into the board', () => {
    const board = createBoard();
    placePiece(board, spawn('O', 4, 18));
    expect(board[18][4]).toBe(SHAPES.O.color);
    expect(board[19][5]).toBe(SHAPES.O.color);
  });

  it('ghostY finds the resting row', () => {
    const board = createBoard();
    board[19][0] = '#FFF';
    const i = spawn('I', 0, 0); // vertical? no—horizontal 4-wide at x=0..3; col0 blocked at r19
    const gy = ghostY(board, i);
    expect(gy).toBe(18); // can't reach 19 because col0 occupied
  });
});

describe('clearLines scoring', () => {
  function fillRows(board, rows) {
    for (const r of rows) board[r] = board[r].map(() => '#FFF');
  }

  it('returns 0/0 when nothing is full', () => {
    const board = createBoard();
    expect(clearLines(board, 1)).toEqual({ lines: 0, points: 0 });
  });

  it.each([
    [1, SCORES.single],
    [2, SCORES.double],
    [3, SCORES.triple],
    [4, SCORES.tetris]
  ])('clears %i line(s) for %i × level points', (n, base) => {
    const board = createBoard();
    fillRows(board, [19, 18, 17, 16].slice(0, n));
    const { lines, points } = clearLines(board, 3);
    expect(lines).toBe(n);
    expect(points).toBe(base * 3);
  });

  it('shifts remaining rows down after clear', () => {
    const board = createBoard();
    board[0][0] = '#AAA'; // top-left block survives, falls one row
    fillRows(board, [19]);
    clearLines(board, 1);
    expect(board[0][0]).toBe(null);
    expect(board[1][0]).toBe('#AAA');
    expect(board[19].every((c) => c === null)).toBe(true);
  });
});

describe('drop scoring', () => {
  it('awards 1/cell soft and 2/cell hard', () => {
    expect(softDropScore(7)).toBe(7);
    expect(hardDropScore(7)).toBe(14);
    expect(softDropScore(0)).toBe(0);
    expect(hardDropScore(-3)).toBe(0);
  });
});

describe('rotatePiece wall kicks', () => {
  it('kicks off the left wall instead of failing', () => {
    const board = createBoard();
    const i = spawn('I', 0, 5); // horizontal at left wall
    const rotated = rotatePiece(board, i, 'cw'); // becomes vertical, needs x shift
    expect(rotated).not.toBeNull();
    expect(rotated.cells.length).toBe(4);
  });

  it('returns null when no kick fits', () => {
    const board = createBoard();
    for (let r = 10; r < 20; r++) board[r] = board[r].map(() => '#FFF');
    const i = spawn('I', 0, 11); // buried in stack area
    expect(rotatePiece(board, i, 'cw')).toBeNull();
  });
});

describe('bestPlacement (hint)', () => {
  it('finds a flat landing for I on an empty board', () => {
    const board = createBoard();
    const i = spawn('I', 0, 0);
    const best = bestPlacement(board, i);
    expect(best).not.toBeNull();
    expect(best.y).toBe(19); // lowest row
  });

  it('prefers placements that clear lines', () => {
    const board = createBoard();
    // row 19 filled across cols 0..8 — a vertical I dropped into col 9 clears it
    for (let c = 0; c < 9; c++) board[19][c] = '#FFF';
    const i = spawn('I', 0, 0);
    const best = bestPlacement(board, i);
    expect(best).not.toBeNull();
    expect(best.x).toBe(9); // only column where a line clear happens
    expect(best.y).toBe(16); // vertical I resting on the floor
  });
});

describe('isGameOver', () => {
  it('fires when spawn overlaps the stack', () => {
    const board = createBoard();
    const o = spawn('O', 3, 0);
    expect(isGameOver(board, o)).toBe(false);
    board[0][3] = '#FFF';
    board[0][4] = '#FFF';
    expect(isGameOver(board, o)).toBe(true);
  });
});
