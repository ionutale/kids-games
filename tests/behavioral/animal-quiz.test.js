import { describe, it, expect } from 'vitest';
import { TOPICS } from '$lib/quiz/topics.js';
import { buildOptions } from '$lib/quiz/round.js';

const ANIMALS = TOPICS.animals.items;

describe('Animal Quiz behavior', () => {
  it('generates exactly 3 options', () => {
    expect(buildOptions(ANIMALS[0], ANIMALS, 'en').length).toBe(3);
  });

  it('one option is correct', () => {
    const opts = buildOptions(ANIMALS[0], ANIMALS, 'en');
    expect(opts.filter((o) => o.correct).length).toBe(1);
  });

  it('correct option has the right name', () => {
    const animal = ANIMALS[5];
    const correct = buildOptions(animal, ANIMALS, 'en').find((o) => o.correct);
    expect(correct.name).toBe(animal.en);
  });

  it('wrong options are different from the correct one', () => {
    const animal = ANIMALS[0];
    for (const w of buildOptions(animal, ANIMALS, 'en').filter((o) => !o.correct)) {
      expect(w.name).not.toBe(animal.en);
    }
  });

  it('wrong options are unique', () => {
    const wrong = buildOptions(ANIMALS[0], ANIMALS, 'en').filter((o) => !o.correct);
    expect(wrong[0].name).not.toBe(wrong[1].name);
  });

  it('name matches the current language', () => {
    const animal = ANIMALS[0];
    const correct = buildOptions(animal, ANIMALS, 'it').find((o) => o.correct);
    expect(correct.name).toBe(animal.it);
  });
});
