import { describe, it, expect } from 'vitest';
import {
  MAX_UNDO,
  emptySheet,
  normalizeSheet,
  createPaintDocument
} from '$lib/paint/document.js';
import { MAX_STROKE_POINTS } from '$lib/paint/geometry.js';

const point = (x, y) => ({ x, y });

function stroke(overrides = {}) {
  return {
    color: '#FF6B6B',
    size: 12,
    region: null,
    points: [point(0.1, 0.1), point(0.2, 0.2)],
    ...overrides
  };
}

function stamp(overrides = {}) {
  return { type: 'star', x: 0.5, y: 0.5, size: 56, ...overrides };
}

describe('Paint document shape', () => {
  it('creates an empty free sheet without fills', () => {
    expect(emptySheet('blank')).toEqual({ kind: 'free', strokes: [], stamps: [] });
  });

  it('creates an empty coloring sheet with a fills map', () => {
    expect(emptySheet('dino-valley')).toEqual({
      kind: 'coloring',
      fills: {},
      strokes: [],
      stamps: []
    });
  });

  it('treats an unknown sheet id as free paper', () => {
    expect(emptySheet('ghost')).toEqual({ kind: 'free', strokes: [], stamps: [] });
  });

  it('normalizes a saved sheet and drops malformed marks', () => {
    const sheet = normalizeSheet('dino-valley', {
      fills: { sky: '#4FC3F7', lake: '#4FC3F7', bad: 42 },
      strokes: [
        stroke({ region: 'sky' }),
        stroke({ points: [] }),
        stroke({ color: '' }),
        { ...stroke(), points: [{ x: Number.NaN, y: 0.5 }] }
      ],
      stamps: [stamp(), { type: 'heart', x: 0.2, y: 0.2 }, null]
    });

    expect(sheet).toEqual({
      kind: 'coloring',
      fills: { sky: '#4FC3F7', lake: '#4FC3F7' },
      strokes: [stroke({ region: 'sky' })],
      stamps: [stamp()]
    });
  });

  it('drops fills and strokes for unknown regions when a set is supplied', () => {
    const sheet = normalizeSheet(
      'dino-valley',
      {
        fills: { sky: '#4FC3F7', lake: '#4FC3F7' },
        strokes: [
          stroke({ region: 'sky' }),
          stroke({ region: 'lake' }),
          stroke({ region: null })
        ],
        stamps: []
      },
      { regions: ['sky'] }
    );

    expect(sheet.fills).toEqual({ sky: '#4FC3F7' });
    expect(sheet.strokes.map((item) => item.region)).toEqual(['sky', null]);
  });

  it('returns null for unknown sheets or a non-object payload', () => {
    expect(normalizeSheet('ghost', {})).toBeNull();
    expect(normalizeSheet('blank', null)).toBeNull();
    expect(normalizeSheet('blank', [])).toBeNull();
  });

  it('ignores fills on a free sheet and forces stroke regions to null', () => {
    const sheet = normalizeSheet('blank', {
      fills: { sky: '#4FC3F7' },
      strokes: [stroke({ region: 'sky' })],
      stamps: []
    });

    expect(sheet).toEqual({
      kind: 'free',
      strokes: [stroke({ region: null })],
      stamps: []
    });
  });
});

