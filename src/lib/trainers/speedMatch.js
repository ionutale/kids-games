import { makeRng, pickOne } from './rng.js';
import { CATEGORIES, categoryOfEmoji, lookalikePartner } from './emojiSets.js';

export function bandFor(level) {
  const n = Math.max(1, level);
  if (n <= 4) return 'cross';
  if (n <= 7) return 'same';
  return 'lookalike';
}

export function levelConfig(level) {
  const n = Math.max(1, level);
  return {
    deckSize: 8 + Math.min(n, 12),
    windowMs: Math.max(1500, 4000 - 100 * n)
  };
}

function differentEmoji(a, band, rng) {
  if (band === 'lookalike') {
    const partner = lookalikePartner(a);
    if (partner && partner !== a) return partner;
  }
  const catA = categoryOfEmoji(a);
  if (band === 'cross' || !catA) {
    const otherCats = Object.keys(CATEGORIES).filter((c) => c !== catA);
    return pickOne(CATEGORIES[pickOne(otherCats, rng)], rng);
  }
  // same-category different emoji
  let guard = 0;
  while (guard++ < 100) {
    const e = pickOne(CATEGORIES[catA], rng);
    if (e !== a) return e;
  }
  return pickOne(Object.values(CATEGORIES).flat().filter((e) => e !== a), rng);
}

export function makeDeck(level, seed = Date.now()) {
  const rng = makeRng(seed);
  const config = levelConfig(level);
  const band = bandFor(level);
  const allEmojis = Object.values(CATEGORIES).flat();

  const deck = [];
  let run = 0;
  let prevSame = null;
  for (let i = 0; i < config.deckSize; i++) {
    let same = rng() < 0.5;
    if (prevSame === same && run >= 3) same = !same; // cap identical-answer streaks at 3
    let card;
    if (same) {
      const e = pickOne(allEmojis, rng);
      card = { a: e, b: e, same: true };
    } else {
      const a = pickOne(allEmojis, rng);
      card = { a, b: differentEmoji(a, band, rng), same: false };
    }
    deck.push(card);
    run = card.same === prevSame ? run + 1 : 1;
    prevSame = card.same;
  }
  return deck;
}
