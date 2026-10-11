import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  PUZZLE_IMAGES,
  CATEGORY_META,
  CATEGORY_ORDER,
  buildImageList,
  photoToVM,
  revokeVM,
} from '$lib/glossary-puzzle/images.js';

describe('image category metadata', () => {
  it('gives every builtin image a category that has metadata', () => {
    PUZZLE_IMAGES.forEach(img => expect(CATEGORY_META).toHaveProperty(img.category));
  });

  it('orders only known categories, with user photos first', () => {
    CATEGORY_ORDER.forEach(cat => expect(CATEGORY_META).toHaveProperty(cat));
    expect(CATEGORY_ORDER[0]).toBe('myPhotos');
  });
});

const fakePhotoVM = {
  id: 'photo:p1',
  name: 'My Photo',
  category: 'myPhotos',
  icon: '⭐',
  file: 'blob:file',
  thumb: 'blob:thumb',
  source: 'photo',
};

describe('buildImageList ordering', () => {
  it('puts user photos before every builtin', () => {
    const list = buildImageList(PUZZLE_IMAGES, [fakePhotoVM]);
    expect(list[0]).toBe(fakePhotoVM);
  });

  it('groups known categories by CATEGORY_ORDER', () => {
    const list = buildImageList(PUZZLE_IMAGES, []);
    const seen = [];
    list.forEach(vm => {
      if (!seen.includes(vm.category)) seen.push(vm.category);
    });
    const expected = CATEGORY_ORDER.filter(cat => PUZZLE_IMAGES.some(i => i.category === cat));
    expect(seen).toEqual(expected);
  });

  it('keeps builtin relative order inside a category', () => {
    const list = buildImageList(PUZZLE_IMAGES, []);
    const shows = list.filter(vm => vm.category === 'shows').map(vm => vm.id);
    expect(shows).toEqual(['blippi', 'blippi-happy']);
  });

  it('appends unknown categories after all known ones', () => {
    const mystery = { id: 'mystery', name: 'Mystery', category: 'mystery', icon: '❓', file: '/puzzles/x.jpg', thumbEmoji: '❓' };
    const list = buildImageList([...PUZZLE_IMAGES, mystery], []);
    expect(list[list.length - 1].id).toBe('mystery');
  });

  it('tags builtin VMs with source and reuses the file as thumb', () => {
    buildImageList(PUZZLE_IMAGES, []).forEach(vm => {
      expect(vm.source).toBe('builtin');
      expect(vm.thumb).toBe(vm.file);
    });
  });
});

describe('photoToVM / revokeVM', () => {
  afterEach(() => vi.restoreAllMocks());

  const record = { id: 'abc', seq: 4, blob: { tag: 'blob' }, thumb: { tag: 'thumb' } };

  it('maps a photo record to a VM and creates both object URLs', () => {
    const create = vi.spyOn(URL, 'createObjectURL')
      .mockImplementationOnce(() => 'blob:file')
      .mockImplementationOnce(() => 'blob:thumb');
    const t = vi.fn((key, params) => `${key}:${params.n}`);

    const vm = photoToVM(record, t);

    expect(vm).toEqual({
      id: 'photo:abc',
      name: 'photoName:4',
      category: 'myPhotos',
      icon: '⭐',
      file: 'blob:file',
      thumb: 'blob:thumb',
      source: 'photo',
    });
    expect(t).toHaveBeenCalledWith('photoName', { n: 4 });
    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenNthCalledWith(1, record.blob);
    expect(create).toHaveBeenNthCalledWith(2, record.thumb);
  });

  it('revokes both object URLs of a photo VM', () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    revokeVM(fakePhotoVM);
    expect(revoke).toHaveBeenCalledTimes(2);
    expect(revoke).toHaveBeenCalledWith('blob:file');
    expect(revoke).toHaveBeenCalledWith('blob:thumb');
  });

  it('revokes nothing for a builtin VM', () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    revokeVM(buildImageList(PUZZLE_IMAGES, [])[0]);
    expect(revoke).not.toHaveBeenCalled();
  });
});
