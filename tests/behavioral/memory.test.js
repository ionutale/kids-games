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

function isMatch(a, b) {
  if (a.id === b.id) return false;
  return a.emoji === b.emoji;
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

  it('two cards with same emoji are a match', () => {
    const deck = initDeck(emojis, 2);
    const a = deck.find(c => c.emoji === deck[0].emoji && c.id !== deck[0].id);
    expect(isMatch(deck[0], a)).toBe(true);
  });

  it('same card is not a match', () => {
    const deck = initDeck(emojis, 2);
    expect(isMatch(deck[0], deck[0])).toBe(false);
  });

  it('different emojis are not a match', () => {
    const deck = initDeck(emojis, 2);
    const different = deck.find(c => c.emoji !== deck[0].emoji);
    expect(isMatch(deck[0], different)).toBe(false);
  });
});
