import { describe, it, expect } from 'vitest';
import { patternTier, makePrompt, roundGoal } from '$lib/trainers/whatComesNext.js';
import { categoryOfEmoji } from '$lib/trainers/emojiSets.js';

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

  it('is deterministic per seed', () => {
    expect(makePrompt(8, 555)).toEqual(makePrompt(8, 555));
  });
});
