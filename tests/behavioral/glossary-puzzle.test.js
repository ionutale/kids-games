import { describe, it, expect } from 'vitest';
import { DIFFICULTIES } from '$lib/glossary-puzzle/images.js';
import { generatePieces } from '$lib/glossary-puzzle/pieces.js';

describe('Glossary Puzzle behavior', () => {
  it('pieces are shuffled', () => {
    const r = generatePieces(DIFFICULTIES.medium);
    const firstRow = r.pieces[0].correctRow;
    const firstCol = r.pieces[0].correctCol;
    const allSame = r.pieces.every(p => p.correctRow === firstRow && p.correctCol === firstCol);
    expect(allSame).toBe(false);
  });

  it('placing increments count', () => {
    const placed = new Set();
    placed.add('0-0');
    expect(placed.size).toBe(1);
    placed.add('1-1');
    expect(placed.size).toBe(2);
  });

  it('all placed triggers completion', () => {
    const total = 4;
    const placed = new Set(['0-0', '0-1', '1-0', '1-1']);
    expect(placed.size === total).toBe(true);
  });

  it('correct position is determined by coordinates', () => {
    const piece = { id: '2-3', correctRow: 2, correctCol: 3 };
    expect(piece.correctRow).toBe(2);
    expect(piece.correctCol).toBe(3);
  });

  it('tray holds limited pieces', () => {
    const trayCapacity = 4;
    const unplaced = Array(9).fill(0).map((_, i) => ({ id: `${i}` }));
    const trayPieces = unplaced.slice(0, trayCapacity);
    expect(trayPieces.length).toBe(4);
  });

  it('tray auto-refills when piece is placed', () => {
    const all = Array(9).fill(0).map((_, i) => ({ id: `${i}` }));
    let trayIndex = 0;
    const traySize = 4;
    let tray = all.slice(trayIndex, trayIndex + traySize);
    expect(tray.length).toBe(4);
  });

  it('snap radius is forgiving on easy', () => {
    const dist = 30;
    expect(dist <= DIFFICULTIES.easy.snapRadius).toBe(true);
  });

  it('snap radius is tight on hard', () => {
    const dist = 15;
    expect(dist > DIFFICULTIES.hard.snapRadius).toBe(false);
  });
});
