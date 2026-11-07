// Cozy sorting content. Items are SVG art ids, not emoji, so the game renders
// the same on every platform and shape rounds can share one hue.

export const CATEGORIES = {
  colors: {
    baskets: ['red', 'yellow', 'blue', 'green'],
    items: [
      { art: 'apple', cat: 0 },
      { art: 'heart', cat: 0 },
      { art: 'sun', cat: 1 },
      { art: 'star', cat: 1 },
      { art: 'drop', cat: 2 },
      { art: 'ball', cat: 2 },
      { art: 'leaf', cat: 3 },
      { art: 'clover', cat: 3 }
    ]
  },
  shapes: {
    baskets: ['square', 'circle', 'triangle', 'diamond'],
    items: [
      { art: 'square-a', cat: 0 },
      { art: 'square-b', cat: 0 },
      { art: 'circle-a', cat: 1 },
      { art: 'circle-b', cat: 1 },
      { art: 'triangle-a', cat: 2 },
      { art: 'triangle-b', cat: 2 },
      { art: 'diamond-a', cat: 3 },
      { art: 'diamond-b', cat: 3 }
    ]
  }
};

export const SWATCHES = {
  red: '#E4572E',
  yellow: '#F2C14E',
  blue: '#4E9BD4',
  green: '#57A773'
};

// 24×24 viewBox paths, matched to the shape baskets.
export const SHAPE_PATHS = {
  square: 'M4 4h16v16H4z',
  circle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
  triangle: 'M12 2 23 21H1z',
  diamond: 'M12 1 23 12 12 23 1 12z'
};

export function signFor(category, basketKey) {
  if (category === 'colors') return { kind: 'swatch', value: SWATCHES[basketKey] };
  return { kind: 'shape', value: SHAPE_PATHS[basketKey] };
}

export function levelConfig(level) {
  return {
    numItems: Math.min(2 + level, 8),
    numBaskets: level <= 3 ? 2 : 4
  };
}

export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildRound(level, category = null) {
  const keys = Object.keys(CATEGORIES);
  const chosen = category && CATEGORIES[category]
    ? category
    : keys[Math.floor(Math.random() * keys.length)];
  const cat = CATEGORIES[chosen];
  const { numItems, numBaskets } = levelConfig(level);
  const baskets = cat.baskets.slice(0, numBaskets);
  const eligible = cat.items.filter((item) => item.cat < numBaskets);
  const picked = shuffle(eligible).slice(0, Math.min(numItems, eligible.length));
  return {
    category: chosen,
    baskets,
    items: picked.map((item, uid) => ({ ...item, uid }))
  };
}
