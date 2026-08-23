import { describe, it, expect } from 'vitest';
import { PUZZLE_IMAGES, getCategories, levelConfig } from '$lib/glossary-puzzle/images.js';
import { generatePieces, piecePath } from '$lib/glossary-puzzle/pieces.js';

describe('Puzzle images', () => {
  it('has 8 images', () => expect(PUZZLE_IMAGES.length).toBe(8));
  it('each image has id, name, category, icon, file', () => {
    PUZZLE_IMAGES.forEach(img => {
      expect(img.id).toBeTruthy();
      expect(img.file).toBeTruthy();
      expect(img.category).toBeTruthy();
    });
  });
  it('has 4 categories', () => expect(getCategories().length).toBe(4));
});

describe('Levels are difficulty steps', () => {
  it('level 1 is a 2x2 grid', () => {
    const c = levelConfig(1);
    expect(c.cols).toBe(2);
    expect(c.rows).toBe(2);
  });

  it('grid grows with level', () => {
    let last = 0;
    for (let n = 1; n <= 10; n++) {
      const c = levelConfig(n);
      expect(c.cols * c.rows).toBeGreaterThan(last);
      last = c.cols * c.rows;
    }
  });

  it('ladder is unbounded and stays sane at high levels', () => {
    for (const n of [15, 20, 30]) {
      const c = levelConfig(n);
      expect(c.cols).toBeGreaterThanOrEqual(2);
      expect(c.rows).toBeGreaterThanOrEqual(2);
      expect(c.snapRadius).toBeGreaterThanOrEqual(10);
    }
  });

  it('snap radius tightens with level', () => {
    expect(levelConfig(1).snapRadius).toBeGreaterThan(levelConfig(5).snapRadius);
    expect(levelConfig(5).snapRadius).toBeGreaterThan(levelConfig(9).snapRadius);
  });

  it('clamps bad input to level 1', () => {
    expect(levelConfig(0).cols).toBe(levelConfig(1).cols);
    expect(levelConfig(-3).rows).toBe(levelConfig(1).rows);
    expect(levelConfig(NaN).cols).toBe(2);
  });
});

describe('Jigsaw pieces', () => {
  it('generates correct number of pieces', () => {
    const r = generatePieces(levelConfig(1));
    expect(r.pieces.length).toBe(4);
    expect(r.rows).toBe(2);
    expect(r.cols).toBe(2);
  });

  it('level 3 generates 9 pieces', () => {
    const r = generatePieces(levelConfig(3));
    expect(r.pieces.length).toBe(9);
  });

  it('level 5 generates 16 pieces', () => {
    const r = generatePieces(levelConfig(5));
    expect(r.pieces.length).toBe(16);
  });

  it('pieces have edge data', () => {
    const r = generatePieces(levelConfig(3));
    r.pieces.forEach(p => {
      expect(p.edges.top).toBeTruthy();
      expect(p.edges.right).toBeTruthy();
      expect(p.edges.bottom).toBeTruthy();
      expect(p.edges.left).toBeTruthy();
    });
  });

  it('piecePath returns a valid SVG path', () => {
    const r = generatePieces(levelConfig(1));
    const path = piecePath(r.pieces[0].edges, 100);
    expect(path.startsWith('M 0.0,0.0')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
  });

  it('outer edges are flat', () => {
    const r = generatePieces(levelConfig(1));
    r.pieces.forEach(p => {
      if (p.correctRow === 0) expect(p.edges.top).toBe('flat');
      if (p.correctRow === r.rows - 1) expect(p.edges.bottom).toBe('flat');
      if (p.correctCol === 0) expect(p.edges.left).toBe('flat');
      if (p.correctCol === r.cols - 1) expect(p.edges.right).toBe('flat');
    });
  });

  it('adjacent pieces have matching edges', () => {
    const r = generatePieces(levelConfig(3));
    for (let row = 0; row < r.rows; row++) {
      for (let col = 0; col < r.cols; col++) {
        const p = r.pieces.find(pp => pp.correctRow === row && pp.correctCol === col);
        const right = r.pieces.find(pp => pp.correctRow === row && pp.correctCol === col + 1);
        const bottom = r.pieces.find(pp => pp.correctRow === row + 1 && pp.correctCol === col);
        if (right) expect(p.edges.right).not.toBe(right.edges.left);
        if (bottom) expect(p.edges.bottom).not.toBe(bottom.edges.top);
      }
    }
  });
});
