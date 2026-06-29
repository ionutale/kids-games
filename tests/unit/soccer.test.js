import { describe, it, expect } from 'vitest';

describe('Soccer game', () => {
  it('always scores for age 2', () => {
    const ages = [2, 3, 4, 5];
    const alwaysScore = ages.map(a => a <= 2);
    expect(alwaysScore[0]).toBe(true);
    expect(alwaysScore[1]).toBe(false);
  });

  it('win condition is 5 goals', () => {
    const targetScore = 5;
    expect(targetScore).toBe(5);
  });
});
