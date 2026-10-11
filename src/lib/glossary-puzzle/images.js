// Puzzle image definitions using downloaded CC0 images
// Images from Pixabay / Unsplash (CC0 / Public Domain)

import { getPhoto } from './photos.js';

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
  // Show-character promo images supplied by the project owner (personal use).
  {
    id: 'blippi',
    name: 'Blippi',
    category: 'shows',
    icon: '🧢',
    file: '/puzzles/09-blippi.jpg',
    thumbEmoji: '🧢',
  },
  {
    id: 'blippi-happy',
    name: 'Blippi Happy',
    category: 'shows',
    icon: '👍',
    file: '/puzzles/10-blippi-happy.jpg',
    thumbEmoji: '👍',
  },
];

// Category key → chip icon. `myPhotos` is user content (no builtins yet), so its
// icon is a literal. Keys double as the merge order in CATEGORY_ORDER below.
export const CATEGORY_META = {
  myPhotos: '⭐',
  nature: '🌿',
  adventure: '🧭',
  food: '🍎',
  animals: '🐾',
  vehicles: '🚌',
  shows: '🧢',
};

// Merge/display order: user photos first, then builtins by category. Unknown
// categories (not listed here) are appended last by buildImageList.
export const CATEGORY_ORDER = ['myPhotos', 'nature', 'animals', 'food', 'adventure', 'vehicles', 'shows'];

export function getCategories() {
  const cats = {};
  PUZZLE_IMAGES.forEach(img => {
    if (!cats[img.category]) {
      cats[img.category] = {
        icon: CATEGORY_META[img.category] || img.icon,
        name: img.category.charAt(0).toUpperCase() + img.category.slice(1),
        images: [],
      };
    }
    cats[img.category].images.push(img);
  });
  return Object.entries(cats).map(([key, val]) => ({ key, ...val }));
}

// A builtin entry already has `file` (a plain URL, no lifetime to manage), so its
// VM just reuses that URL as the thumb and tags itself for revokeVM to skip.
function builtinToVM(img) {
  return { ...img, thumb: img.file, source: 'builtin' };
}

// Single view model for both builtins and user photos: the gallery and the board
// never need to know which is which except through `source`.
export function buildImageList(builtins = PUZZLE_IMAGES, photoVMs = []) {
  const known = CATEGORY_ORDER.flatMap(cat =>
    builtins.filter(img => img.category === cat).map(builtinToVM)
  );
  const unknown = builtins
    .filter(img => !CATEGORY_ORDER.includes(img.category))
    .map(builtinToVM);
  return [...photoVMs, ...known, ...unknown];
}

export function photoToVM(record, t) {
  return {
    id: 'photo:' + record.id,
    name: t('photoName', { n: record.seq }),
    category: 'myPhotos',
    icon: '⭐',
    file: URL.createObjectURL(record.blob),
    thumb: URL.createObjectURL(record.thumb),
    source: 'photo',
  };
}

// Object URLs leak until explicitly revoked; builtin `file`s are static paths and
// must be left alone.
export function revokeVM(vm) {
  if (vm?.source !== 'photo') return;
  URL.revokeObjectURL(vm.file);
  URL.revokeObjectURL(vm.thumb);
}

// One entry point for both sources of puzzle art. A builtin id resolves to its
// VM immediately; a `photo:<uuid>` id is loaded from IndexedDB and mapped the
// same way the gallery does it, so the play page gets an identical VM shape.
// Anything else — including a since-deleted photo — resolves to null so callers
// can fall back to a rotation.
export async function resolveImage(id, t = (k) => k) {
  const builtin = PUZZLE_IMAGES.find(img => img.id === id);
  if (builtin) return builtinToVM(builtin);
  if (typeof id === 'string' && id.startsWith('photo:')) {
    const record = await getPhoto(id.slice('photo:'.length));
    return record ? photoToVM(record, t) : null;
  }
  return null;
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
