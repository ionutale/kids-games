import { describe, it, expect } from 'vitest';
import {
  SAVE_KEY,
  SAVE_VERSION,
  loadWorld,
  saveWorld
} from '../../src/lib/stickers/save.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    }
  };
}

const trex = { id: 'p1', type: 'trex', x: 42.5, y: 61.2 };
const fern = { id: 'p2', type: 'fern', x: 20, y: 80 };

describe('Stickers save', () => {
  it('round-trips one world', () => {
    const storage = memoryStorage();
    saveWorld(storage, 'dino-valley', [trex, fern]);

    expect(loadWorld(storage, 'dino-valley', () => true)).toEqual([trex, fern]);
    expect(JSON.parse(storage.getItem(SAVE_KEY))).toEqual({
      version: SAVE_VERSION,
      worlds: { 'dino-valley': { placed: [trex, fern] } }
    });
  });

  it('preserves other worlds when saving one', () => {
    const storage = memoryStorage();
    saveWorld(storage, 'dino-valley', [trex]);
    saveWorld(storage, 'coral-bay', [{ id: 'c1', type: 'fish', x: 10, y: 20 }]);

    expect(loadWorld(storage, 'dino-valley', () => true)).toEqual([trex]);
    expect(loadWorld(storage, 'coral-bay', () => true)).toEqual([
      { id: 'c1', type: 'fish', x: 10, y: 20 }
    ]);
  });

  it('starts empty for malformed JSON', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, '{not json');

    expect(loadWorld(storage, 'dino-valley')).toEqual([]);
  });

  it('starts empty for an unknown version', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify({ version: 99, worlds: { 'dino-valley': { placed: [trex] } } }));

    expect(loadWorld(storage, 'dino-valley')).toEqual([]);
  });

  it('drops unknown sticker types', () => {
    const storage = memoryStorage();
    saveWorld(storage, 'dino-valley', [trex, { id: 'ghost', type: 'ghost', x: 50, y: 50 }]);

    expect(loadWorld(storage, 'dino-valley', (type) => type === 'trex')).toEqual([trex]);
  });

  it('drops malformed placements and clamps the rest', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify({
      version: SAVE_VERSION,
      worlds: {
        'dino-valley': {
          placed: [
            { id: 'ok', type: 'trex', x: 120, y: -10 },
            { id: 'nan', type: 'trex', x: '50', y: 50 },
            { id: 'missing', type: 'trex' },
            { type: 'trex', x: 50, y: 50 },
            null
          ]
        }
      }
    }));

    expect(loadWorld(storage, 'dino-valley', () => true)).toEqual([
      { id: 'ok', type: 'trex', x: 96, y: 4 }
    ]);
  });

  it('keeps the first placement when saved ids collide', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify({
      version: SAVE_VERSION,
      worlds: {
        'dino-valley': {
          placed: [
            { id: 'dup', type: 'trex', x: 40, y: 60 },
            { id: 'dup', type: 'fern', x: 20, y: 80 }
          ]
        }
      }
    }));

    expect(loadWorld(storage, 'dino-valley', () => true)).toEqual([
      { id: 'dup', type: 'trex', x: 40, y: 60 }
    ]);
  });

  it('does not throw without storage', () => {
    expect(() => saveWorld(null, 'dino-valley', [trex])).not.toThrow();
    expect(loadWorld(null, 'dino-valley')).toEqual([]);
  });

  it('reports a failed write without throwing', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      }
    };

    expect(() => saveWorld(storage, 'dino-valley', [trex])).not.toThrow();
    expect(saveWorld(storage, 'dino-valley', [trex])).toBe(false);
  });

  it('round-trips an empty world', () => {
    const storage = memoryStorage();
    saveWorld(storage, 'dino-valley', [trex]);
    saveWorld(storage, 'dino-valley', []);

    expect(loadWorld(storage, 'dino-valley')).toEqual([]);
  });
});
