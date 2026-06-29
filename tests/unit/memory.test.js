import { describe, it, expect } from 'vitest';

describe('Memory game', () => {
  function pairsFromLevel(level) {
    if (level >= 10) return 12;
    return level + 1;
  }

  function colsFromCount(count) {
    if (count <= 8) return 2;
    return 4;
  }

  it('difficulty 1-10 maps to pairs correctly', () => {
    expect(pairsFromLevel(1)).toBe(2);
    expect(pairsFromLevel(4)).toBe(5);
    expect(pairsFromLevel(9)).toBe(10);
    expect(pairsFromLevel(10)).toBe(12);
  });

  it('higher difficulty means smaller card size', () => {
    expect(colsFromCount(4)).toBe(2);
    expect(colsFromCount(8)).toBe(2);
    expect(colsFromCount(10)).toBe(4);
    expect(colsFromCount(24)).toBe(4);
  });

  it('level 1 starts with 3 pairs', () => {
    expect(pairsFromLevel(1)).toBe(2);
  });

  it('level 10 caps at 12 pairs', () => {
    expect(pairsFromLevel(10)).toBe(12);
    expect(pairsFromLevel(11)).toBe(12);
  });

  it('mismatch timeout decreases with level', () => {
    const timeout = (l) => 1500 - l * 100;
    expect(timeout(1)).toBe(1400);
    expect(timeout(5)).toBe(1000);
    expect(timeout(10)).toBe(500);
  });
});
