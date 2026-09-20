import { describe, it, expect } from 'vitest';
import { LOCALES, TOPICS } from '$lib/quiz/topics.js';

const ANIMALS = TOPICS.animals.items;

describe('Animal Quiz data', () => {
  it('has at least 30 animals', () => {
    expect(ANIMALS.length).toBeGreaterThanOrEqual(30);
  });

  it('each animal has a name in every supported locale', () => {
    ANIMALS.forEach(a => {
      LOCALES.forEach(loc => {
        expect(a[loc], `${a.emoji} missing ${loc}`).toBeTruthy();
      });
    });
  });

  it('all emoji are unique', () => {
    const emojis = ANIMALS.map(a => a.emoji);
    expect(new Set(emojis).size).toBe(ANIMALS.length);
  });

  it('names are unique within each locale', () => {
    LOCALES.forEach(loc => {
      const names = ANIMALS.map(a => a[loc]);
      expect(new Set(names).size).toBe(ANIMALS.length);
    });
  });
});