describe('Paint document actions', () => {
  it('starts blank with no history', () => {
    const doc = createPaintDocument();
    expect(doc.sheetId).toBe('blank');
    expect(doc.kind).toBe('free');
    expect(doc.sheet).toEqual(emptySheet('blank'));
    expect(doc.canUndo).toBe(false);
    expect(doc.undoDepth).toBe(0);
    expect(doc.isDrawing).toBe(false);
  });

  it('falls back to blank for an unknown sheet id', () => {
    expect(createPaintDocument('ghost').sheetId).toBe('blank');
  });

  it('adds a stroke and thins points closer than 2px', () => {
    const doc = createPaintDocument('blank');
    const start = point(0.5, 0.5);
    const near = point(0.5 + 1 / 390, 0.5);
    const far = point(0.5 + 3 / 390, 0.5);

    const committed = doc.addStroke(stroke({ points: [start, near, far] }));

    expect(committed.points).toEqual([start, far]);
    expect(doc.sheet.strokes).toEqual([committed]);
    expect(doc.canUndo).toBe(true);
  });

  it('rejects malformed strokes', () => {
    const doc = createPaintDocument('blank');

    expect(doc.addStroke(null)).toBeNull();
    expect(doc.addStroke(stroke({ color: '' }))).toBeNull();
    expect(doc.addStroke(stroke({ size: 0 }))).toBeNull();
    expect(doc.addStroke(stroke({ points: [] }))).toBeNull();
    expect(doc.addStroke(stroke({ points: [{ x: '0', y: 0.5 }] }))).toBeNull();
    expect(doc.addStroke(stroke({ region: 42 }))).toBeNull();
    expect(doc.canUndo).toBe(false);
  });

  it('keeps the coloring region on a coloring sheet', () => {
    const doc = createPaintDocument('dino-valley');
    expect(doc.addStroke(stroke({ region: 'sky' })).region).toBe('sky');
  });

  it('caps a stroke at 400 points', () => {
    const doc = createPaintDocument('blank', { width: 100000, height: 100000 });
    const points = Array.from({ length: 500 }, (_, i) => point(i / 10000, 0.5));

    const committed = doc.addStroke(stroke({ points }));

    expect(MAX_STROKE_POINTS).toBe(400);
    expect(committed.points).toHaveLength(400);
    expect(committed.points[399]).toEqual(point(399 / 10000, 0.5));
  });

  it('collects a live stroke with begin/append/end', () => {
    const doc = createPaintDocument('dino-valley');

    expect(doc.beginStroke({ color: '#4FC3F7', size: 12, region: 'sky' })).toBe(true);
    expect(doc.isDrawing).toBe(true);
    expect(doc.appendPoint(point(0.1, 0.1))).toBe(true);
    expect(doc.appendPoint(point(0.1 + 1 / 390, 0.1))).toBe(false);
    expect(doc.appendPoint(point(0.2, 0.2))).toBe(true);

    const committed = doc.endStroke();
    expect(committed).toEqual({
      color: '#4FC3F7',
      size: 12,
      region: 'sky',
      points: [point(0.1, 0.1), point(0.2, 0.2)]
    });
    expect(doc.sheet.strokes).toEqual([committed]);
    expect(doc.isDrawing).toBe(false);

    expect(doc.appendPoint(point(0.3, 0.3))).toBe(false);
    expect(doc.endStroke()).toBeNull();
  });

  it('rejects an invalid live stroke and cancels it', () => {
    const doc = createPaintDocument('blank');

    expect(doc.beginStroke({ color: '#FF6B6B', size: 0 })).toBe(false);
    expect(doc.beginStroke({ color: '', size: 12 })).toBe(false);
    expect(doc.beginStroke({ color: '#FF6B6B', size: 12 })).toBe(true);
    doc.cancelStroke();
    expect(doc.isDrawing).toBe(false);
    expect(doc.endStroke()).toBeNull();
  });

  it('commits nothing for a live stroke with no points', () => {
    const doc = createPaintDocument('blank');
    doc.beginStroke({ color: '#FF6B6B', size: 12 });
    expect(doc.endStroke()).toBeNull();
    expect(doc.canUndo).toBe(false);
  });

  it('adds a stamp and clamps its position', () => {
    const doc = createPaintDocument('blank');

    expect(doc.addStamp(stamp({ x: 1.2, y: -0.4 }))).toEqual({
      type: 'star',
      x: 1,
      y: 0,
      size: 56
    });
    expect(doc.addStamp({ type: 'star', x: 0.5, y: 0.5 })).toBeNull();
    expect(doc.addStamp({ type: '', x: 0.5, y: 0.5, size: 56 })).toBeNull();
    expect(doc.addStamp({ type: 'star', x: Number.NaN, y: 0.5, size: 56 })).toBeNull();
    expect(doc.addStamp({ type: 'star', x: 0.5, y: 0.5, size: 0 })).toBeNull();
    expect(doc.sheet.stamps).toHaveLength(1);
  });

  it('sets and clears coloring fills', () => {
    const doc = createPaintDocument('dino-valley');

    expect(doc.setFill('sky', '#4FC3F7')).toBe(true);
    expect(doc.sheet.fills).toEqual({ sky: '#4FC3F7' });
    expect(doc.setFill('sky', '#4FC3F7')).toBe(false);
    expect(doc.setFill('sky', '#FFD54F')).toBe(true);
    expect(doc.sheet.fills).toEqual({ sky: '#FFD54F' });

    expect(doc.clearFill('sky')).toBe(true);
    expect(doc.sheet.fills).toEqual({});
    expect(doc.clearFill('sky')).toBe(false);
  });

  it('ignores fills on blank paper', () => {
    const doc = createPaintDocument('blank');
    expect(doc.setFill('sky', '#4FC3F7')).toBe(false);
    expect(doc.clearFill('sky')).toBe(false);
    expect(doc.sheet).toEqual(emptySheet('blank'));
  });

  it('clears a sheet as one undoable action', () => {
    const doc = createPaintDocument('dino-valley');
    doc.setFill('sky', '#4FC3F7');
    doc.addStroke(stroke({ region: 'sky' }));
    doc.addStamp(stamp());

    expect(doc.clearSheet()).toBe(true);
    expect(doc.sheet).toEqual(emptySheet('dino-valley'));
    expect(doc.canUndo).toBe(true);

    expect(doc.undo()).toBe(true);
    expect(doc.sheet.fills).toEqual({ sky: '#4FC3F7' });
    expect(doc.sheet.strokes).toHaveLength(1);
    expect(doc.sheet.stamps).toHaveLength(1);

    doc.clearSheet();
    doc.undo();
    doc.clearSheet();
    expect(doc.sheet).toEqual(emptySheet('dino-valley'));
  });

  it('does not record a clear on already-empty paper', () => {
    const doc = createPaintDocument('blank');
    expect(doc.clearSheet()).toBe(false);
    expect(doc.canUndo).toBe(false);
  });

  it('undoes fills, strokes, stamps, and clears in order', () => {
    const doc = createPaintDocument('dino-valley');

    doc.setFill('sky', '#4FC3F7');
    doc.addStroke(stroke({ region: 'sky' }));
    doc.addStamp(stamp());

    doc.undo();
    expect(doc.sheet.stamps).toEqual([]);
    expect(doc.sheet.strokes).toHaveLength(1);

    doc.undo();
    expect(doc.sheet.strokes).toEqual([]);
    expect(doc.sheet.fills).toEqual({ sky: '#4FC3F7' });

    doc.undo();
    expect(doc.sheet.fills).toEqual({});
    expect(doc.canUndo).toBe(false);
    expect(doc.undo()).toBe(false);
  });

  it('keeps the last 20 actions and has no redo', () => {
    const doc = createPaintDocument('blank');
    for (let i = 0; i < 25; i += 1) {
      doc.addStamp(stamp());
    }

    expect(MAX_UNDO).toBe(20);
    expect(doc.undoDepth).toBe(20);

    for (let i = 0; i < 20; i += 1) {
      expect(doc.undo()).toBe(true);
    }
    expect(doc.undo()).toBe(false);
    expect(doc.sheet.stamps).toHaveLength(5);
    expect(doc.redo).toBeUndefined();
  });

  it('loads a sheet and resets history', () => {
    const doc = createPaintDocument('dino-valley');
    doc.addStamp(stamp());

    const loaded = doc.load({
      kind: 'coloring',
      fills: { sky: '#4FC3F7' },
      strokes: [stroke({ region: 'sky' }), stroke({ points: [] })],
      stamps: [stamp(), { type: 'heart', x: 0.1, y: 0.1, size: 56 }]
    });

    expect(loaded.kind).toBe('coloring');
    expect(loaded.fills).toEqual({ sky: '#4FC3F7' });
    expect(loaded.strokes).toHaveLength(1);
    expect(loaded.stamps).toHaveLength(2);
    expect(doc.sheet).toEqual(loaded);
    expect(doc.canUndo).toBe(false);
    expect(doc.undo()).toBe(false);
  });

  it('loads blank for a malformed saved sheet', () => {
    const doc = createPaintDocument('blank');
    doc.addStamp(stamp());

    expect(doc.load(null)).toEqual(emptySheet('blank'));
    expect(doc.sheet.stamps).toEqual([]);

    expect(doc.load({ strokes: 'nope', stamps: 'nope' })).toEqual(emptySheet('blank'));
  });

  it('returns a detached snapshot from toJSON', () => {
    const doc = createPaintDocument('dino-valley');
    doc.setFill('sky', '#4FC3F7');
    doc.addStroke(stroke({ region: 'sky' }));
    doc.addStamp(stamp());

    const snapshot = doc.toJSON();
    snapshot.fills.sky = '#000000';
    snapshot.strokes[0].points[0].x = 0.9;
    snapshot.strokes.push(stroke());
    snapshot.stamps.push(stamp({ type: 'heart' }));

    expect(doc.sheet.fills.sky).toBe('#4FC3F7');
    expect(doc.sheet.strokes).toHaveLength(1);
    expect(doc.sheet.strokes[0].points[0].x).toBe(0.1);
    expect(doc.sheet.stamps).toHaveLength(1);
  });
});
