import { describe, it, expect } from 'vitest';
import ANIMALS from '$lib/animalQuizData.js';

describe('Animal Quiz data', () => {
  it('has exactly 20 animals', () => {
    expect(ANIMALS.length).toBe(20);
  });

  it('each animal has emoji, en, it, ro', () => {
    ANIMALS.forEach(a => {
      expect(a.emoji).toBeTruthy();
      expect(a.en).toBeTruthy();
      expect(a.it).toBeTruthy();
      expect(a.ro).toBeTruthy();
    });
  });

  it('all emoji are unique', () => {
    const emojis = ANIMALS.map(a => a.emoji);
    expect(new Set(emojis).size).toBe(20);
  });
});
