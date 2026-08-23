import { describe, it, expect } from 'vitest';
import { levelConfig, makeDeck, bandFor } from '$lib/trainers/speedMatch.js';
import { categoryOfEmoji, LOOKALIKES } from '$lib/trainers/emojiSets.js';

describe('bandFor', () => {
  it('maps levels to trickiness bands', () => {
    expect(bandFor(1)).toBe('cross');
    expect(bandFor(4)).toBe('cross');
    expect(bandFor(5)).toBe('same');
    expect(bandFor(7)).toBe('same');
    expect(bandFor(8)).toBe('lookalike');
  });
});

describe('levelConfig', () => {
  it('matches spec formulas', () => {
    const c = levelConfig(1);
    expect(c.deckSize).toBe(9);
    expect(c.windowMs).toBe(3900);
    const c10 = levelConfig(10);
    expect(c10.deckSize).toBe(18);
    expect(c10.windowMs).toBe(3000);
    const c30 = levelConfig(30);
    expect(c30.deckSize).toBe(20); // capped
    expect(c30.windowMs).toBe(1500); // floored
  });
});

describe('makeDeck', () => {
  it('produces exactly deckSize cards, each valid', () => {
    const deck = makeDeck(1, 11);
    expect(deck.length).toBe(levelConfig(1).deckSize);
    for (const card of deck) {
      expect(typeof card.same).toBe('boolean');
      expect(card.a.length).toBeGreaterThan(0);
      if (card.same) {
        expect(card.b).toBe(card.a);
      } else {
        expect(card.b).not.toBe(card.a);
      }
    }
  });

  it('mixes same and different answers across the deck', () => {
    for (let s = 1; s <= 15; s++) {
      const deck = makeDeck(2, s);
      const sames = deck.filter((c) => c.same).length;
      expect(sames).toBeGreaterThan(0);
      expect(sames).toBeLessThan(deck.length);
    }
  });

  it('never exceeds 3 consecutive identical answers', () => {
    for (let level = 1; level <= 12; level++) {
      for (let s = 1; s <= 20; s++) {
        const deck = makeDeck(level, s);
        let run = 0;
        let prev = null;
        for (const card of deck) {
          run = card.same === prev ? run + 1 : 1;
          prev = card.same;
          expect(run).toBeLessThanOrEqual(3);
        }
      }
    }
  });

  it('cross band different-pairs come from different categories', () => {
    for (let level = 1; level <= 4; level++) {
      for (let s = 1; s <= 15; s++) {
        for (const card of makeDeck(level, s)) {
          if (!card.same) {
            const ca = categoryOfEmoji(card.a);
            const cb = categoryOfEmoji(card.b);
            expect(ca).toBeTruthy();
            expect(cb).toBeTruthy();
            expect(ca).not.toBe(cb);
          }
        }
      }
    }
  });

  it('lookalike band uses lookalike partners for some different-pairs', () => {
    const partners = new Set(LOOKALIKES.flat());
    let lookalikePairs = 0;
    let differentPairs = 0;
    for (let s = 1; s <= 25; s++) {
      for (const card of makeDeck(9, s)) {
        if (!card.same) {
          differentPairs++;
          if (partners.has(card.a) && partners.has(card.b)) lookalikePairs++;
        }
      }
    }
    expect(differentPairs).toBeGreaterThan(0);
    expect(lookalikePairs).toBeGreaterThan(0);
  });

  it('is deterministic per seed', () => {
    expect(makeDeck(3, 77)).toEqual(makeDeck(3, 77));
  });
});
