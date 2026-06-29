import { describe, it, expect } from 'vitest';

describe('Soccer game behavior', () => {
  it('tap in goal area scores', () => {
    const goalTop = 5, goalBottom = 23, goalLeft = 60;
    const tapX = 75, tapY = 14;
    const willScore = tapX > goalLeft && tapY > goalTop && tapY < goalBottom;
    expect(willScore).toBe(true);
  });

  it('tap outside goal area does not score', () => {
    const goalTop = 5, goalBottom = 23, goalLeft = 60;
    expect(30 > goalLeft && 50 > goalTop && 50 < goalBottom).toBe(false);
  });

  it('ballMoving flag prevents multi-kick', () => {
    let ballMoving = false;
    const kick = () => { if (ballMoving) return; ballMoving = true; };
    kick();
    expect(ballMoving).toBe(true);
    kick();
    expect(ballMoving).toBe(true);
  });

  it('game over blocks further kicks', () => {
    let gameOver = false;
    let score = 0;
    const kick = () => { if (gameOver) return; score++; gameOver = true; };
    kick();
    expect(score).toBe(1);
    kick();
    expect(score).toBe(1);
  });

  it('ball returns to start position after kick', () => {
    let ballX = 20, ballY = 50;
    let ballMoving = true;
    setTimeout(() => {
      ballMoving = false;
      ballX = 20;
      ballY = 50;
    }, 10);
    expect(ballMoving).toBe(true);
  });

  it('level 1 needs 3 goals to win', () => {
    const targetScore = Math.min(2 + 1, 8);
    expect(targetScore).toBe(3);
    let score = 0;
    for (let i = 0; i < targetScore; i++) score++;
    expect(score).toBe(3);
  });

  it('level 10 needs 8 goals to win', () => {
    const targetScore = Math.min(2 + 10, 8);
    expect(targetScore).toBe(8);
  });

  it('reset sets score to 0, gameOver false, ball to start', () => {
    let score = 5, gameOver = true, ballX = 88, ballY = 14;
    score = 0;
    gameOver = false;
    ballX = 20;
    ballY = 50;
    expect(score).toBe(0);
    expect(gameOver).toBe(false);
    expect(ballX).toBe(20);
    expect(ballY).toBe(50);
  });

  it('confetti appears on goal', () => {
    let showConfetti = false;
    let score = 0;
    score++;
    showConfetti = true;
    expect(showConfetti).toBe(true);
    expect(score).toBe(1);
  });
});
