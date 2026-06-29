import { describe, it, expect } from 'vitest';

function initDeck(emojis, pairs) {
  const selected = emojis.slice(0, pairs);
  const deck = [...selected, ...selected].map((emoji, i) => ({ id: i, emoji, flipped: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function flipCard(deck, flipped, matched, showcasing, locked, cardId) {
  if (locked || flipped.includes(cardId)) return { flipped, matched, showcasing, locked };
  if (showcasing.has(cardId)) return { flipped, matched, showcasing, locked };

  const newFlipped = [...flipped, cardId];
  const card = deck.find(c => c.id === cardId);
  card.flipped = true;

  if (newFlipped.length === 2) {
    const [aId, bId] = newFlipped;
    const a = deck.find(c => c.id === aId);
    const b = deck.find(c => c.id === bId);

    if (a.emoji === b.emoji) {
      const newShowcasing = new Set(showcasing);
      newShowcasing.add(aId);
      newShowcasing.add(bId);
      return { flipped: [], matched, showcasing: newShowcasing, locked: true };
    } else {
      return { flipped: newFlipped, matched, showcasing, locked: true };
    }
  }

  return { flipped: newFlipped, matched, showcasing, locked: false };
}

function resolveShowcase(matched, showcasing) {
  const newMatched = new Set(matched);
  showcasing.forEach(id => newMatched.add(id));
  return { matched: newMatched, showcasing: new Set(), locked: false };
}

function resolveMismatch(deck, flipped) {
  const [aId, bId] = flipped;
  deck.forEach(c => {
    if (c.id === aId || c.id === bId) c.flipped = false;
  });
  return { flipped: [], locked: false };
}

describe('Memory game behavior', () => {
  const emojis = ['🐶', '🐱', '🐰', '🐻', '🐸', '🐵', '🦊', '🐯'];

  it('deck has even number of cards', () => {
    const deck = initDeck(emojis, 4);
    expect(deck.length % 2).toBe(0);
  });

  it('each emoji appears exactly twice', () => {
    const deck = initDeck(emojis, 3);
    const counts = {};
    deck.forEach(c => { counts[c.emoji] = (counts[c.emoji] || 0) + 1; });
    Object.values(counts).forEach(count => expect(count).toBe(2));
  });

  it('two matching cards enter showcase phase instead of immediate match', () => {
    const deck = initDeck(emojis, 3);
    const a = deck[0];
    const b = deck.find(c => c.emoji === a.emoji && c.id !== a.id);

    const empty = new Set();
    const r1 = flipCard(deck, [], empty, empty, false, a.id);
    const r2 = flipCard(deck, r1.flipped, r1.matched, r1.showcasing, r1.locked, b.id);

    expect(r2.matched.size).toBe(0);
    expect(r2.showcasing.has(a.id)).toBe(true);
    expect(r2.showcasing.has(b.id)).toBe(true);
    expect(r2.locked).toBe(true);
    expect(r2.flipped).toEqual([]);
  });

  it('showcase resolves to matched after delay', () => {
    const deck = initDeck(emojis, 3);
    const a = deck[0];
    const b = deck.find(c => c.emoji === a.emoji && c.id !== a.id);

    const showcasing = new Set([a.id, b.id]);
    const resolved = resolveShowcase(new Set(), showcasing);

    expect(resolved.matched.has(a.id)).toBe(true);
    expect(resolved.matched.has(b.id)).toBe(true);
    expect(resolved.showcasing.size).toBe(0);
    expect(resolved.locked).toBe(false);
  });

  it('two non-matching cards are locked after flipping', () => {
    const deck = initDeck(emojis, 3);
    const a = deck[0];
    const b = deck.find(c => c.emoji !== a.emoji);
    const empty = new Set();

    const r1 = flipCard(deck, [], empty, empty, false, a.id);
    const r2 = flipCard(deck, r1.flipped, r1.matched, r1.showcasing, r1.locked, b.id);
    expect(r2.locked).toBe(true);
    expect(r2.matched.size).toBe(0);
    expect(r2.showcasing.size).toBe(0);
  });

  it('non-matching cards flip back after resolve', () => {
    const deck = initDeck(emojis, 3);
    const a = deck[0];
    const b = deck.find(c => c.emoji !== a.emoji);
    const empty = new Set();

    const r1 = flipCard(deck, [], empty, empty, false, a.id);
    a.flipped = true;
    const r2 = flipCard(deck, r1.flipped, r1.matched, r1.showcasing, r1.locked, b.id);
    b.flipped = true;

    const resolved = resolveMismatch(deck, r2.flipped);
    expect(a.flipped).toBe(false);
    expect(b.flipped).toBe(false);
    expect(resolved.flipped).toEqual([]);
    expect(resolved.locked).toBe(false);
  });

  it('locking prevents flipping a third card while two are open', () => {
    const deck = initDeck(emojis, 3);
    const a = deck[0];
    const b = deck.find(c => c.emoji !== a.emoji);
    const c = deck.find(c => c.id !== a.id && c.id !== b.id);
    const empty = new Set();

    const r1 = flipCard(deck, [], empty, empty, false, a.id);
    const r2 = flipCard(deck, r1.flipped, r1.matched, r1.showcasing, r1.locked, b.id);
    expect(r2.locked).toBe(true);

    const r3 = flipCard(deck, r2.flipped, r2.matched, r2.showcasing, r2.locked, c.id);
    expect(r3.flipped).toEqual(r2.flipped);
  });

  it('locking prevents flipping cards during showcase phase', () => {
    const deck = initDeck(emojis, 3);
    const a = deck[0];
    const b = deck.find(c => c.emoji === a.emoji && c.id !== a.id);
    const c = deck.find(c => c.id !== a.id && c.id !== b.id);
    const empty = new Set();

    const r1 = flipCard(deck, [], empty, empty, false, a.id);
    const r2 = flipCard(deck, r1.flipped, r1.matched, r1.showcasing, r1.locked, b.id);
    expect(r2.locked).toBe(true);

    const r3 = flipCard(deck, r2.flipped, r2.matched, r2.showcasing, r2.locked, c.id);
    expect(r3.flipped).toEqual([]);
    expect(r3.matched.size).toBe(0);
  });
});
