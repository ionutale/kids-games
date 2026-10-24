export const WORLD = Object.freeze({
  id: 'dino-valley',
  nameKey: 'stickerWorldDinoValley'
});

// Slice catalog: the 8 stickers that also make up the age-2 palette. The full
// age 3-5 shelf grows to 18 in the next slice; the young palette stays these 8.
// Keys use the singular `sticker` prefix because `stickers` is the game title.
export const STICKERS = Object.freeze([
  { type: 'trex', labelKey: 'stickerTrex', group: 'dino', size: 92 },
  { type: 'triceratops', labelKey: 'stickerTriceratops', group: 'dino', size: 88 },
  { type: 'stegosaurus', labelKey: 'stickerStegosaurus', group: 'dino', size: 92 },
  { type: 'pteranodon', labelKey: 'stickerPteranodon', group: 'dino', size: 84 },
  { type: 'tent', labelKey: 'stickerTent', group: 'camp', size: 88 },
  { type: 'campfire', labelKey: 'stickerCampfire', group: 'camp', size: 80 },
  { type: 'fern', labelKey: 'stickerFern', group: 'nature', size: 76 },
  { type: 'sun', labelKey: 'stickerSun', group: 'nature', size: 76 }
].map((sticker) => Object.freeze(sticker)));

export const STICKER_BY_TYPE = Object.freeze(
  Object.fromEntries(STICKERS.map((sticker) => [sticker.type, sticker]))
);

export const STANDARD_SHELF = Object.freeze(STICKERS.map((sticker) => sticker.type));

// Keep this explicit: the 3-5 shelf grows to 18, while the age-2 palette stays
// these eight (4 dinos / 2 camp / 2 nature).
export const YOUNG_SHELF = Object.freeze([
  'trex',
  'triceratops',
  'stegosaurus',
  'pteranodon',
  'tent',
  'campfire',
  'fern',
  'sun'
]);

export const SOFT_CAP = 80;
export const SHELF_BUTTON_SIZE = Object.freeze({ standard: 64, young: 72 });
export const PLACED_SIZE_SCALE = Object.freeze({ standard: 1, young: 1.2 });

export function getShelf(ageLevel) {
  return ageLevel <= 2 ? YOUNG_SHELF : STANDARD_SHELF;
}

export function getSticker(type) {
  return STICKER_BY_TYPE[type];
}

export function getShelfButtonSize(ageLevel) {
  return ageLevel <= 2 ? SHELF_BUTTON_SIZE.young : SHELF_BUTTON_SIZE.standard;
}

export function getPlacedSize(type, ageLevel) {
  const sticker = getSticker(type);
  if (!sticker) return 0;
  const scale = ageLevel <= 2 ? PLACED_SIZE_SCALE.young : PLACED_SIZE_SCALE.standard;
  return Math.round(sticker.size * scale);
}
