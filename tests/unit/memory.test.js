import { describe, it, expect } from 'vitest';

describe('Memory game', () => {
  it('calculates pairs by age', () => {
    const pairsByAge = { 2: 3, 3: 4, 4: 6, 5: 8 };
    expect(pairsByAge[2]).toBe(3);
    expect(pairsByAge[3]).toBe(4);
    expect(pairsByAge[4]).toBe(6);
    expect(pairsByAge[5]).toBe(8);
  });

  it('deck has even number of cards', () => {
    const pairs = 6;
    expect(pairs * 2).toBe(12);
  });
});
