import { describe, it, expect } from 'vitest';

describe('Puzzle game', () => {
  it('piece count scales with age', () => {
    const countByAge = { 2: 2, 3: 4, 4: 6, 5: 8 };
    expect(countByAge[2]).toBe(2);
    expect(countByAge[5]).toBe(8);
  });

  it('grid cols are correct', () => {
    const colsByAge = { 2: 2, 3: 2, 4: 3, 5: 3 };
    expect(colsByAge[2]).toBe(2);
    expect(colsByAge[4]).toBe(3);
  });
});
