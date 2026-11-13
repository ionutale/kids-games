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
import FarmPage from './paper/FarmPage.svelte';
import SpacePage from './paper/SpacePage.svelte';
import JunglePage from './paper/JunglePage.svelte';
import ArcticPage from './paper/ArcticPage.svelte';
import CastlePage from './paper/CastlePage.svelte';
import VehiclesPage from './paper/VehiclesPage.svelte';
import PrincessesPage from './paper/PrincessesPage.svelte';
import SnowPage from './paper/SnowPage.svelte';
import OceanPage from './paper/OceanPage.svelte';
import RobotPage from './paper/RobotPage.svelte';
import {
  FARM_VIEWBOX,
  FARM_REGIONS,
  FARM_LINES,
  FARM_DOTS,
  FARM_SMILES
} from './paper/farm.js';
import {
  SPACE_VIEWBOX,
  SPACE_REGIONS,
  SPACE_LINES,
  SPACE_DOTS,
  SPACE_SMILES
} from './paper/space.js';
import {
  JUNGLE_VIEWBOX,
  JUNGLE_REGIONS,
  JUNGLE_LINES,
  JUNGLE_DOTS,
  JUNGLE_SMILES
} from './paper/jungle.js';
import {
  ARCTIC_VIEWBOX,
  ARCTIC_REGIONS,
  ARCTIC_LINES,
  ARCTIC_DOTS,
  ARCTIC_SMILES
} from './paper/arctic.js';
import {
  CASTLE_VIEWBOX,
  CASTLE_REGIONS,
  CASTLE_LINES,
  CASTLE_DOTS,
  CASTLE_SMILES
} from './paper/castle.js';
import {
  VEHICLES_VIEWBOX,
  VEHICLES_REGIONS,
  VEHICLES_LINES,
  VEHICLES_DOTS,
  VEHICLES_SMILES
} from './paper/vehicles.js';
import {
  PRINCESSES_VIEWBOX,
  PRINCESSES_REGIONS,
  PRINCESSES_LINES,
  PRINCESSES_DOTS,
  PRINCESSES_SMILES
} from './paper/princesses.js';
import {
  SNOW_VIEWBOX,
  SNOW_REGIONS,
  SNOW_LINES,
  SNOW_DOTS,
  SNOW_SMILES
} from './paper/snow.js';
import {
  OCEAN_VIEWBOX,
  OCEAN_REGIONS,
  OCEAN_LINES,
  OCEAN_DOTS,
  OCEAN_SMILES
} from './paper/ocean.js';
import {
  ROBOT_VIEWBOX,
  ROBOT_REGIONS,
  ROBOT_LINES,
  ROBOT_DOTS,
  ROBOT_SMILES
} from './paper/robot.js';

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
  }),
  farm: Object.freeze({
    Page: FarmPage,
    viewbox: FARM_VIEWBOX,
    regions: FARM_REGIONS,
    lines: FARM_LINES,
    dots: FARM_DOTS,
    smiles: FARM_SMILES
  }),
  space: Object.freeze({
    Page: SpacePage,
    viewbox: SPACE_VIEWBOX,
    regions: SPACE_REGIONS,
    lines: SPACE_LINES,
    dots: SPACE_DOTS,
    smiles: SPACE_SMILES
  }),
  jungle: Object.freeze({
    Page: JunglePage,
    viewbox: JUNGLE_VIEWBOX,
    regions: JUNGLE_REGIONS,
    lines: JUNGLE_LINES,
    dots: JUNGLE_DOTS,
    smiles: JUNGLE_SMILES
  }),
  arctic: Object.freeze({
    Page: ArcticPage,
    viewbox: ARCTIC_VIEWBOX,
    regions: ARCTIC_REGIONS,
    lines: ARCTIC_LINES,
    dots: ARCTIC_DOTS,
    smiles: ARCTIC_SMILES
  }),
  castle: Object.freeze({
    Page: CastlePage,
    viewbox: CASTLE_VIEWBOX,
    regions: CASTLE_REGIONS,
    lines: CASTLE_LINES,
    dots: CASTLE_DOTS,
    smiles: CASTLE_SMILES
  }),
  vehicles: Object.freeze({
    Page: VehiclesPage,
    viewbox: VEHICLES_VIEWBOX,
    regions: VEHICLES_REGIONS,
    lines: VEHICLES_LINES,
    dots: VEHICLES_DOTS,
    smiles: VEHICLES_SMILES
  }),
  princesses: Object.freeze({
    Page: PrincessesPage,
    viewbox: PRINCESSES_VIEWBOX,
    regions: PRINCESSES_REGIONS,
    lines: PRINCESSES_LINES,
    dots: PRINCESSES_DOTS,
    smiles: PRINCESSES_SMILES
  }),
  snow: Object.freeze({
    Page: SnowPage,
    viewbox: SNOW_VIEWBOX,
    regions: SNOW_REGIONS,
    lines: SNOW_LINES,
    dots: SNOW_DOTS,
    smiles: SNOW_SMILES
  }),
  ocean: Object.freeze({
    Page: OceanPage,
    viewbox: OCEAN_VIEWBOX,
    regions: OCEAN_REGIONS,
    lines: OCEAN_LINES,
    dots: OCEAN_DOTS,
    smiles: OCEAN_SMILES
  }),
  robot: Object.freeze({
    Page: RobotPage,
    viewbox: ROBOT_VIEWBOX,
    regions: ROBOT_REGIONS,
    lines: ROBOT_LINES,
    dots: ROBOT_DOTS,
    smiles: ROBOT_SMILES
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
