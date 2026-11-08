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
  'popStart',
  'popGoodTrySub',
  'popWinSub',
  'popJarFill',
  'popRemaining',
  'popTypes',
  'popNormal',
  'popGiant',
  'popStar',
  'popPond',
  'popMoon',
  'jarFull',
  'soccerHint',
  'soccerGoal',
  'soccerSaved',
  'soccerMiss',
  'soccerWhatAShot',
  'soccerField',
  'soccerGoals',
  'soccerShots',
  'soccerBest',
  'soccerGoodTrySub',
  'soccerWinSub',
  'soccerAimAt',
  'soccerOnTarget',
  'soccerOffTarget',
  'soccerZoneLeft',
  'soccerZoneCentre',
  'soccerZoneRight',
  'qcBasketFull',
  'qcAnswers',
  'qcDots',
  'qcBasket',
  'qcWinSub',
  'spotFindChanged',
  'picture1',
  'picture2',
  'postcardAdded',
  'spotHarborComplete',
  'spotCompleteSub',
  'spotFoundCount',
  'spotSetProgress',
  'spotAlbumEmpty',
  'spotPostcardCount',
  'spotLook',
  'spotWhatChanged',
  'spotPeek',
  'ftPond',
  'ftSign',
  'ftJarFill',
  'ftRemaining',
  'ftFriend',
  'ftWinSub'
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

  it('keeps the focus-tap pond placeholders in every locale', () => {
    for (const code of LOCALES) {
      expect(translations[code].ftSign, `${code}.ftSign`).toContain('{e}');
      expect(translations[code].ftJarFill, `${code}.ftJarFill`).toContain('{n}');
      expect(translations[code].ftJarFill, `${code}.ftJarFill`).toContain('{m}');
      expect(translations[code].ftRemaining, `${code}.ftRemaining`).toContain('{n}');
    }
  });

  it('keeps the spot-the-difference count placeholders in every locale', () => {
    for (const code of LOCALES) {
      expect(translations[code].spotFoundCount, `${code}.spotFoundCount`).toContain('{n}');
      expect(translations[code].spotFoundCount, `${code}.spotFoundCount`).toContain('{m}');
      expect(translations[code].spotSetProgress, `${code}.spotSetProgress`).toContain('{n}');
      expect(translations[code].spotSetProgress, `${code}.spotSetProgress`).toContain('{m}');
      expect(translations[code].spotPostcardCount, `${code}.spotPostcardCount`).toContain('{n}');
    }
  });

  it('keeps the quick-count picnic placeholders in every locale', () => {
    for (const code of LOCALES) {
      expect(translations[code].qcDots, `${code}.qcDots`).toContain('{n}');
      expect(translations[code].qcBasket, `${code}.qcBasket`).toContain('{n}');
      expect(translations[code].qcBasket, `${code}.qcBasket`).toContain('{m}');
    }
  });

  it('keeps the soccer status and star-row placeholders in every locale', () => {
    const two = ['soccerGoals', 'soccerBest', 'soccerGoodTrySub'];
    for (const code of LOCALES) {
      for (const key of two) {
        expect(translations[code][key], `${code}.${key}`).toContain('{n}');
        expect(translations[code][key], `${code}.${key}`).toContain('{m}');
      }
      expect(translations[code].soccerShots, code).toContain('{n}');
      expect(translations[code].soccerWinSub, code).toContain('{n}');
      expect(translations[code].soccerAimAt, code).toContain('{zone}');
    }
  });
});
