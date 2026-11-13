import { describe, it, expect } from 'vitest';
import {
  SHEETS,
  DEFAULT_SHEET_ID,
  getSheets,
  getSheet
} from '../../src/lib/paint/sheets.js';

const IDS = [
  'blank',
  'dino-valley',
  'butterfly-garden',
  'under-the-sea',
  'farm',
  'space',
  'jungle',
  'arctic',
  'castle',
  'vehicles',
  'princesses',
  'snow',
  'ocean',
  'robot'
];

const TITLE_KEYS = [
  'paintSheetBlank',
  'paintSheetDinoValley',
  'paintSheetButterflyGarden',
  'paintSheetUnderTheSea',
  'paintSheetFarm',
  'paintSheetSpace',
  'paintSheetJungle',
  'paintSheetArctic',
  'paintSheetCastle',
  'paintSheetVehicles',
  'paintSheetPrincesses',
  'paintSheetSnow',
  'paintSheetOcean',
  'paintSheetRobot'
];

const AGE2_IDS = IDS.filter((id) => id !== 'butterfly-garden');

describe('Paint sheets', () => {
  it('lists the fourteen sheets with unique ids', () => {
    expect(SHEETS.map((sheet) => sheet.id)).toEqual(IDS);
    expect(new Set(IDS).size).toBe(SHEETS.length);
  });

  it('marks blank as free and the pages as coloring', () => {
    expect(SHEETS.map((sheet) => sheet.kind)).toEqual([
      'free',
      ...Array(SHEETS.length - 1).fill('coloring')
    ]);
  });

  it('uses paintSheet* title keys', () => {
    expect(SHEETS.map((sheet) => sheet.titleKey)).toEqual(TITLE_KEYS);
  });

  it('offers all fourteen sheets at ages 3-5', () => {
    for (const age of [3, 4, 5]) {
      expect(getSheets(age).map((sheet) => sheet.id)).toEqual(IDS);
    }
  });

  it('offers thirteen sheets at age 2, dropping only Butterfly Garden', () => {
    expect(getSheets(2).map((sheet) => sheet.id)).toEqual(AGE2_IDS);
    expect(getSheets(2)).toHaveLength(13);
  });

  it('falls back to the standard set for a missing age', () => {
    expect(getSheets(undefined)).toBe(SHEETS);
    expect(getSheets(Number.NaN)).toBe(SHEETS);
  });

  it('defaults to blank paper', () => {
    expect(DEFAULT_SHEET_ID).toBe('blank');
    expect(getSheet(DEFAULT_SHEET_ID).kind).toBe('free');
  });

  it('looks up every added sheet and rejects unknown ids', () => {
    for (const id of ['farm', 'space', 'jungle', 'arctic', 'castle', 'vehicles', 'princesses', 'snow', 'ocean', 'robot']) {
      expect(getSheet(id), id).toBeTruthy();
    }
    expect(getSheet('dino-valley').titleKey).toBe('paintSheetDinoValley');
    expect(getSheet('ghost')).toBeNull();
    expect(getSheet(null)).toBeNull();
    expect(getSheet('__proto__')).toBeNull();
  });

  it('keeps the catalog frozen', () => {
    expect(Object.isFrozen(SHEETS)).toBe(true);
    expect(Object.isFrozen(SHEETS[0])).toBe(true);
    expect(Object.isFrozen(SHEETS[0].ages)).toBe(true);
  });
});
