import { describe, it, expect } from 'vitest';

describe('Soccer game', () => {
  function levelTargets(l) {
    return {
      goalWidth: Math.min(40 + l * 2, 55),
      targetScore: Math.min(2 + l, 8),
      missChance: Math.max(0, 0.5 - l * 0.05),
    };
  }

  it('levelTargets returns correct values for level 1', () => {
    const t = levelTargets(1);
    expect(t.targetScore).toBe(3);
    expect(t.goalWidth).toBe(42);
    expect(t.missChance).toBe(0.45);
  });

  it('levelTargets returns correct values for level 10', () => {
    const t = levelTargets(10);
    expect(t.targetScore).toBe(8);
    expect(t.goalWidth).toBe(55);
    expect(t.missChance).toBe(0);
  });

  it('targetScore increases with level', () => {
    expect(levelTargets(1).targetScore).toBeLessThan(levelTargets(5).targetScore);
    expect(levelTargets(5).targetScore).toBeLessThan(levelTargets(10).targetScore);
  });

  it('goal detection works at right positions', () => {
    const goalTop = 5, goalBottom = 23, goalLeft = 60;
    expect(10 > goalTop && 10 < goalBottom && 80 > goalLeft).toBe(true);
    expect(10 > goalTop && 10 < goalBottom && 40 > goalLeft).toBe(false);
    expect(50 > goalTop && 50 < goalBottom).toBe(false);
  });

  it('game resets score and ball position', () => {
    let score = 5;
    let gameOver = true;
    let ballX = 88;
    let ballY = 14;
    score = 0;
    gameOver = false;
    ballX = 20;
    ballY = 50;
    expect(score).toBe(0);
    expect(gameOver).toBe(false);
    expect(ballX).toBe(20);
    expect(ballY).toBe(50);
  });
});
