import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { locale, _ } from '$lib/stores/locale.js';

const LOCALES = ['en', 'it', 'ro', 'de', 'fr', 'zh'];

const KEYS = [
  'all', 'myPhotos', 'addPhotos', 'forGrownUps', 'holdToAdd', 'start', 'pieces',
  'solved', 'noPhotos', 'photoName', 'photoStorageNote', 'photoError', 'photoLimit',
  'deletePhoto', 'shows', 'adventure'
];

describe('glossary-puzzle image UX locale strings', () => {
  for (const id of LOCALES) {
    it(`${id} has a real translation for all 16 keys`, () => {
      locale.setLang(id);
      for (const key of KEYS) {
        const value = get(_)(key);
        expect(value, `${id}.${key}`).not.toBe(key);
        expect(value.length, `${id}.${key}`).toBeGreaterThan(0);
      }
    });

    it(`${id} photoName keeps the {n} placeholder`, () => {
      locale.setLang(id);
      expect(get(_)('photoName')).toContain('{n}');
    });
  }
});
