import { describe, it, expect } from 'vitest';
import {
  SHEETS,
  DEFAULT_SHEET_ID,
  getSheets,
  getSheet
} from '$lib/paint/sheets.js';

const IDS = ['blank', 'dino-valley', 'butterfly-garden', 'under-the-sea'];

describe('Paint sheets', () => {
  it('lists the four sheets with unique ids', () => {
    expect(SHEETS.map((sheet) => sheet.id)).toEqual(IDS);
    expect(new Set(IDS).size).toBe(SHEETS.length);
  });

  it('marks blank as free and the pages as coloring', () => {
    expect(SHEETS.map((sheet) => sheet.kind)).toEqual([
      'free',
      'coloring',
      'coloring',
      'coloring'
    ]);
  });

  it('uses paintSheet* title keys', () => {
    expect(SHEETS.map((sheet) => sheet.titleKey)).toEqual([
      'paintSheetBlank',
      'paintSheetDinoValley',
      'paintSheetButterflyGarden',
      'paintSheetUnderTheSea'
    ]);
  });

  it('offers all four sheets at ages 3-5', () => {
    for (const age of [3, 4, 5]) {
      expect(getSheets(age).map((sheet) => sheet.id)).toEqual(IDS);
    }
  });

  it('offers blank, dino valley, and under the sea at age 2', () => {
    expect(getSheets(2).map((sheet) => sheet.id)).toEqual([
      'blank',
      'dino-valley',
      'under-the-sea'
    ]);
  });

  it('falls back to the standard set for a missing age', () => {
    expect(getSheets(undefined)).toBe(SHEETS);
    expect(getSheets(Number.NaN)).toBe(SHEETS);
  });

  it('defaults to blank paper', () => {
    expect(DEFAULT_SHEET_ID).toBe('blank');
    expect(getSheet(DEFAULT_SHEET_ID).kind).toBe('free');
  });

  it('looks up a sheet and rejects unknown ids', () => {
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
