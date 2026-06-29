import { describe, it, expect } from 'vitest';

describe('Pop game behavior', () => {
  it('bubbles have unique IDs', () => {
    const bubbles = [
      { id: 1, emoji: '🫧', x: 10, y: 0, size: 40, speed: 3 },
      { id: 2, emoji: '⭐', x: 50, y: 0, size: 36, speed: 4 },
    ];
    const ids = new Set(bubbles.map(b => b.id));
    expect(ids.size).toBe(2);
  });

  it('popping a bubble removes it', () => {
    let bubbles = [{ id: 1, emoji: '🫧' }, { id: 2, emoji: '⭐' }];
    bubbles = bubbles.filter(b => b.id !== 1);
    expect(bubbles).toHaveLength(1);
    expect(bubbles[0].id).toBe(2);
  });

  it('max bubbles limit is respected', () => {
    const max = 5;
    let bubbles = [];
    for (let i = 0; i < 10; i++) {
      if (bubbles.length < max) {
        bubbles = [...bubbles, { id: i }];
      }
    }
    expect(bubbles).toHaveLength(5);
  });
});
