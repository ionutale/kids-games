export const WORLD = Object.freeze({
  id: 'dino-valley',
  nameKey: 'stickerWorldDinoValley'
});

// Full catalog: 24 stickers in a 6/6/6/6 mix (dinos, camp/props, nature/sky, vehicles).
// The age-2 palette stays a separate explicit eight (see YOUNG_SHELF).
// Keys use the singular `sticker` prefix because `stickers` is the game title.
export const STICKERS = Object.freeze([
  { type: 'trex', labelKey: 'stickerTrex', group: 'dino', size: 92 },
  { type: 'triceratops', labelKey: 'stickerTriceratops', group: 'dino', size: 88 },
  { type: 'stegosaurus', labelKey: 'stickerStegosaurus', group: 'dino', size: 92 },
  { type: 'brachiosaurus', labelKey: 'stickerBrachiosaurus', group: 'dino', size: 96 },
  { type: 'pteranodon', labelKey: 'stickerPteranodon', group: 'dino', size: 84 },
  { type: 'ankylosaurus', labelKey: 'stickerAnkylosaurus', group: 'dino', size: 92 },
  { type: 'tent', labelKey: 'stickerTent', group: 'camp', size: 88 },
  { type: 'campfire', labelKey: 'stickerCampfire', group: 'camp', size: 80 },
  { type: 'jeep', labelKey: 'stickerJeep', group: 'camp', size: 88 },
  { type: 'camper', labelKey: 'stickerCamper', group: 'camp', size: 92 },
  { type: 'log-bench', labelKey: 'stickerLogBench', group: 'camp', size: 84 },
  { type: 'signpost', labelKey: 'stickerSignpost', group: 'camp', size: 76 },
  { type: 'fern', labelKey: 'stickerFern', group: 'nature', size: 76 },
  { type: 'pine', labelKey: 'stickerPine', group: 'nature', size: 88 },
  { type: 'boulder', labelKey: 'stickerBoulder', group: 'nature', size: 80 },
  { type: 'egg', labelKey: 'stickerEgg', group: 'nature', size: 72 },
  { type: 'sun', labelKey: 'stickerSun', group: 'nature', size: 76 },
  { type: 'cloud', labelKey: 'stickerCloud', group: 'nature', size: 84 },
  { type: 'fire-truck', labelKey: 'stickerFireTruck', group: 'vehicle', size: 92 },
  { type: 'police-car', labelKey: 'stickerPoliceCar', group: 'vehicle', size: 84 },
  { type: 'ambulance', labelKey: 'stickerAmbulance', group: 'vehicle', size: 88 },
  { type: 'bulldozer', labelKey: 'stickerBulldozer', group: 'vehicle', size: 92 },
  { type: 'excavator', labelKey: 'stickerExcavator', group: 'vehicle', size: 94 },
  { type: 'dump-truck', labelKey: 'stickerDumpTruck', group: 'vehicle', size: 96 }
].map((sticker) => Object.freeze(sticker)));

export const STICKER_BY_TYPE = Object.freeze(
  Object.fromEntries(STICKERS.map((sticker) => [sticker.type, sticker]))
);

export const STANDARD_SHELF = Object.freeze(STICKERS.map((sticker) => sticker.type));

// Keep this explicit: the 3-5 shelf is the full 24, while the age-2 palette
// stays these eight (4 dinos / 2 camp / 2 nature). Do not derive it from STICKERS.
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
