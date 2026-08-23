import { describe, it, expect } from 'vitest';
import {
  PADS,
  sequenceLength,
  flashMs,
  generateSequence,
  validateTap,
  scoreFor
} from '$lib/sequence-memory/game.js';

describe('pads', () => {
  it('has 4 pads with emoji, color and distinct rising tones', () => {
    expect(PADS.length).toBe(4);
    const tones = PADS.map((p) => p.tone);
    expect([...tones].sort((a, b) => a - b)).toEqual(tones); // rising
    expect(new Set(tones).size).toBe(4);
    for (const p of PADS) {
      expect(p.emoji.length).toBeGreaterThan(0);
      expect(p.color).toMatch(/^#/);
    }
  });
});

describe('sequence shape', () => {
  it('round 1 has 2 steps, growing by 1 per round', () => {
    expect(sequenceLength(1)).toBe(2);
    expect(sequenceLength(2)).toBe(3);
    expect(sequenceLength(10)).toBe(11);
  });

  it('generates sequences of the right length with valid pad ids', () => {
    for (let round = 1; round <= 15; round++) {
      const seq = generateSequence(round);
      expect(seq.length).toBe(sequenceLength(round));
      for (const id of seq) {
        expect(id).toBeGreaterThanOrEqual(0);
        expect(id).toBeLessThan(PADS.length);
      }
    }
  });

  it('never repeats the same pad twice in a row', () => {
    for (let s = 1; s <= 20; s++) {
      const seq = generateSequence(s * 13);
      for (let i = 1; i < seq.length; i++) {
        expect(seq[i]).not.toBe(seq[i - 1]);
      }
    }
  });
});

describe('speed curve', () => {
  it('matches the spec thresholds', () => {
    expect(flashMs(1)).toBe(600);
    expect(flashMs(8)).toBe(600);
    expect(flashMs(9)).toBe(400);
    expect(flashMs(12)).toBe(400);
    expect(flashMs(13)).toBe(300);
    expect(flashMs(20)).toBe(250);
  });
});

describe('input validation', () => {
  const seq = [0, 2, 1, 3];

  it('accepts correct steps', () => {
    expect(validateTap(seq, 0, 0)).toBe('correct-step');
    expect(validateTap(seq, 1, 2)).toBe('correct-step');
    expect(validateTap(seq, 2, 1)).toBe('correct-step');
  });

  it('detects round completion on the final tap', () => {
    expect(validateTap(seq, 3, 3)).toBe('round-complete');
  });

  it('flags wrong taps anywhere', () => {
    expect(validateTap(seq, 0, 3)).toBe('wrong');
    expect(validateTap(seq, 3, 0)).toBe('wrong');
  });
});

describe('scoring', () => {
  it('score equals the round number', () => {
    expect(scoreFor(1)).toBe(1);
    expect(scoreFor(17)).toBe(17);
    expect(scoreFor(0)).toBe(0);
  });
});
