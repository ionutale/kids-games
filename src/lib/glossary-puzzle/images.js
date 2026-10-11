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
  // Pexels (free license) #5513326 — https://www.pexels.com/photo/5513326/
  {
    id: 'butterfly',
    name: 'Butterfly',
    category: 'nature',
    icon: '🦋',
    file: '/puzzles/butterfly.jpg',
    thumbEmoji: '🦋',
  },
  // Pexels (free license) #6134011 — https://www.pexels.com/photo/6134011/
  {
    id: 'rainbow',
    name: 'Rainbow',
    category: 'nature',
    icon: '🌈',
    file: '/puzzles/rainbow.jpg',
    thumbEmoji: '🌈',
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
  // Pexels (free license) #6978242 — https://www.pexels.com/photo/6978242/
  {
    id: 'fruits',
    name: 'Fruits',
    category: 'food',
    icon: '🍓',
    file: '/puzzles/fruits.jpg',
    thumbEmoji: '🍓',
  },
  // Pexels (free license) #11128671 — https://www.pexels.com/photo/11128671/
  {
    id: 'cupcakes',
    name: 'Cupcakes',
    category: 'food',
    icon: '🧁',
    file: '/puzzles/cupcakes.jpg',
    thumbEmoji: '🧁',
  },
  {
    id: 'pets',
    name: 'Pets',
    category: 'animals',
    icon: '🐱',
    file: '/puzzles/07-pets.jpg',
    thumbEmoji: '🐶',
  },
  // Pexels (free license) #8014537 — https://www.pexels.com/photo/8014537/
  {
    id: 'dinosaurs',
    name: 'Dinosaurs',
    category: 'animals',
    icon: '🦖',
    file: '/puzzles/dinosaurs.jpg',
    thumbEmoji: '🦖',
  },
  // Pexels (free license) #144608 — https://www.pexels.com/photo/144608/
  {
    id: 'puppy',
    name: 'Puppy',
    category: 'animals',
    icon: '🐶',
    file: '/puzzles/puppy.jpg',
    thumbEmoji: '🐶',
  },
  // Pexels (free license) #6900232 — https://www.pexels.com/photo/6900232/
  {
    id: 'kitten',
    name: 'Kitten',
    category: 'animals',
    icon: '🐱',
    file: '/puzzles/kitten.jpg',
    thumbEmoji: '🐱',
  },
  // Pexels (free license) #13024199 — https://www.pexels.com/photo/13024199/
  {
    id: 'sea-turtle',
    name: 'Sea Turtle',
    category: 'animals',
    icon: '🐢',
    file: '/puzzles/sea-turtle.jpg',
    thumbEmoji: '🐢',
  },
  {
    id: 'transport',
    name: 'Transport',
    category: 'adventure',
    icon: '🚂',
    file: '/puzzles/08-transport.jpg',
    thumbEmoji: '🚂',
  },
  // Pexels (free license) #18015296 — https://www.pexels.com/photo/18015296/
  {
    id: 'rocket',
    name: 'Rocket',
    category: 'adventure',
    icon: '🚀',
    file: '/puzzles/rocket.jpg',
    thumbEmoji: '🚀',
  },
  // Pexels (free license) #23881493 — https://www.pexels.com/photo/23881493/
  {
    id: 'pirate-ship',
    name: 'Pirate Ship',
    category: 'adventure',
    icon: '🏴‍☠️',
    file: '/puzzles/pirate-ship.jpg',
    thumbEmoji: '🏴‍☠️',
  },
  // Vehicles — stock photos (Pexels, free license).
  // Pexels #12274597 — https://www.pexels.com/photo/12274597/
  {
    id: 'fire-truck',
    name: 'Fire Truck',
    category: 'vehicles',
    icon: '🚒',
    file: '/puzzles/fire-truck.jpg',
    thumbEmoji: '🚒',
  },
  // Pexels #30751525 — https://www.pexels.com/photo/30751525/
  {
    id: 'digger',
    name: 'Digger',
    category: 'vehicles',
    icon: '🚜',
    file: '/puzzles/digger.jpg',
    thumbEmoji: '🚜',
  },
  // Vehicles — original flat-style character illustrations authored for this
  // project (no third-party or branded characters).
  {
    id: 'vc-train',
    name: 'Train Buddy',
    category: 'vehicles',
    icon: '🚂',
    file: '/puzzles/characters/vc-train.svg',
    thumbEmoji: '🚂',
  },
  {
    id: 'vc-bus',
    name: 'Bus Buddy',
    category: 'vehicles',
    icon: '🚌',
    file: '/puzzles/characters/vc-bus.svg',
    thumbEmoji: '🚌',
  },
  {
    id: 'vc-monster-truck',
    name: 'Monster Truck',
    category: 'vehicles',
    icon: '🛻',
    file: '/puzzles/characters/vc-monster-truck.svg',
    thumbEmoji: '🛻',
  },
  {
    id: 'vc-fire-engine',
    name: 'Fire Engine',
    category: 'vehicles',
    icon: '🚒',
    file: '/puzzles/characters/vc-fire-engine.svg',
    thumbEmoji: '🚒',
  },
  {
    id: 'vc-digger',
    name: 'Digger Buddy',
    category: 'vehicles',
    icon: '🚜',
    file: '/puzzles/characters/vc-digger.svg',
    thumbEmoji: '🚜',
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
