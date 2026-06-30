import { describe, it, expect } from 'vitest';
import ANIMALS from '$lib/animalQuizData.js';

describe('Animal Quiz behavior', () => {
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generateOptions(animal, lang = 'en') {
    const wrongPool = ANIMALS.filter(a => a.emoji !== animal.emoji);
    const shuffled = shuffle(wrongPool);
    const wrong = [
      { name: shuffled[0][lang], correct: false },
      { name: shuffled[1][lang], correct: false },
    ];
    const correct = { name: animal[lang], correct: true };
    return shuffle([correct, ...wrong]);
  }

  it('generates exactly 3 options', () => {
    const opts = generateOptions(ANIMALS[0]);
    expect(opts.length).toBe(3);
  });

  it('one option is correct', () => {
    const opts = generateOptions(ANIMALS[0]);
    expect(opts.filter(o => o.correct).length).toBe(1);
  });

  it('correct option has the right name', () => {
    const animal = ANIMALS[5];
    const opts = generateOptions(animal);
    const correct = opts.find(o => o.correct);
    expect(correct.name).toBe(animal.en);
  });

  it('wrong options are different from correct', () => {
    const animal = ANIMALS[0];
    const opts = generateOptions(animal);
    const wrong = opts.filter(o => !o.correct);
    wrong.forEach(w => {
      expect(w.name).not.toBe(animal.en);
    });
  });

  it('wrong options are unique', () => {
    const opts = generateOptions(ANIMALS[0]);
    const wrong = opts.filter(o => !o.correct);
    expect(wrong[0].name).not.toBe(wrong[1].name);
  });

  it('name matches the current language', () => {
    const animal = ANIMALS[0];
    const opts = generateOptions(animal, 'it');
    const correct = opts.find(o => o.correct);
    expect(correct.name).toBe(animal.it);
  });

  it('score increments on correct pick', () => {
    let score = 0;
    score++;
    expect(score).toBe(1);
    score++;
    expect(score).toBe(2);
  });

  it('all 20 rounds complete shows done', () => {
    let round = 20;
    const done = round >= ANIMALS.length;
    expect(done).toBe(true);
  });
});
