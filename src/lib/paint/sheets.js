// Paper catalog. The sheet decides the mode: blank is free painting, every
// coloring sheet carries named regions for the bucket and the clipped brush.
export const DEFAULT_SHEET_ID = 'blank';

export const SHEETS = Object.freeze([
  Object.freeze({
    id: 'blank',
    kind: 'free',
    titleKey: 'paintSheetBlank',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'dino-valley',
    kind: 'coloring',
    titleKey: 'paintSheetDinoValley',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'butterfly-garden',
    kind: 'coloring',
    titleKey: 'paintSheetButterflyGarden',
    ages: Object.freeze([3, 4, 5])
  }),
  Object.freeze({
    id: 'under-the-sea',
    kind: 'coloring',
    titleKey: 'paintSheetUnderTheSea',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'farm',
    kind: 'coloring',
    titleKey: 'paintSheetFarm',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'space',
    kind: 'coloring',
    titleKey: 'paintSheetSpace',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'jungle',
    kind: 'coloring',
    titleKey: 'paintSheetJungle',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'arctic',
    kind: 'coloring',
    titleKey: 'paintSheetArctic',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'castle',
    kind: 'coloring',
    titleKey: 'paintSheetCastle',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'vehicles',
    kind: 'coloring',
    titleKey: 'paintSheetVehicles',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'princesses',
    kind: 'coloring',
    titleKey: 'paintSheetPrincesses',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'snow',
    kind: 'coloring',
    titleKey: 'paintSheetSnow',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'ocean',
    kind: 'coloring',
    titleKey: 'paintSheetOcean',
    ages: Object.freeze([2, 3, 4, 5])
  }),
  Object.freeze({
    id: 'robot',
    kind: 'coloring',
    titleKey: 'paintSheetRobot',
    ages: Object.freeze([2, 3, 4, 5])
  })
]);

export const SHEET_BY_ID = Object.freeze(
  Object.fromEntries(SHEETS.map((sheet) => [sheet.id, sheet]))
);

// Age 2 keeps the biggest shapes and drops Butterfly Garden until the art can
// be simplified for the youngest hands. Every added sheet is age-2 friendly.
export const AGE2_SHEETS = Object.freeze(
  SHEETS.filter((sheet) => sheet.ages.includes(2))
);

function isYoung(ageLevel) {
  return Number.isFinite(ageLevel) && ageLevel <= 2;
}

export function getSheets(ageLevel) {
  return isYoung(ageLevel) ? AGE2_SHEETS : SHEETS;
}

export function getSheet(id) {
  return typeof id === 'string' && Object.hasOwn(SHEET_BY_ID, id)
    ? SHEET_BY_ID[id]
    : null;
}
