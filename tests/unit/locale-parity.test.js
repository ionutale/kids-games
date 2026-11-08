import { describe, it, expect } from 'vitest';
import { translations } from '../../src/lib/stores/locale.js';

const LOCALES = ['en', 'it', 'ro', 'de', 'fr', 'zh'];

const NEW_KEYS = [
  'goodTry',
  'pbDrawRoad',
  'pbRedraw',
  'pbHome',
  'pbDest',
  'pbStarsLeft',
  'pbOptionalLeft',
  'pbWalking',
  'pbMadeIt',
  'pbMissedStar',
  'pbNextRoad',
  'pbLevelOf',
  'pbRoadOf',
  'popHint',
  'jarFull',
  'soccerHint',
  'soccerGoal',
  'soccerSaved',
  'soccerMiss',
  'soccerWhatAShot',
  'qcBasketFull',
  'spotFindChanged',
  'picture1',
  'picture2',
  'postcardAdded',
  'spotHarborComplete',
  'spotCompleteSub',
  'spotLook',
  'spotWhatChanged',
  'spotPeek'
];

describe('locale parity', () => {
  it('ships exactly the six supported locales', () => {
    expect(Object.keys(translations).sort()).toEqual([...LOCALES].sort());
  });

  it('has the same key set in every locale', () => {
    const expected = Object.keys(translations.en).sort();
    for (const code of LOCALES) {
      expect(Object.keys(translations[code]).sort(), code).toEqual(expected);
    }
  });

  it('has a non-empty string for every key', () => {
    for (const code of LOCALES) {
      for (const [key, value] of Object.entries(translations[code])) {
        expect(typeof value, `${code}.${key}`).toBe('string');
        expect(value.trim(), `${code}.${key}`).not.toBe('');
      }
    }
  });

  it('includes every new game-copy key in every locale', () => {
    for (const code of LOCALES) {
      for (const key of NEW_KEYS) {
        expect(translations[code][key], `${code}.${key}`).toBeTruthy();
      }
    }
  });

  it('preserves placeholders in every locale', () => {
    for (const code of LOCALES) {
      expect(translations[code].catchTarget, code).toContain('{e}');
    }
  });
});
