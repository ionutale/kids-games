import { describe, it, expect } from 'vitest';
import { buildOptions } from '$lib/quiz/round.js';
import { TOPICS } from '$lib/quiz/topics.js';

const items = TOPICS.animals.items;

describe('buildOptions', () => {
  it('returns exactly three options with one correct', () => {
    const opts = buildOptions(items[0], items, 'en');
    expect(opts.length).toBe(3);
    expect(opts.filter((o) => o.correct).length).toBe(1);
  });

  it('the correct option uses the requested locale', () => {
    const item = items[5];
    for (const lang of ['en', 'it', 'ro', 'de', 'fr', 'zh']) {
      const correct = buildOptions(item, items, lang).find((o) => o.correct);
      expect(correct.name).toBe(item[lang]);
    }
  });

  it('wrong options are unique names from other items', () => {
    const item = items[0];
    const opts = buildOptions(item, items, 'en');
    const wrong = opts.filter((o) => !o.correct);
    expect(wrong[0].name).not.toBe(wrong[1].name);
    for (const w of wrong) expect(w.name).not.toBe(item.en);
  });

  it('is deterministic with an injected rng', () => {
    let s1 = 7;
    const rngA = () => ((s1 = (s1 * 9301 + 49297) % 233280) / 233280);
    let s2 = 7;
    const rngB = () => ((s2 = (s2 * 9301 + 49297) % 233280) / 233280);
    expect(buildOptions(items[2], items, 'it', rngA)).toEqual(buildOptions(items[2], items, 'it', rngB));
  });

  it('handles a two-item pool without crashing', () => {
    const pool = [items[0], items[1]];
    const opts = buildOptions(pool[0], pool, 'en');
    expect(opts.length).toBeGreaterThanOrEqual(2);
    expect(opts.length).toBeLessThanOrEqual(3);
    expect(new Set(opts.map((o) => o.name)).size).toBe(opts.length);
    expect(opts.filter((o) => o.correct).length).toBe(1);
  });
});
