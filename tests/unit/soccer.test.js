import { describe, it, expect } from 'vitest';
import {
  BALL_START,
  goalBounds,
  keeperCenter,
  keeperHalfWidth,
  openAim,
  shotResult,
  starsFor,
  targetScoreFor
} from '$lib/soccer/engine.js';

describe('Soccer levels', () => {
  it('asks for more goals as the level rises, capped at 8', () => {
    expect(targetScoreFor(1)).toBe(3);
    expect(targetScoreFor(5)).toBe(7);
    expect(targetScoreFor(10)).toBe(8);
    expect(targetScoreFor(1)).toBeLessThan(targetScoreFor(5));
  });

  it('shrinks the goal at higher levels', () => {
    const easy = goalBounds(1);
    const hard = goalBounds(10);
    expect(easy.x1 - easy.x0).toBeGreaterThan(hard.x1 - hard.x0);
    expect(hard.x1 - hard.x0).toBeGreaterThanOrEqual(10);
  });
});

describe('Soccer keeper', () => {
  it('stays inside the goal and always leaves a gap', () => {
    for (let level = 1; level <= 10; level++) {
      const goal = goalBounds(level);
      const half = keeperHalfWidth(level);
      for (let t = 0; t <= 20; t += 0.25) {
        const x = keeperCenter(level, t);
        expect(x - half).toBeGreaterThanOrEqual(goal.x0 - 0.01);
        expect(x + half).toBeLessThanOrEqual(goal.x1 + 0.01);
        const aim = openAim(level, x);
        expect(shotResult(BALL_START, aim, level, x)).toBe('goal');
      }
    }
  });

  it('saves a shot aimed at his gloves', () => {
    const x = keeperCenter(1, 0);
    expect(shotResult(BALL_START, { x, y: 13 }, 1, x)).toBe('save');
  });
});

describe('Soccer shots', () => {
  it('misses a swipe that never reaches the goal', () => {
    expect(shotResult(BALL_START, { x: 50, y: 90 }, 1, 50)).toBe('miss');
    expect(shotResult(BALL_START, { x: 51, y: 81 }, 1, 50)).toBe('miss');
  });

  it('misses a shot that flies wide of the posts', () => {
    expect(shotResult(BALL_START, { x: 5, y: 10 }, 1, 50)).toBe('miss');
  });

  it('counts a shot that flies through the mouth even if the finger lifts above the bar', () => {
    const keeperX = keeperCenter(3, 1.2);
    const aim = openAim(3, keeperX);
    expect(shotResult(BALL_START, { x: aim.x, y: -4 }, 3, keeperX)).toBe('goal');
  });
});

describe('Soccer stars', () => {
  it('gives three stars for a clean round and drops as shots are wasted', () => {
    expect(starsFor(0)).toBe(3);
    expect(starsFor(2)).toBe(2);
    expect(starsFor(3)).toBe(1);
  });
});
