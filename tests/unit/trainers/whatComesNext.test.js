import { describe, it, expect } from 'vitest';
import { patternTier, ladderFor, makePrompt, roundGoal } from '$lib/trainers/whatComesNext.js';
import { categoryOfEmoji, lookalikePartner } from '$lib/trainers/emojiSets.js';

describe('patternTier', () => {
  it('maps level bands', () => {
    expect(patternTier(1)).toBe(1);
    expect(patternTier(2)).toBe(1);
    expect(patternTier(3)).toBe(2);
    expect(patternTier(4)).toBe(2);
    expect(patternTier(5)).toBe(3);
    expect(patternTier(6)).toBe(3);
    expect(patternTier(7)).toBe(4);
    expect(patternTier(30)).toBe(4);
  });
});

describe('ladderFor — one distinct step per level', () => {
  it('gives levels 1–10 ten distinct steps', () => {
    const steps = [];
    for (let level = 1; level <= 10; level++) {
      const l = ladderFor(level);
      steps.push(`${l.unit ? l.unit.join('') : 'grow'}:${l.partial}:${l.blocks ?? ''}:${l.distractors}`);
    }
    expect(new Set(steps).size).toBe(10);
  });

  it('follows the pedagogical arc AB → AAB/AABB → ABC/AABC → growing', () => {
    expect(ladderFor(1).unit.join('')).toBe('AB');
    expect(ladderFor(2).unit.join('')).toBe('AB');
    expect(ladderFor(3).unit.join('')).toBe('AAB');
    expect(ladderFor(4).unit.join('')).toBe('AABB');
    expect(ladderFor(5).unit.join('')).toBe('ABC');
    expect(ladderFor(6).unit.join('')).toBe('AABC');
    expect(ladderFor(7).growing).toBe(true);
  });

  it('grows the partial unit within a family, then the block count, then caps', () => {
    expect(ladderFor(1).partial).toBe(0);
    expect(ladderFor(2).partial).toBe(1);
    expect(ladderFor(4).partial).toBe(1);
    expect(ladderFor(6).partial).toBe(1);
    expect([7, 8, 9, 10, 11, 30].map((n) => ladderFor(n).blocks)).toEqual([3, 4, 5, 6, 7, 7]);
  });

  it('raises distractor similarity with level', () => {
    expect(ladderFor(1).distractors).toBe('cross');
    expect(ladderFor(5).distractors).toBe('cross');
    expect(ladderFor(6).distractors).toBe('same');
    expect(ladderFor(8).distractors).toBe('same');
    expect(ladderFor(9).distractors).toBe('lookalike');
    expect(ladderFor(30).distractors).toBe('lookalike');
  });
});

describe('roundGoal', () => {
  it('grows then caps at 10', () => {
    expect(roundGoal(1)).toBe(5);
    expect(roundGoal(6)).toBe(10);
    expect(roundGoal(20)).toBe(10);
  });
});

function minimalPeriod(symbols) {
  for (let p = 1; p <= symbols.length; p++) {
    let ok = true;
    for (let i = 0; i < symbols.length; i++) {
      if (symbols[i] !== symbols[i % p]) {
        ok = false;
        break;
      }
    }
    if (ok) return p;
  }
  return symbols.length;
}

describe('makePrompt — property tests over levels and seeds', () => {
  it('prefix is periodic and the answer continues the pattern (L1–30)', () => {
    for (let level = 1; level <= 30; level++) {
      for (let s = 1; s <= 8; s++) {
        const p = makePrompt(level, s * 31 + level);
        expect(p.options.length).toBe(3);
        expect(new Set(p.options).size).toBe(3);
        expect(p.options).toContain(p.answer);
        expect(p.correctIndex).toBe(p.options.indexOf(p.answer));

        if (p.tier <= 3) {
          const per = minimalPeriod(p.symbols);
          // strip shows ≥ 2 full repetitions
          expect(p.symbols.length).toBeGreaterThanOrEqual(per * 2);
          // answer continues the periodic pattern
          expect(p.answer).toBe(p.symbols[p.symbols.length % per]);
        } else {
          // growing: [A×1][B][A×2][B][A×3][B]… answer = A
          const A = p.symbols[0];
          const B = p.symbols[1];
          expect(B).not.toBe(A);
          let i = 0;
          for (let k = 1; i < p.symbols.length; k++) {
            for (let j = 0; j < k && i < p.symbols.length; j++, i++) {
              expect(p.symbols[i]).toBe(A);
            }
            if (i < p.symbols.length) {
              expect(p.symbols[i]).toBe(B);
              i++;
            }
          }
          expect(p.symbols.length).toBeGreaterThanOrEqual(9); // ≥ 3 complete blocks
          expect(p.answer).toBe(A);
        }
      }
    }
  });

  it('low levels draw wrong options from outside all pattern categories', () => {
    for (let level = 1; level <= 5; level++) {
      for (let s = 1; s <= 15; s++) {
        const p = makePrompt(level, s * 17 + level);
        const usedCats = new Set(
          [...p.symbols, p.answer].map(categoryOfEmoji).filter(Boolean)
        );
        for (const o of p.options) {
          if (o === p.answer) continue;
          const cat = categoryOfEmoji(o);
          if (cat) expect(usedCats.has(cat)).toBe(false);
        }
      }
    }
  });

  it('mid levels (6–8) draw wrong options from the answer’s own category', () => {
    for (let level = 6; level <= 8; level++) {
      for (let s = 1; s <= 15; s++) {
        const p = makePrompt(level, s * 19 + level);
        const answerCat = categoryOfEmoji(p.answer);
        expect(answerCat).toBeTruthy();
        for (const o of p.options) {
          if (o === p.answer) continue;
          expect(categoryOfEmoji(o)).toBe(answerCat);
        }
      }
    }
  });

  it('high levels (9+) use lookalike partners when the answer has one', () => {
    let checked = 0;
    for (let s = 1; s <= 300; s++) {
      const p = makePrompt(9, s);
      const partner = lookalikePartner(p.answer);
      if (!partner) continue;
      checked++;
      expect(p.options).toContain(partner);
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('strip length is deterministic per level and grows along the ladder', () => {
    expect(makePrompt(1, 42).symbols.length).toBe(4); // ABAB
    expect(makePrompt(2, 42).symbols.length).toBe(5); // ABABA
    expect(makePrompt(3, 42).symbols.length).toBe(6); // AAB AAB
    expect(makePrompt(4, 42).symbols.length).toBe(9); // AABB AABB A
    expect(makePrompt(5, 42).symbols.length).toBe(6); // ABC ABC
    expect(makePrompt(6, 42).symbols.length).toBe(9); // AABC AABC A
    expect(makePrompt(7, 42).symbols.length).toBe(9); // k = 1..3
    expect(makePrompt(8, 42).symbols.length).toBe(14); // k = 1..4
  });

  it('is deterministic per seed', () => {
    expect(makePrompt(8, 555)).toEqual(makePrompt(8, 555));
  });
});
