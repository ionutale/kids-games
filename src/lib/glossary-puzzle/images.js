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

export function getCategories() {
  const cats = {};
  PUZZLE_IMAGES.forEach(img => {
    if (!cats[img.category]) cats[img.category] = { icon: img.icon, name: img.category, images: [] };
    cats[img.category].images.push(img);
  });
  return Object.entries(cats).map(([key, val]) => ({ key, ...val }));
}

export const DIFFICULTIES = {
  easy: { label: 'Easy', cols: 2, rows: 2, snapRadius: 35 },
  medium: { label: 'Medium', cols: 3, rows: 3, snapRadius: 25 },
  hard: { label: 'Hard', cols: 4, rows: 4, snapRadius: 18 },
};
