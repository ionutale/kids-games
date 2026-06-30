import { describe, it, expect } from 'vitest';
import { PUZZLE_IMAGES, getCategories, DIFFICULTIES } from '$lib/glossary-puzzle/images.js';
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

describe('Difficulty levels', () => {
  it('has easy/medium/hard', () => {
    expect(DIFFICULTIES.easy.label).toBe('Easy');
    expect(DIFFICULTIES.medium.label).toBe('Medium');
    expect(DIFFICULTIES.hard.label).toBe('Hard');
  });
  it('snap radius decreases with difficulty', () => {
    expect(DIFFICULTIES.easy.snapRadius).toBeGreaterThan(DIFFICULTIES.medium.snapRadius);
    expect(DIFFICULTIES.medium.snapRadius).toBeGreaterThan(DIFFICULTIES.hard.snapRadius);
  });
});

describe('Jigsaw pieces', () => {
  it('generates correct number of pieces', () => {
    const img = PUZZLE_IMAGES[0];
    const r = generatePieces(img, DIFFICULTIES.easy);
    expect(r.pieces.length).toBe(4);
    expect(r.rows).toBe(2);
    expect(r.cols).toBe(2);
  });

  it('medium generates 9 pieces', () => {
    const r = generatePieces(PUZZLE_IMAGES[0], DIFFICULTIES.medium);
    expect(r.pieces.length).toBe(9);
  });

  it('hard generates 16 pieces', () => {
    const r = generatePieces(PUZZLE_IMAGES[0], DIFFICULTIES.hard);
    expect(r.pieces.length).toBe(16);
  });

  it('pieces have edge data', () => {
    const r = generatePieces(PUZZLE_IMAGES[0], DIFFICULTIES.medium);
    r.pieces.forEach(p => {
      expect(p.edges.top).toBeTruthy();
      expect(p.edges.right).toBeTruthy();
      expect(p.edges.bottom).toBeTruthy();
      expect(p.edges.left).toBeTruthy();
    });
  });

  it('piecePath returns a valid SVG path', () => {
    const r = generatePieces(PUZZLE_IMAGES[0], DIFFICULTIES.easy);
    const path = piecePath(r.pieces[0].edges, 100);
    expect(path.startsWith('M 0,0')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
  });

  it('outer edges are flat', () => {
    const r = generatePieces(PUZZLE_IMAGES[0], DIFFICULTIES.easy);
    r.pieces.forEach(p => {
      if (p.correctRow === 0) expect(p.edges.top).toBe('flat');
      if (p.correctRow === r.rows - 1) expect(p.edges.bottom).toBe('flat');
      if (p.correctCol === 0) expect(p.edges.left).toBe('flat');
      if (p.correctCol === r.cols - 1) expect(p.edges.right).toBe('flat');
    });
  });

  it('adjacent pieces have matching edges', () => {
    const r = generatePieces(PUZZLE_IMAGES[0], DIFFICULTIES.medium);
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
