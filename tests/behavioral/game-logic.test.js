import { describe, it, expect } from 'vitest';

function initMemory(emojis, ageLevel) {
  const pairs = ageLevel <= 2 ? 3 : ageLevel === 3 ? 4 : ageLevel === 4 ? 6 : 8;
  const selected = emojis.slice(0, pairs);
  const deck = [...selected, ...selected].map((emoji, i) => ({ id: i, emoji, flipped: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return { deck, pairs };
}

function matchCards(deck, cardA, cardB) {
  if (cardA.id === cardB.id) return { match: false, done: false };
  if (cardA.emoji === cardB.emoji) {
    return { match: true, done: false };
  }
  return { match: false, done: false };
}

function initPuzzle(ageLevel) {
  const count = ageLevel <= 2 ? 2 : ageLevel <= 3 ? 4 : ageLevel <= 4 ? 6 : 8;
  return { count, cols: count <= 2 ? 2 : count <= 4 ? 2 : 3 };
}

function placePiece(pieces, id) {
  const piece = pieces.find(p => p.id === id);
  if (!piece || piece.placed) return pieces;

  if (piece.row === piece.correctRow && piece.col === piece.correctCol) {
    return pieces.map(p => p.id === id ? { ...p, placed: true } : p);
  }

  const neighbor = pieces.find(p =>
    p.row === piece.correctRow && p.col === piece.correctCol && !p.placed && p.id !== id
  );
  if (neighbor) {
    let result = pieces.map(p => {
      if (p.id === id) return { ...p, row: neighbor.row, col: neighbor.col };
      if (p.id === neighbor.id) return { ...neighbor, row: piece.row, col: piece.col };
      return p;
    });
    const moved = result.find(p => p.id === id);
    if (moved.row === moved.correctRow && moved.col === moved.correctCol) {
      result = result.map(p => p.id === id ? { ...p, placed: true } : p);
    }
    return result;
  }
  return pieces;
}

function initSorting(numItems, numBaskets) {
  const items = [];
  for (let i = 0; i < numItems; i++) {
    items.push({ id: i, cat: i % numBaskets });
  }
  return { items, baskets: numBaskets };
}

function sortItem(items, sorted, itemId, basketIdx) {
  const item = items.find(i => i.id === itemId);
  if (!item) return { sorted, correct: false, won: false };
  if (item.cat === basketIdx) {
    const next = new Set(sorted);
    next.add(itemId);
    return { sorted: next, correct: true, won: next.size === items.length };
  }
  return { sorted, correct: false, won: false };
}

describe('Memory game logic', () => {
  const emojis = ['🐶', '🐱', '🐰', '🐻', '🐸', '🐵', '🦊', '🐯', '🐭', '🐼', '🐨', '🦁'];

  it('creates pairs based on age level', () => {
    const { deck, pairs } = initMemory(emojis, 2);
    expect(pairs).toBe(3);
    expect(deck.length).toBe(6);
  });

  it('creates 8 pairs for age 5', () => {
    const { deck, pairs } = initMemory(emojis, 5);
    expect(pairs).toBe(8);
    expect(deck.length).toBe(16);
  });

  it('deck has exactly 2 of each emoji', () => {
    const { deck, pairs } = initMemory(emojis, 3);
    for (let i = 0; i < pairs; i++) {
      const count = deck.filter(c => c.emoji === emojis[i]).length;
      expect(count).toBe(2);
    }
  });

  it('matching cards returns match: true', () => {
    const { deck } = initMemory(emojis, 2);
    const first = deck[0];
    const pair = deck.find(c => c.emoji === first.emoji && c.id !== first.id);
    const result = matchCards(deck, first, pair);
    expect(result.match).toBe(true);
  });

  it('non-matching cards returns match: false', () => {
    const deck = [
      { id: 0, emoji: '🐶', flipped: false },
      { id: 1, emoji: '🐱', flipped: false },
    ];
    const result = matchCards(deck, deck[0], deck[1]);
    expect(result.match).toBe(false);
  });

  it('same card returns match: false', () => {
    const { deck } = initMemory(emojis, 2);
    const result = matchCards(deck, deck[0], deck[0]);
    expect(result.match).toBe(false);
  });
});

describe('Puzzle game logic', () => {
  it('creates 2 pieces for age 2', () => {
    const { count, cols } = initPuzzle(2);
    expect(count).toBe(2);
    expect(cols).toBe(2);
  });

  it('creates 8 pieces for age 5', () => {
    const { count, cols } = initPuzzle(5);
    expect(count).toBe(8);
    expect(cols).toBe(3);
  });

  it('placing piece on correct spot marks it placed', () => {
    const pieces = [
      { id: 0, correctRow: 0, correctCol: 0, row: 0, col: 0, placed: false },
      { id: 1, correctRow: 1, correctCol: 1, row: 1, col: 1, placed: false }
    ];
    const result = placePiece(pieces, 0);
    expect(result[0].placed).toBe(true);
  });

  it('swaps and places when swapping corrects position', () => {
    const pieces = [
      { id: 0, correctRow: 0, correctCol: 0, row: 1, col: 1, placed: false },
      { id: 1, correctRow: 1, correctCol: 1, row: 0, col: 0, placed: false }
    ];
    const result = placePiece(pieces, 0);
    expect(result[0].row).toBe(0);
    expect(result[0].col).toBe(0);
    expect(result[0].placed).toBe(true);
    expect(result[1].row).toBe(1);
    expect(result[1].col).toBe(1);
    expect(result[1].placed).toBe(false);
  });

  it('already placed piece does not change', () => {
    const pieces = [
      { id: 0, correctRow: 0, correctCol: 0, row: 0, col: 0, placed: true },
    ];
    const result = placePiece(pieces, 0);
    expect(result[0].placed).toBe(true);
    expect(result.length).toBe(1);
  });
});

describe('Sorting game logic', () => {
  it('creates correct number of items', () => {
    const { items, baskets } = initSorting(4, 2);
    expect(items.length).toBe(4);
    expect(baskets).toBe(2);
  });

  it('each item has a category within basket range', () => {
    const { items, baskets } = initSorting(6, 4);
    items.forEach(item => {
      expect(item.cat).toBeGreaterThanOrEqual(0);
      expect(item.cat).toBeLessThan(baskets);
    });
  });

  it('sorting to correct basket adds to sorted set', () => {
    const { items } = initSorting(4, 2);
    const result = sortItem(items, new Set(), 0, items[0].cat);
    expect(result.correct).toBe(true);
    expect(result.sorted.has(0)).toBe(true);
  });

  it('sorting to wrong basket returns correct: false', () => {
    const { items } = initSorting(4, 2);
    const wrongBasket = items[0].cat === 0 ? 1 : 0;
    const result = sortItem(items, new Set(), 0, wrongBasket);
    expect(result.correct).toBe(false);
  });

  it('win condition when all items sorted', () => {
    const { items } = initSorting(2, 2);
    let sorted = new Set();
    sorted = sortItem(items, sorted, 0, items[0].cat).sorted;
    const result = sortItem(items, sorted, 1, items[1].cat);
    expect(result.won).toBe(true);
  });
});
