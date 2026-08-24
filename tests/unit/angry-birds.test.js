import { describe, it, expect } from 'vitest';
import { birdForShot } from '$lib/angry-emoji/birds.js';

describe('birdForShot', () => {
  it('tier 1 is always the plain bird', () => {
    for (let shotsLeft = 1; shotsLeft <= 3; shotsLeft++) {
      expect(birdForShot(1, shotsLeft)).toBe('bird');
    }
  });

  it('tier 2 opens with the bird and closes with the bouncy ball', () => {
    expect(birdForShot(2, 2)).toBe('bird');
    expect(birdForShot(2, 1)).toBe('ball');
  });

  it('tier 3 opens with the fire bird and closes with the ball', () => {
    expect(birdForShot(3, 2)).toBe('birdFire');
    expect(birdForShot(3, 1)).toBe('ball');
  });

  it('tier 4 opens fire, then ball, then plain bird', () => {
    expect(birdForShot(4, 3)).toBe('birdFire');
    expect(birdForShot(4, 2)).toBe('ball');
    expect(birdForShot(4, 1)).toBe('bird');
  });

  it('falls back to the plain bird for unknown inputs', () => {
    expect(birdForShot(9, 1)).toBe('bird');
    expect(birdForShot(2, 0)).toBe('ball');
  });
});
