import { describe, it, expect } from 'vitest';
import {
  PHOTO_LIMIT,
  MAX_PHOTO_BYTES,
  PhotoError,
  fitDims,
  canAdd,
} from '$lib/glossary-puzzle/photos.js';
import { PUZZLE_IMAGES, buildImageList, resolveImage } from '$lib/glossary-puzzle/images.js';

// Pure helpers only: fitDims / canAdd / PhotoError and resolveImage's builtin
// path. The IndexedDB pipeline (add/list/get/delete/stats) is exercised by e2e
// — the brief forbids faking indexedDB in unit tests.

describe('fitDims', () => {
  it('leaves images already at or under the edge untouched', () => {
    expect(fitDims(1600, 1200, 1600)).toEqual({ w: 1600, h: 1200 });
    expect(fitDims(300, 200, 1600)).toEqual({ w: 300, h: 200 });
  });

  it('scales a landscape image down to the longest edge', () => {
    expect(fitDims(3200, 2400, 1600)).toEqual({ w: 1600, h: 1200 });
  });

  it('scales a portrait image by its longest (height) edge', () => {
    expect(fitDims(1200, 3200, 1600)).toEqual({ w: 600, h: 1600 });
  });

  it('never upscales a small image', () => {
    expect(fitDims(10, 20, 400)).toEqual({ w: 10, h: 20 });
  });
});

describe('canAdd', () => {
  const MB = 1024 * 1024;

  it('allows the 30th photo while under both caps', () => {
    expect(canAdd({ count: 29, bytes: 0 }, MB)).toBe(true);
  });

  it('rejects once the photo count reaches PHOTO_LIMIT', () => {
    expect(canAdd({ count: 30, bytes: 0 }, MB)).toBe(false);
    expect(PHOTO_LIMIT).toBe(30);
  });

  it('allows bytes landing exactly on the byte cap', () => {
    expect(canAdd({ count: 0, bytes: MAX_PHOTO_BYTES - 1 }, 1)).toBe(true);
  });

  it('rejects bytes one past the byte cap', () => {
    expect(canAdd({ count: 0, bytes: MAX_PHOTO_BYTES }, 1)).toBe(false);
    expect(MAX_PHOTO_BYTES).toBe(50 * 1024 * 1024);
  });
});

describe('PhotoError', () => {
  it('is an Error carrying a classifying code', () => {
    for (const code of ['decode', 'limit', 'quota']) {
      const err = new PhotoError(code);
      expect(err).toBeInstanceOf(Error);
      expect(err.code).toBe(code);
    }
  });
});

describe('resolveImage', () => {
  it('returns a builtin VM shaped exactly like buildImageList output', async () => {
    const vm = await resolveImage('garden');
    const expected = buildImageList(PUZZLE_IMAGES, []).find(v => v.id === 'garden');
    expect(vm).toEqual(expected);
    expect(vm.source).toBe('builtin');
  });

  it('returns null for an unknown id', async () => {
    await expect(resolveImage('no-such-image')).resolves.toBeNull();
  });
});
