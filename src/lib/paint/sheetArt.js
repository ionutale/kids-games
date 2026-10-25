// UI-only sheet-art registry. The sheet catalog (`sheets.js`) owns ids, titles
// and age availability; this module binds each coloring sheet to its rendered
// line art and its closed, back-to-front region list. The studio uses the same
// entries for the layer stack, hit-testing, stroke clipping and save validation,
// so no sheet-specific art is hardcoded in the page.
import DinoValleyPage from './paper/DinoValleyPage.svelte';
import ButterflyGardenPage from './paper/ButterflyGardenPage.svelte';
import UnderTheSeaPage from './paper/UnderTheSeaPage.svelte';
import {
  DINO_VALLEY_REGIONS,
  DINO_VALLEY_LINES,
  DINO_VALLEY_DOTS,
  DINO_VALLEY_SMILES,
  DINO_VALLEY_VIEWBOX
} from './paper/dinoValley.js';
import {
  BUTTERFLY_GARDEN_REGIONS,
  BUTTERFLY_GARDEN_LINES,
  BUTTERFLY_GARDEN_DOTS,
  BUTTERFLY_GARDEN_SMILES,
  BUTTERFLY_GARDEN_VIEWBOX
} from './paper/butterflyGarden.js';
import {
  UNDER_THE_SEA_REGIONS,
  UNDER_THE_SEA_LINES,
  UNDER_THE_SEA_DOTS,
  UNDER_THE_SEA_SMILES,
  UNDER_THE_SEA_VIEWBOX
} from './paper/underTheSea.js';

// Blank paper has no entry: it is one free-paint plane, not a coloring sheet.
export const SHEET_ART = Object.freeze({
  'dino-valley': Object.freeze({
    Page: DinoValleyPage,
    viewbox: DINO_VALLEY_VIEWBOX,
    regions: DINO_VALLEY_REGIONS,
    lines: DINO_VALLEY_LINES,
    dots: DINO_VALLEY_DOTS,
    smiles: DINO_VALLEY_SMILES
  }),
  'butterfly-garden': Object.freeze({
    Page: ButterflyGardenPage,
    viewbox: BUTTERFLY_GARDEN_VIEWBOX,
    regions: BUTTERFLY_GARDEN_REGIONS,
    lines: BUTTERFLY_GARDEN_LINES,
    dots: BUTTERFLY_GARDEN_DOTS,
    smiles: BUTTERFLY_GARDEN_SMILES
  }),
  'under-the-sea': Object.freeze({
    Page: UnderTheSeaPage,
    viewbox: UNDER_THE_SEA_VIEWBOX,
    regions: UNDER_THE_SEA_REGIONS,
    lines: UNDER_THE_SEA_LINES,
    dots: UNDER_THE_SEA_DOTS,
    smiles: UNDER_THE_SEA_SMILES
  })
});

export function getSheetArt(sheetId) {
  return typeof sheetId === 'string' && Object.hasOwn(SHEET_ART, sheetId)
    ? SHEET_ART[sheetId]
    : null;
}

/** Region ids for every coloring sheet, keyed by sheet id. */
export const SHEET_REGION_IDS = Object.freeze(
  Object.fromEntries(
    Object.entries(SHEET_ART).map(([sheetId, art]) => [
      sheetId,
      Object.freeze(art.regions.map((region) => region.id))
    ])
  )
);
