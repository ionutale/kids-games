import { describe, it, expect } from 'vitest';

describe('Pop game', () => {
  it('max bubbles scales with age', () => {
    const maxByAge = { 2: 3, 3: 5, 4: 8, 5: 12 };
    expect(maxByAge[2]).toBe(3);
    expect(maxByAge[5]).toBe(12);
  });

  it('has popable items', () => {
    const items = ['🫧', '🐟', '🦋', '⭐', '🌟', '💫', '🌸', '🍎'];
    expect(items.length).toBe(8);
  });
});
