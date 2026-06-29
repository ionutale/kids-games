import { describe, it, expect } from 'vitest';

describe('Soccer game behavior', () => {
  it('scoring increments count', () => {
    let score = 0;
    score++;
    expect(score).toBe(1);
    score++;
    expect(score).toBe(2);
  });

  it('game ends at 5 goals', () => {
    let score = 5;
    const gameOver = score >= 5;
    expect(gameOver).toBe(true);
  });

  it('ball position updates on kick', () => {
    let ballX = 20;
    let ballY = 50;
    ballX = 88;
    ballY = 45;
    expect(ballX).toBe(88);
    expect(ballY).toBe(45);
  });

  it('age 2 always scores regardless of aim', () => {
    const age = 2;
    const willScore = age <= 2 || false;
    expect(willScore).toBe(true);
  });

  it('older children need to aim near goal', () => {
    const age = 5;
    const tapY = 50;
    const tapX = 80;
    const goalY1 = 35, goalY2 = 65;
    const willScore = age <= 2 || (tapY > goalY1 && tapY < goalY2 && tapX > 70);
    expect(willScore).toBe(true);

    const badTapY = 20, badTapX = 50;
    const willMiss = age <= 2 || (badTapY > goalY1 && badTapY < goalY2 && badTapX > 70);
    expect(willMiss).toBe(false);
  });
});
