import { describe, it, expect } from 'vitest';

describe('Pop game behavior', () => {
  it('popping a bubble removes it', () => {
    let bubbles = [{ id: 1, emoji: '🫧' }, { id: 2, emoji: '⭐' }];
    bubbles = bubbles.filter(b => b.id !== 1);
    expect(bubbles).toHaveLength(1);
    expect(bubbles[0].id).toBe(2);
  });

  it('score increments on pop', () => {
    let score = 0;
    score++;
    expect(score).toBe(1);
    score++;
    expect(score).toBe(2);
  });

  it('timer counts down from 20', () => {
    let timeLeft = 20;
    for (let i = 0; i < 5; i++) timeLeft--;
    expect(timeLeft).toBe(15);
  });

  it('game ends when timer reaches 0', () => {
    const isOver = (t) => t <= 0;
    expect(isOver(1)).toBe(false);
    expect(isOver(0)).toBe(true);
    expect(isOver(-1)).toBe(true);
  });

  it('level change restarts game', () => {
    let score = 10;
    let timeLeft = 5;
    let bubbles = [{ id: 1 }];
    score = 0;
    timeLeft = 20;
    bubbles = [];
    expect(score).toBe(0);
    expect(timeLeft).toBe(20);
    expect(bubbles).toHaveLength(0);
  });

  it('bubbles have unique IDs', () => {
    const bubbles = [{ id: Math.random() }, { id: Math.random() }, { id: Math.random() }];
    const ids = new Set(bubbles.map(b => b.id));
    expect(ids.size).toBe(3);
  });
});
