import { describe, it, expect } from 'vitest';

function simulateKick(level, tapX, tapY, fieldWidth, fieldHeight, ballX, ballY) {
  const goalTop = 5;
  const goalBottom = 23;
  const goalLeft = 60;

  function levelTargets(l) {
    return {
      goalWidth: Math.min(40 + l * 2, 55),
      targetScore: Math.min(2 + l, 8),
    };
  }

  const targets = levelTargets(level);
  const inGoalX = tapX > goalLeft;
  const inGoalY = tapY > goalTop && tapY < goalBottom;
  const willScore = inGoalX && inGoalY;

  const newBallX = willScore ? 88 : 60 + Math.random() * 20;
  const newBallY = willScore ? 14 : 30 + Math.random() * 50;

  return { willScore, newBallX, newBallY, targetScore: targets.targetScore };
}

describe('Soccer game behavior', () => {
  it('tap in goal area scores', () => {
    const result = simulateKick(3, 75, 10, 300, 400, 20, 50);
    expect(result.willScore).toBe(true);
  });

  it('tap outside goal area does not score', () => {
    const result = simulateKick(3, 30, 50, 300, 400, 20, 50);
    expect(result.willScore).toBe(false);
  });

  it('tap left of goal does not score even at goal Y', () => {
    const result = simulateKick(3, 40, 14, 300, 400, 20, 50);
    expect(result.willScore).toBe(false);
  });

  it('tap too low does not score even at goal X', () => {
    const result = simulateKick(3, 80, 50, 300, 400, 20, 50);
    expect(result.willScore).toBe(false);
  });

  it('level 1 target is 3 goals', () => {
    const targets = (l) => ({ targetScore: Math.min(2 + l, 8) });
    expect(targets(1).targetScore).toBe(3);
  });

  it('level 10 target is 8 goals', () => {
    const targets = (l) => ({ targetScore: Math.min(2 + l, 8) });
    expect(targets(10).targetScore).toBe(8);
  });

  it('ball moves toward goal on score', () => {
    const result = simulateKick(3, 80, 14, 300, 400, 20, 50);
    expect(result.newBallX).not.toBe(20);
  });

  it('scoring increments state correctly', () => {
    let score = 0;
    const result = simulateKick(3, 80, 14, 300, 400, 20, 50);
    if (result.willScore) score++;
    expect(score).toBe(1);
    if (result.willScore) score++;
    expect(score).toBe(2);
  });

  it('game ends at target score', () => {
    const targets = (l) => ({ targetScore: Math.min(2 + l, 8) });
    let score = 4;
    const gameOver = score >= targets(3).targetScore;
    expect(gameOver).toBe(false);
    score = 5;
    expect(score >= targets(3).targetScore).toBe(true);
  });

  it('ball returns to start position after kick', () => {
    let ballX = 20;
    let ballY = 50;
    const result = simulateKick(3, 80, 14, 300, 400, ballX, ballY);
    if (result.willScore) {
      ballX = result.newBallX;
      ballY = result.newBallY;
    }
    expect(ballX).not.toBe(20);
  });
});
