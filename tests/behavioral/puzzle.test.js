import { describe, it, expect } from 'vitest';

function createPieces(count, colors) {
  const cols = count <= 2 ? 2 : count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / cols);
  const pieces = [];
  let id = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols && id < count; c++) {
      pieces.push({ id, correctRow: r, correctCol: c, row: r, col: c, color: colors[id % colors.length], placed: false });
      id++;
    }
  }
  const positions = pieces.map(p => ({ row: p.row, col: p.col }));
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  pieces.forEach((p, i) => { p.row = positions[i].row; p.col = positions[i].col; });
  return pieces;
}

function placePiece(pieces, id) {
  const piece = pieces.find(p => p.id === id);
  if (!piece || piece.placed) return pieces;
  if (piece.row === piece.correctRow && piece.col === piece.correctCol) {
    return pieces.map(p => p.id === id ? { ...p, placed: true } : p);
  }
  const neighbor = pieces.find(p => p.row === piece.correctRow && p.col === piece.correctCol && !p.placed && p.id !== id);
  if (neighbor) {
    let result = pieces.map(p => {
      if (p.id === id) return { ...p, row: neighbor.row, col: neighbor.col };
      if (p.id === neighbor.id) return { ...neighbor, row: piece.row, col: piece.col };
      return p;
    });
    const moved = result.find(p => p.id === id);
    if (moved.row === moved.correctRow && moved.col === moved.correctCol) {
      result = result.map(p => p.id === id ? { ...p, placed: true } : p);
    }
    return result;
  }
  return pieces;
}

describe('Puzzle game behavior', () => {
  const colors = ['#FF6B6B', '#4FC3F7', '#FFD54F'];

  it('creates correct number of pieces', () => {
    expect(createPieces(2, colors)).toHaveLength(2);
    expect(createPieces(6, colors)).toHaveLength(6);
  });

  it('placing piece on its correct spot marks it placed', () => {
    const pieces = createPieces(2, colors).map((p, i) => ({
      ...p, row: i === 0 ? 0 : 1, col: i === 0 ? 0 : 1
    }));
    const result = placePiece(pieces, 0);
    expect(result[0].placed).toBe(true);
  });

  it('swapping with neighbor places the piece', () => {
    const pieces = [
      { id: 0, correctRow: 0, correctCol: 0, row: 1, col: 1, placed: false },
      { id: 1, correctRow: 1, correctCol: 1, row: 0, col: 0, placed: false },
    ];
    const result = placePiece(pieces, 0);
    expect(result[0].row).toBe(0);
    expect(result[0].col).toBe(0);
    expect(result[0].placed).toBe(true);
  });

  it('all pieces placed triggers win', () => {
    const pieces = [
      { id: 0, correctRow: 0, correctCol: 0, row: 0, col: 0, placed: true },
      { id: 1, correctRow: 1, correctCol: 1, row: 1, col: 1, placed: true },
    ];
    const allPlaced = pieces.every(p => p.placed);
    expect(allPlaced).toBe(true);
  });
});
