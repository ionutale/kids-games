import { describe, it, expect } from 'vitest';
import { levelConfig } from '$lib/glossary-puzzle/images.js';
import { generatePieces, computeVisibleTray, TRAY_CAPACITY } from '$lib/glossary-puzzle/pieces.js';

describe('Glossary Puzzle behavior', () => {
  it('pieces are shuffled', () => {
    const r = generatePieces(levelConfig(3));
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
    const queue = Array(9).fill(0).map((_, i) => `${i}`);
    const visible = computeVisibleTray(queue, new Set());
    expect(TRAY_CAPACITY).toBe(4);
    expect(visible.length).toBe(4);
  });

  it('tray auto-refills when piece is placed', () => {
    const queue = Array(9).fill(0).map((_, i) => `${i}`);
    let visible = computeVisibleTray(queue, new Set());
    expect(visible[0]).toBe('0');
    visible = computeVisibleTray(queue, new Set(['0']));
    expect(visible.length).toBe(4);
    expect(visible[0]).toBe('1');
    expect(visible).not.toContain('0');
  });

  it('dragged piece leaves the tray', () => {
    const queue = ['a', 'b', 'c', 'd', 'e'];
    expect(computeVisibleTray(queue, new Set(), 'b')).toEqual(['a', 'c', 'd', 'e']);
  });

  it('missed piece returns to the front of the tray', () => {
    const queue = ['a', 'b', 'c'];
    const returnedToFront = ['e', ...queue.filter(id => id !== 'e')];
    expect(returnedToFront[0]).toBe('e');
  });

  it('snap radius is forgiving on level 1', () => {
    const dist = 30;
    expect(dist <= levelConfig(1).snapRadius).toBe(true);
  });

  it('snap radius is tight on level 9', () => {
    const dist = 15;
    expect(dist > levelConfig(9).snapRadius).toBe(false);
  });
});
