import { SHAPES, rotateCW, rotateCCW } from './pieces.js';

export const DIFFICULTIES = {
  easy: { dropMs: 1000, ghost: true, hold: false },
  medium: { dropMs: 700, ghost: false, hold: false },
  hard: { dropMs: 450, ghost: false, hold: true }
};

export const SPEED_FLOOR_MS = 100;
export const LINES_PER_LEVEL = 10;
export const SCORES = { single: 100, double: 300, triple: 500, tetris: 800 };

export function createBoard(rows = 20, cols = 10) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

export function stepInterval(level, difficulty = 'medium') {
  const base = DIFFICULTIES[difficulty]?.dropMs ?? DIFFICULTIES.medium.dropMs;
  const ms = base * Math.pow(0.92, Math.max(1, level) - 1);
  return Math.max(SPEED_FLOOR_MS, Math.round(ms));
}

export function collide(board, piece, dx = 0, dy = 0) {
  for (let r = 0; r < piece.cells.length; r++) {
    for (let c = 0; c < piece.cells[r].length; c++) {
      if (!piece.cells[r][c]) continue;
      const y = piece.y + r + dy;
      const x = piece.x + c + dx;
      if (y < 0 || y >= board.length || x < 0 || x >= board[0].length) return true;
      if (board[y][x]) return true;
    }
  }
  return false;
}

export function placePiece(board, piece) {
  for (let r = 0; r < piece.cells.length; r++) {
    for (let c = 0; c < piece.cells[r].length; c++) {
      if (!piece.cells[r][c]) continue;
      const y = piece.y + r;
      const x = piece.x + c;
      if (y >= 0 && y < board.length && x >= 0 && x < board[0].length) {
        board[y][x] = piece.color ?? piece.type;
      }
    }
  }
}

function rotatedWithColor(piece, dir) {
  const cells = dir === 'cw' ? rotateCW(piece.cells) : rotateCCW(piece.cells);
  return cells.map((row) => [...row]);
}

/** Rotate with simple wall kicks: try offsets 0, -1, +1, -2, +2. Returns new piece or null. */
export function rotatePiece(board, piece, dir = 'cw') {
  const cells = rotatedWithColor(piece, dir);
  for (const kick of [0, -1, 1, -2, 2]) {
    const candidate = { ...piece, cells };
    if (!collide(board, candidate, kick, 0)) {
      return { ...candidate, x: piece.x + kick };
    }
  }
  return null;
}

export function ghostY(board, piece) {
  let dy = 0;
  while (!collide(board, piece, 0, dy + 1)) dy += 1;
  return piece.y + dy;
}

export function findFullRows(board) {
  const rows = [];
  for (let r = 0; r < board.length; r++) {
    if (board[r].every((cell) => cell !== null)) rows.push(r);
  }
  return rows;
}

const CLEAR_SCORE = { 1: SCORES.single, 2: SCORES.double, 3: SCORES.triple, 4: SCORES.tetris };

/** Removes full rows (in place) and returns { lines, points }. */
export function clearLines(board, level = 1) {
  const rows = findFullRows(board);
  if (rows.length === 0) return { lines: 0, points: 0 };
  for (const r of rows) {
    board.splice(r, 1);
    board.unshift(Array(board[0].length).fill(null));
  }
  const base = CLEAR_SCORE[rows.length] ?? SCORES.single;
  return { lines: rows.length, points: base * level };
}

export function softDropScore(cells = 1) {
  return Math.max(0, cells);
}

export function hardDropScore(cells = 1) {
  return Math.max(0, cells) * 2;
}

/**
 * Best placement heuristic for the Hint button: tries every unique rotation × column,
 * prefers most lines cleared, then fewest holes created, then lowest resting row.
 * Returns { x, y, cells } for the winning orientation/position, or null.
 */
export function bestPlacement(board, piece) {
  let best = null;
  let seen = new Set();
  let current = { ...piece, cells: piece.cells.map((r) => [...r]) };
  for (let rot = 0; rot < 4; rot++) {
    const key = current.cells.map((r) => r.join('')).join('|');
    if (!seen.has(key)) {
      seen.add(key);
      for (let x = -2; x < board[0].length + 2; x++) {
        const candidate = { ...current, x };
        if (collide(board, candidate, 0, 0)) continue;
        const gy = ghostY(board, candidate);
        const placed = { ...candidate, y: gy };
        const simBoard = board.map((r) => [...r]);
        placePiece(simBoard, placed);
        const { lines } = clearLines(simBoard.map((r) => [...r]));
        // count holes: empty cells with something above in same column
        let holes = 0;
        for (let c = 0; c < simBoard[0].length; c++) {
          let seenBlock = false;
          for (let r = 0; r < simBoard.length; r++) {
            if (simBoard[r][c]) seenBlock = true;
            else if (seenBlock) holes++;
          }
        }
        const score = lines * 10000 - holes * 100 + gy;
        if (!best || score > best.score) {
          best = { score, x, y: gy, cells: placed.cells, color: piece.color };
        }
      }
    }
    current = { ...current, cells: rotatedWithColor(current, 'cw') };
  }
  void SHAPES;
  return best ? { x: best.x, y: best.y, cells: best.cells, color: best.color } : null;
}

/** True when a fresh spawn at (x,y) overlaps the stack. */
export function isGameOver(board, piece) {
  return collide(board, piece, 0, 0);
}
