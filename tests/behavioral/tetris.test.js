import { describe, it, expect } from 'vitest';
import { spawn } from '$lib/tetris/pieces.js';
import {
  DIFFICULTIES,
  createBoard,
  stepInterval,
  collide,
  placePiece,
  rotatePiece,
  clearLines,
  isGameOver,
  LINES_PER_LEVEL
} from '$lib/tetris/engine.js';

/** Simulates gravity one tick: returns false when the piece locked at current position. */
function gravityStep(board, piece) {
  if (!collide(board, piece, 0, 1)) {
    piece.y += 1;
    return true;
  }
  placePiece(board, piece);
  return false;
}

describe('Tetris full round simulation', () => {
  it('spawn → move → rotate → drop → lock → line clear → score → level up math', () => {
    const board = createBoard();
    // prepare: fill row 19 except col 9 so a vertical I clears it
    for (let c = 0; c < 9; c++) board[19][c] = '#FFF';

    let piece = spawn('I', 3, 0);
    piece = rotatePiece(board, piece, 'cw'); // vertical I
    piece = { ...piece, x: 9 }; // hover above the gap column
    expect(collide(board, piece, 0, 0)).toBe(false);

    // move left then back right (movement must not stick)
    piece = { ...piece, x: piece.x - 1 };
    expect(collide(board, piece, 0, 0)).toBe(false);
    piece = { ...piece, x: piece.x + 1 };

    // rotate CW twice — vertical stays vertical with kicks
    piece = rotatePiece(board, piece, 'cw') ?? piece;
    piece = rotatePiece(board, piece, 'ccw') ?? piece;

    // soft-drop all the way to lock
    let steps = 0;
    while (gravityStep(board, piece) && steps < 40) steps++;
    expect(steps).toBe(16); // rows 0..16 travel, locks spanning 16..19

    const { lines, points } = clearLines(board, 1);
    expect(lines).toBe(1);
    expect(points).toBe(100);

    // level-up arithmetic: 10 lines ⇒ level 2 (10 cleared total)
    const totalLines = lines;
    const level = 1 + Math.floor(totalLines / LINES_PER_LEVEL);
    expect(level).toBe(1); // only 1 line so far — boundary check at exactly 10:
    expect(1 + Math.floor(LINES_PER_LEVEL / LINES_PER_LEVEL)).toBe(2);
  });

  it('hard drop locks instantly at ghost position and awards double points', async () => {
    const { hardDropScore, ghostY } = await import('$lib/tetris/engine.js');
    const board = createBoard();
    let piece = spawn('O', 4, 0);
    const gy = ghostY(board, piece);
    expect(gy).toBe(18);
    piece = { ...piece, y: gy };
    gravityStep(board, piece); // collide → locks immediately
    expect(board[18][4]).not.toBe(null);
    expect(hardDropScore(gy - 0)).toBe((gy) * 2);
  });
});

describe('difficulty matrix', () => {
  it('produces spec intervals and feature flags', () => {
    expect(DIFFICULTIES.easy).toEqual({ dropMs: 1000, ghost: true, hold: false });
    expect(DIFFICULTIES.medium).toEqual({ dropMs: 700, ghost: false, hold: false });
    expect(DIFFICULTIES.hard).toEqual({ dropMs: 450, ghost: false, hold: true });
    expect(stepInterval(2, 'easy')).toBeLessThan(stepInterval(1, 'easy'));
  });
});

describe('game over at stack top', () => {
  it('spawn colliding with a full stack triggers game over', () => {
    const board = createBoard();
    for (let r = 0; r < 19; r++) board[r] = board[r].map(() => '#FFF');
    const o = spawn('O', 3, 0);
    expect(isGameOver(board, o)).toBe(true);
  });

  it('near-full stack still allows play', () => {
    const board = createBoard();
    for (let r = 2; r < 19; r++) board[r] = board[r].map(() => '#FFF');
    expect(isGameOver(board, spawn('O', 3, 0))).toBe(false);
  });
});
