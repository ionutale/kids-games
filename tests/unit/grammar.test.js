import { describe, it, expect } from 'vitest';
import { LEVELS, exercisesFor, roundGoal } from '$lib/grammar/italian.js';

const TYPES = ['verb', 'article', 'plural', 'preposition', 'imperative', 'picture'];

describe('grammar level data', () => {
  it('has ten levels', () => {
    for (let level = 1; level <= 10; level++) {
      expect(Array.isArray(LEVELS[level]), `L${level}`).toBe(true);
    }
  });

  it('every level has at least 6 exercises', () => {
    for (let level = 1; level <= 10; level++) {
      expect(LEVELS[level].length, `L${level}`).toBeGreaterThanOrEqual(6);
    }
  });

  it('every exercise is well formed', () => {
    for (let level = 1; level <= 10; level++) {
      for (const ex of LEVELS[level]) {
        expect(TYPES, `L${level}`).toContain(ex.type);
        expect(ex.options.length, `${ex.prompt}${ex.emoji ?? ''}`).toBe(3);
        expect(new Set(ex.options).size, `${ex.prompt}${ex.emoji ?? ''}`).toBe(3);
        expect(ex.answer).toBeGreaterThanOrEqual(0);
        expect(ex.answer).toBeLessThan(3);
        if (ex.type === 'picture') {
          expect(ex.emoji, `L${level} picture`).toBeTruthy();
        } else {
          expect(ex.prompt, `L${level} ${ex.type}`).toContain('___');
        }
      }
    }
  });

  it('exercisesFor clamps to 1..10 and plateaus at L10', () => {
    expect(exercisesFor(0)).toBe(LEVELS[1]);
    expect(exercisesFor(5)).toBe(LEVELS[5]);
    expect(exercisesFor(11)).toBe(LEVELS[10]);
    expect(exercisesFor(30)).toBe(LEVELS[10]);
  });

  it('roundGoal grows then caps at 10', () => {
    expect(roundGoal(1)).toBe(5);
    expect(roundGoal(6)).toBe(10);
    expect(roundGoal(20)).toBe(10);
  });
});
