// Jigsaw puzzle image definitions
// Each image is a 2D array of emoji that form the "picture"

export const PUZZLE_IMAGES = [
  {
    id: 'garden',
    name: 'Garden',
    category: 'nature',
    icon: '🌸',
    grid: [
      ['🌸','🌻','🌺','🦋'],
      ['🌿','🌷','🌹','🐝'],
      ['🍀','🌼','🌞','🐞'],
      ['🌳','🌵','🍄','🐜'],
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'nature',
    icon: '🐠',
    grid: [
      ['🐠','🐙','🦀','🐡'],
      ['🌊','🐳','🐬','🪸'],
      ['🐟','🐋','🦈','🐚'],
      ['🐠','🐡','🐙','🌊'],
    ],
  },
  {
    id: 'space',
    name: 'Space',
    category: 'adventure',
    icon: '🚀',
    grid: [
      ['🚀','🛸','🌍','🌙'],
      ['⭐','🌌','☄️','🪐'],
      ['👨‍🚀','🛰️','🌠','🔭'],
      ['🌟','💫','🌕','✨'],
    ],
  },
  {
    id: 'farm',
    name: 'Farm',
    category: 'nature',
    icon: '🐄',
    grid: [
      ['🐄','🐑','🐖','🐓'],
      ['🌾','🚜','🌽','🥕'],
      ['🐕','🐈','🐇','🐎'],
      ['🌻','🍎','🌿','🏡'],
    ],
  },
  {
    id: 'jungle',
    name: 'Jungle',
    category: 'adventure',
    icon: '🦁',
    grid: [
      ['🦁','🐘','🦒','🐆'],
      ['🐒','🦜','🐍','🦩'],
      ['🌴','🌿','🍌','🥥'],
      ['🐊','🦎','🐸','🌺'],
    ],
  },
  {
    id: 'food',
    name: 'Food',
    category: 'food',
    icon: '🍕',
    grid: [
      ['🍕','🍔','🌭','🧁'],
      ['🍟','🥗','🍣','🍩'],
      ['🍝','🥩','🧀','🍰'],
      ['🌮','🥟','🍦','🍪'],
    ],
  },
  {
    id: 'pets',
    name: 'Pets',
    category: 'animals',
    icon: '🐱',
    grid: [
      ['🐱','🐶','🐰','🐹'],
      ['🐭','🐼','🐨','🦊'],
      ['🐸','🐵','🐻','🐯'],
      ['🦝','🐮','🐷','🐧'],
    ],
  },
  {
    id: 'robots',
    name: 'Robots',
    category: 'adventure',
    icon: '🤖',
    grid: [
      ['🤖','👾','🦾','🦿'],
      ['⚡','🔧','⚙️','💾'],
      ['📡','🛠️','🔩','💻'],
      ['🔋','🔄','🤖','⚡'],
    ],
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
