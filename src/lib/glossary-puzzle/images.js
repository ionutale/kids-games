// Puzzle image definitions using downloaded CC0 images
// Images from Pixabay / Unsplash (CC0 / Public Domain)

export const PUZZLE_IMAGES = [
  {
    id: 'garden',
    name: 'Garden',
    category: 'nature',
    icon: '🌸',
    file: '/puzzles/01-garden.jpg',
    thumbEmoji: '🌸',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'nature',
    icon: '🐠',
    file: '/puzzles/02-ocean.jpg',
    thumbEmoji: '🌊',
  },
  {
    id: 'space',
    name: 'Space',
    category: 'adventure',
    icon: '🚀',
    file: '/puzzles/03-space.jpg',
    thumbEmoji: '🚀',
  },
  {
    id: 'farm',
    name: 'Farm',
    category: 'nature',
    icon: '🐄',
    file: '/puzzles/04-farm.jpg',
    thumbEmoji: '🌾',
  },
  {
    id: 'jungle',
    name: 'Jungle',
    category: 'adventure',
    icon: '🦁',
    file: '/puzzles/05-jungle.jpg',
    thumbEmoji: '🌴',
  },
  {
    id: 'food',
    name: 'Food',
    category: 'food',
    icon: '🍕',
    file: '/puzzles/06-food.jpg',
    thumbEmoji: '🍎',
  },
  {
    id: 'pets',
    name: 'Pets',
    category: 'animals',
    icon: '🐱',
    file: '/puzzles/07-pets.jpg',
    thumbEmoji: '🐶',
  },
  {
    id: 'transport',
    name: 'Transport',
    category: 'adventure',
    icon: '🚂',
    file: '/puzzles/08-transport.jpg',
    thumbEmoji: '🚂',
  },
];

const CATEGORY_META = {
  nature: { icon: '🌿' },
  adventure: { icon: '🧭' },
  food: { icon: '🍎' },
  animals: { icon: '🐾' },
};

export function getCategories() {
  const cats = {};
  PUZZLE_IMAGES.forEach(img => {
    if (!cats[img.category]) {
      const meta = CATEGORY_META[img.category] || { icon: img.icon };
      cats[img.category] = {
        icon: meta.icon,
        name: img.category.charAt(0).toUpperCase() + img.category.slice(1),
        images: [],
      };
    }
    cats[img.category].images.push(img);
  });
  return Object.entries(cats).map(([key, val]) => ({ key, ...val }));
}

// Level = difficulty step (unbounded): grid grows and snap tightens with N.
// L1 2×2 · L2 3×2 · L3 3×3 · L4 4×3 · L5 4×4 · L6 5×4 · L7 5×5 · L8 6×5 · L9 6×6 · L10 7×6 …
export function levelConfig(n) {
  const level = Math.max(1, Math.floor(n) || 1);
  const cols = 2 + Math.floor(level / 2);
  const rows = 2 + Math.floor((level - 1) / 2);
  const snapRadius = Math.max(14, Math.round(44 - level * 2));
  return { level, cols, rows, snapRadius };
}
