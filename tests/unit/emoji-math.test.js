import { describe, it, expect } from 'vitest';
import { equationTypeFor, makeQuestion, FRUITS } from '$lib/emoji-math/game.js';

describe('age → equation type', () => {
  it('maps age bands per spec', () => {
    expect(equationTypeFor(2)).toBe('count');
    expect(equationTypeFor(3)).toBe('count');
    expect(equationTypeFor(4)).toBe('add');
    expect(equationTypeFor(5)).toBe('mixed');
  });
});

describe('makeQuestion', () => {
  it('count questions: single group of 1–5', () => {
    for (let s = 1; s <= 30; s++) {
      const q = makeQuestion(2, s * 7);
      expect(q.type).toBe('count');
      expect(q.groups.length).toBe(1);
      expect(q.groups[0]).toBeGreaterThanOrEqual(1);
      expect(q.groups[0]).toBeLessThanOrEqual(5);
    }
  });

  it('age-4 additions stay ≤ 10; age-5 additions stay ≤ 20', () => {
    for (let s = 1; s <= 40; s++) {
      const q4 = makeQuestion(4, s);
      if (q4.type === 'add') expect(q4.answer).toBeLessThanOrEqual(10);
      const q5 = makeQuestion(5, s);
      if (q5.type === 'add') expect(q5.answer).toBeLessThanOrEqual(20);
    }
  });

  it('comparison always has a clear winner', () => {
    for (let s = 1; s <= 40; s++) {
      const q = makeQuestion(6, s);
      if (q.type === 'compare') {
        expect(q.groups[0]).not.toBe(q.groups[1]);
        expect(q.answer).toBe(Math.max(...q.groups));
      }
    }
  });

  it('always offers exactly 4 unique numeric options containing the answer', () => {
    for (const age of [2, 3, 4, 5, 6]) {
      for (let s = 1; s <= 25; s++) {
        const q = makeQuestion(age, s * 3 + age);
        expect(q.options.length).toBe(4);
        expect(new Set(q.options).size).toBe(4);
        expect(q.options).toContain(String(q.answer));
        for (const o of q.options) expect(Number(o)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('uses a fruit emoji from the pool', () => {
    for (let s = 1; s <= 10; s++) expect(FRUITS).toContain(makeQuestion(3, s).emoji);
  });

  it('is deterministic per seed', () => {
    expect(makeQuestion(4, 777)).toEqual(makeQuestion(4, 777));
  });
});
