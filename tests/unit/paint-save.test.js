import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  SAVE_KEY,
  SAVE_VERSION,
  getStorage,
  emptyDocument,
  loadPaint,
  savePaint
} from '$lib/paint/save.js';
import { MAX_STROKE_POINTS } from '$lib/paint/geometry.js';

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

const point = (x, y) => ({ x, y });

const blankStroke = {
  color: '#FF6B6B',
  size: 12,
  region: null,
  points: [point(0.2, 0.3), point(0.4, 0.5)]
};

const dinoStroke = {
  color: '#81C784',
  size: 6,
  region: 'sky',
  points: [point(0.5, 0.5), point(0.6, 0.6)]
};

const dinoStamp = { type: 'star', x: 0.25, y: 0.75, size: 56 };

const blankSheet = { kind: 'free', strokes: [blankStroke], stamps: [] };

const dinoSheet = {
  kind: 'coloring',
  fills: { sky: '#4FC3F7' },
  strokes: [dinoStroke],
  stamps: [dinoStamp]
};

const fullDoc = {
  activeSheet: 'dino-valley',
  sheets: { blank: blankSheet, 'dino-valley': dinoSheet }
};

function stored(storage) {
  return JSON.parse(storage.getItem(SAVE_KEY));
}

describe('Paint save', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete globalThis.localStorage;
  });

  it('round-trips every sheet and the active sheet', () => {
    const storage = memoryStorage();
    expect(savePaint(storage, fullDoc)).toBe(true);

    expect(loadPaint(storage)).toEqual({
      activeSheet: 'dino-valley',
      sheets: { blank: blankSheet, 'dino-valley': dinoSheet }
    });
    expect(stored(storage).version).toBe(SAVE_VERSION);
  });

  it('starts on blank paper with an empty storage', () => {
    expect(loadPaint(memoryStorage())).toEqual({
      activeSheet: 'blank',
      sheets: { blank: { kind: 'free', strokes: [], stamps: [] } }
    });
    expect(loadPaint(null)).toEqual(emptyDocument());
  });

  it('preserves other sheets when saving one', () => {
    const storage = memoryStorage();
    savePaint(storage, fullDoc);

    savePaint(storage, {
      activeSheet: 'blank',
      sheets: {
        blank: {
          kind: 'free',
          strokes: [{ ...blankStroke, color: '#FFD54F' }],
          stamps: [dinoStamp]
        }
      }
    });

    const loaded = loadPaint(storage);
    expect(loaded.activeSheet).toBe('blank');
    expect(loaded.sheets.blank.strokes[0].color).toBe('#FFD54F');
    expect(loaded.sheets.blank.stamps).toHaveLength(1);
    expect(loaded.sheets['dino-valley']).toEqual(dinoSheet);
  });

  it('adds blank paper when the save only has a coloring sheet', () => {
    const storage = memoryStorage();
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: SAVE_VERSION,
        activeSheet: 'dino-valley',
        sheets: { 'dino-valley': dinoSheet }
      })
    );

    const loaded = loadPaint(storage);
    expect(loaded.activeSheet).toBe('dino-valley');
    expect(loaded.sheets.blank).toEqual({ kind: 'free', strokes: [], stamps: [] });
  });

  it('starts blank for malformed JSON', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, '{not json');
    expect(loadPaint(storage)).toEqual(emptyDocument());
  });

  it('starts blank for an unknown version', () => {
    const storage = memoryStorage();
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: 99, activeSheet: 'blank', sheets: { blank: blankSheet } })
    );
    expect(loadPaint(storage)).toEqual(emptyDocument());
  });

  it('starts blank for a missing or malformed sheets map', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, sheets: [] }));
    expect(loadPaint(storage)).toEqual(emptyDocument());

    storage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION }));
    expect(loadPaint(storage)).toEqual(emptyDocument());

    storage.setItem(SAVE_KEY, JSON.stringify(null));
    expect(loadPaint(storage)).toEqual(emptyDocument());
  });

  it('drops unknown sheet ids and falls back to blank as active', () => {
    const storage = memoryStorage();
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: SAVE_VERSION,
        activeSheet: 'ghost',
        sheets: {
          ghost: { kind: 'free', strokes: [blankStroke], stamps: [] },
          blank: blankSheet
        }
      })
    );

    const loaded = loadPaint(storage);
    expect(loaded.activeSheet).toBe('blank');
    expect(Object.keys(loaded.sheets)).toEqual(['blank']);
    expect(loaded.sheets.blank).toEqual(blankSheet);
  });

  it('drops a malformed sheet but keeps valid siblings', () => {
    const storage = memoryStorage();
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: SAVE_VERSION,
        activeSheet: 'blank',
        sheets: { blank: blankSheet, 'dino-valley': 'nope' }
      })
    );

    const loaded = loadPaint(storage);
    expect(loaded.sheets.blank).toEqual(blankSheet);
    expect(loaded.sheets['dino-valley']).toBeUndefined();
  });

  it('drops unknown regions only when a known set is supplied', () => {
    const storage = memoryStorage();
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: SAVE_VERSION,
        activeSheet: 'dino-valley',
        sheets: {
          'dino-valley': {
            kind: 'coloring',
            fills: { sky: '#4FC3F7', lake: '#4FC3F7' },
            strokes: [
              dinoStroke,
              { ...dinoStroke, region: 'lake' },
              { ...dinoStroke, region: null }
            ],
            stamps: []
          }
        }
      })
    );

    const permissive = loadPaint(storage).sheets['dino-valley'];
    expect(permissive.fills).toEqual({ sky: '#4FC3F7', lake: '#4FC3F7' });
    expect(permissive.strokes.map((stroke) => stroke.region)).toEqual([
      'sky',
      'lake',
      null
    ]);

    const strict = loadPaint(storage, {
      regions: { 'dino-valley': ['sky'] }
    }).sheets['dino-valley'];
    expect(strict.fills).toEqual({ sky: '#4FC3F7' });
    expect(strict.strokes.map((stroke) => stroke.region)).toEqual(['sky', null]);

    const flat = loadPaint(storage, { regions: new Set(['sky']) }).sheets[
      'dino-valley'
    ];
    expect(flat.fills).toEqual({ sky: '#4FC3F7' });
  });

  it('clamps points and stamp positions and drops non-finite ones', () => {
    const storage = memoryStorage();
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: SAVE_VERSION,
        activeSheet: 'blank',
        sheets: {
          blank: {
            kind: 'free',
            strokes: [
              {
                ...blankStroke,
                points: [point(1.2, 0.5), point(0.75, -10), point(Number.NaN, 0.5)]
              },
              { ...blankStroke, points: [point(Infinity, 0.5)] }
            ],
            stamps: [{ type: 'heart', x: 20, y: -20, size: 56 }]
          }
        }
      })
    );

    const sheet = loadPaint(storage).sheets.blank;
    expect(sheet.strokes).toHaveLength(1);
    expect(sheet.strokes[0].points).toEqual([point(1, 0.5), point(0.75, 0)]);
    expect(sheet.stamps).toEqual([{ type: 'heart', x: 1, y: 0, size: 56 }]);
  });

  it('caps a loaded stroke at 400 points', () => {
    const storage = memoryStorage();
    const points = Array.from({ length: 500 }, (_, i) => ({
      // Zigzag across the artboard so 400 points stay more than 2px apart.
      x: i % 2 === 0 ? 0 : 1,
      y: (Math.floor(i / 2) * 2) / 844
    }));
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: SAVE_VERSION,
        activeSheet: 'blank',
        sheets: {
          blank: {
            kind: 'free',
            strokes: [{ ...blankStroke, points }],
            stamps: []
          }
        }
      })
    );

    const sheet = loadPaint(storage).sheets.blank;
    expect(sheet.strokes[0].points).toHaveLength(MAX_STROKE_POINTS);
  });

  it('ignores unknown sheet ids and active sheets when saving', () => {
    const storage = memoryStorage();
    expect(
      savePaint(storage, {
        activeSheet: 'ghost',
        sheets: { ghost: blankSheet }
      })
    ).toBe(true);

    const loaded = loadPaint(storage);
    expect(loaded.activeSheet).toBe('blank');
    expect(Object.keys(loaded.sheets)).toEqual(['blank']);
  });

  it('reports a bad document without writing', () => {
    const storage = memoryStorage();
    expect(savePaint(storage, null)).toBe(false);
    expect(savePaint(storage, { activeSheet: 'blank' })).toBe(false);
    expect(savePaint(storage, { sheets: [] })).toBe(false);
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it('does not throw when the storage accessor is blocked', () => {
    const storage = {
      get getItem() {
        throw new Error('blocked');
      },
      setItem() {}
    };

    expect(() => loadPaint(storage)).not.toThrow();
    expect(loadPaint(storage)).toEqual(emptyDocument());
  });

  it('reports a failed write without throwing', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      }
    };

    expect(() => savePaint(storage, fullDoc)).not.toThrow();
    expect(savePaint(storage, fullDoc)).toBe(false);
  });

  it('does not throw without storage', () => {
    expect(savePaint(null, fullDoc)).toBe(false);
    expect(savePaint({}, fullDoc)).toBe(false);
  });

  it('reads the guarded localStorage only when it is available', () => {
    const storage = memoryStorage();
    vi.stubGlobal('localStorage', storage);
    expect(getStorage()).toBe(storage);

    vi.stubGlobal('localStorage', undefined);
    expect(getStorage()).toBeNull();
  });

  it('returns null when the localStorage accessor throws', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked cookies');
      }
    });

    expect(getStorage()).toBeNull();
  });
});
