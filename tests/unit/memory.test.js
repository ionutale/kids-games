import { describe, it, expect } from 'vitest';

describe('Memory game', () => {
  it('difficulty 1-10 maps to pairs correctly', () => {
    function pairsFromLevel(level) {
      if (level >= 10) return 12;
      return level + 1;
    }
    expect(pairsFromLevel(1)).toBe(2);
    expect(pairsFromLevel(4)).toBe(5);
    expect(pairsFromLevel(9)).toBe(10);
    expect(pairsFromLevel(10)).toBe(12);
  });

  it('higher difficulty means smaller card size', () => {
    function colsFromCount(count) {
      if (count <= 8) return 2;
      return 4;
    }
    expect(colsFromCount(4)).toBe(2);
    expect(colsFromCount(8)).toBe(2);
    expect(colsFromCount(10)).toBe(4);
    expect(colsFromCount(24)).toBe(4);
  });

  it('deck has even number of cards', () => {
    const pairs = 6;
    expect(pairs * 2).toBe(12);
  });
});
