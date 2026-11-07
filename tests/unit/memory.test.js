import { describe, it, expect } from 'vitest';
import {
  pairsFromLevel,
  colsFromCount,
  peekDuration,
  mismatchDelay,
  PEEK_MS,
  PEEK_LATE_MS,
  MATCH_HOLD_MS
} from '../../src/lib/memory/timing.js';

describe('Memory game', () => {
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

  it('mismatch delay is gentle and never below 800ms', () => {
    expect(mismatchDelay(1)).toBe(1440);
    expect(mismatchDelay(5)).toBe(1200);
    expect(mismatchDelay(10)).toBe(900);
    expect(mismatchDelay(20)).toBe(800);
  });

  it('peek is longer for the youngest levels', () => {
    expect(PEEK_MS).toBe(1200);
    expect(PEEK_LATE_MS).toBe(800);
    expect(peekDuration(1)).toBe(1200);
    expect(peekDuration(4)).toBe(1200);
    expect(peekDuration(5)).toBe(800);
    expect(peekDuration(10)).toBe(800);
  });

  it('match celebration is short because the pair stays on the board', () => {
    expect(MATCH_HOLD_MS).toBe(700);
  });
});
