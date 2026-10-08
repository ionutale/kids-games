import { describe, it, expect } from 'vitest';
import {
  BALL_START,
  keeperCenter,
  openAim,
  shotResult,
  targetScoreFor
} from '$lib/soccer/engine.js';

describe('Soccer game behavior', () => {
  it('a shot into the open side of the goal scores', () => {
    const keeperX = keeperCenter(1, 0);
    const aim = openAim(1, keeperX);
    expect(shotResult(BALL_START, aim, 1, keeperX)).toBe('goal');
  });

  it('a shot into the keeper is a save, not a goal', () => {
    const keeperX = keeperCenter(4, 2);
    expect(shotResult(BALL_START, { x: keeperX, y: 12 }, 4, keeperX)).toBe('save');
  });

  it('a short swipe does not score', () => {
    expect(shotResult(BALL_START, { x: 50, y: 78 }, 1, keeperCenter(1, 0))).toBe('miss');
  });

  it('level 1 needs 3 goals and level 10 needs 8', () => {
    expect(targetScoreFor(1)).toBe(3);
    expect(targetScoreFor(10)).toBe(8);
  });

  it('the same open spot is a miss once the goal has shrunk past it', () => {
    const wide = openAim(1, 50);
    const hardKeeper = keeperCenter(10, 0);
    const atWideSpot = shotResult(BALL_START, wide, 10, hardKeeper);
    expect(['miss', 'save']).toContain(atWideSpot);
    expect(shotResult(BALL_START, openAim(10, hardKeeper), 10, hardKeeper)).toBe('goal');
  });
});
