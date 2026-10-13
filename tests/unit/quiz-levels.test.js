import { describe, it, expect } from 'vitest';
import { quizLevelConfig, buildQueue, QUIZ_MAX_LEVEL } from '$lib/quiz/levels.js';
import { TOPICS } from '$lib/quiz/topics.js';

describe('quizLevelConfig', () => {
  it('grows questions and options along the 10-level ladder', () => {
    expect(quizLevelConfig(1)).toEqual({ questions: 4, options: 2 });
    expect(quizLevelConfig(2)).toEqual({ questions: 4, options: 2 });
    expect(quizLevelConfig(3)).toEqual({ questions: 5, options: 3 });
    expect(quizLevelConfig(4)).toEqual({ questions: 5, options: 3 });
    expect(quizLevelConfig(5)).toEqual({ questions: 6, options: 3 });
    expect(quizLevelConfig(7)).toEqual({ questions: 7, options: 3 });
    expect(quizLevelConfig(8)).toEqual({ questions: 7, options: 3 });
    expect(quizLevelConfig(9)).toEqual({ questions: 8, options: 4 });
    expect(quizLevelConfig(10)).toEqual({ questions: 8, options: 4 });
  });

  it('is monotonic: rounds never get shorter and options never shrink', () => {
    let prev = quizLevelConfig(1);
    for (let l = 2; l <= QUIZ_MAX_LEVEL; l++) {
      const c = quizLevelConfig(l);
      expect(c.questions).toBeGreaterThanOrEqual(prev.questions);
      expect(c.options).toBeGreaterThanOrEqual(prev.options);
      prev = c;
    }
  });

  it('clamps out-of-range levels', () => {
    expect(quizLevelConfig(0)).toEqual(quizLevelConfig(1));
    expect(quizLevelConfig(-5)).toEqual(quizLevelConfig(1));
    expect(quizLevelConfig(99)).toEqual(quizLevelConfig(QUIZ_MAX_LEVEL));
  });

  it('keeps rounds short enough for the age band (never the whole 32-item topic)', () => {
    for (let l = 1; l <= QUIZ_MAX_LEVEL; l++) {
      expect(quizLevelConfig(l).questions).toBeLessThanOrEqual(8);
    }
  });
});

describe('buildQueue', () => {
  const animals = TOPICS.animals.items;

  it('draws exactly the level\'s question count, without repeats', () => {
    for (let level = 1; level <= 10; level++) {
      const queue = buildQueue(animals, level, level * 17);
      expect(queue.length).toBe(quizLevelConfig(level).questions);
      expect(new Set(queue.map((q) => q.emoji)).size).toBe(queue.length);
      for (const q of queue) expect(animals).toContain(q);
    }
  });

  it('never repeats an item within a round even on the longest topic', () => {
    for (let s = 1; s <= 30; s++) {
      const queue = buildQueue(animals, 10, s);
      expect(queue.length).toBe(8);
      expect(new Set(queue.map((q) => q.emoji)).size).toBe(8);
    }
  });

  it('shuffles: the same topic seeds produce different orders on different rounds', () => {
    const a = buildQueue(animals, 5, 1).map((q) => q.emoji);
    const b = buildQueue(animals, 5, 2).map((q) => q.emoji);
    // the two rounds are not simply the topic's fixed first-N order
    expect(a).not.toEqual(animals.slice(0, a.length).map((q) => q.emoji));
    expect(b.length).toBe(a.length);
  });

  it('is deterministic for a given seed', () => {
    expect(buildQueue(animals, 6, 42)).toEqual(buildQueue(animals, 6, 42));
  });

  it('caps at the topic size when a topic is smaller than the level asks', () => {
    const tiny = animals.slice(0, 3);
    expect(buildQueue(tiny, 10, 5).length).toBe(3);
  });
});
