import { beforeEach, describe, expect, it } from 'vitest';
import {
  CAT_ZONE,
  DIFF_TYPES,
  PROP_POOL,
  SET_SIZE,
  ageSpec,
  diffPointsPx,
  findDiffAt,
  hotspotRadius,
  inCatZone,
  makeScenePuzzle,
  sceneFor
} from '../../src/lib/spot-difference/scene.js';
import {
  ALBUM_LIMIT,
  POSTCARD_KEY,
  addPostcard,
  latestPostcards,
  loadPostcards
} from '../../src/lib/spot-difference/postcards.js';

const SEEDS = Array.from({ length: 40 }, (_, i) => (i + 1) * 37);

function sceneEmojis(puzzle) {
  return new Set(puzzle.props.map((prop) => prop.emoji));
}

describe('ageSpec', () => {
  it('maps the three Settings bands to props and differences', () => {
    expect(ageSpec(2)).toMatchObject({ age: 3, props: 9, diffs: 2 });
    expect(ageSpec(3)).toMatchObject({ age: 3, props: 9, diffs: 2 });
    expect(ageSpec(4)).toMatchObject({ age: 4, props: 11, diffs: 3 });
    expect(ageSpec(5)).toMatchObject({ age: 5, props: 12, diffs: 4 });
    expect(ageSpec(6)).toMatchObject({ age: 5, props: 12, diffs: 4 });
  });

  it('makes moves and resizes visibly larger on the youngest band', () => {
    expect(ageSpec(3).move).toBeGreaterThan(ageSpec(5).move);
    expect(ageSpec(3).scale).toBeGreaterThan(ageSpec(5).scale);
    expect(ageSpec(4).move).toBeGreaterThan(ageSpec(5).move);
  });
});

describe('makeScenePuzzle', () => {
  it('generates exactly the promised props and differences for every band', () => {
    for (const age of [2, 3, 4, 5]) {
      const spec = ageSpec(age);
      for (const seed of SEEDS) {
        const puzzle = makeScenePuzzle(age, seed);
        expect(puzzle.props.length, `age ${age} seed ${seed}`).toBe(spec.props);
        expect(puzzle.diffs.length, `age ${age} seed ${seed}`).toBe(spec.diffs);
        expect(puzzle.spec).toEqual(spec);
        expect(puzzle.diffs.every((diff) => DIFF_TYPES.includes(diff.type))).toBe(true);
      }
    }
  });

  it('uses a distinct type for every difference when the count allows', () => {
    for (const seed of SEEDS) {
      const age5 = makeScenePuzzle(5, seed);
      expect(new Set(age5.diffs.map((diff) => diff.type)).size).toBe(4);

      const age4 = makeScenePuzzle(4, seed);
      expect(new Set(age4.diffs.map((diff) => diff.type)).size).toBe(3);

      const age3 = makeScenePuzzle(3, seed);
      expect(new Set(age3.diffs.map((diff) => diff.type)).size).toBe(2);
    }
  });

  it('gives every prop a stable unique id and only draws from the harbor pool', () => {
    for (const seed of SEEDS) {
      const puzzle = makeScenePuzzle(5, seed);
      expect(new Set(puzzle.props.map((prop) => prop.id)).size).toBe(puzzle.props.length);
      for (const prop of puzzle.props) {
        expect(PROP_POOL).toContain(prop.emoji);
        expect(prop.x).toBeGreaterThanOrEqual(0);
        expect(prop.x).toBeLessThanOrEqual(100);
        expect(prop.y).toBeGreaterThanOrEqual(0);
        expect(prop.y).toBeLessThanOrEqual(100);
        expect(inCatZone(prop.x, prop.y), `prop ${prop.id} seed ${seed}`).toBe(false);
      }
    }
  });

  it('keeps props apart so the scene never overlaps', () => {
    for (const age of [3, 4, 5]) {
      for (const seed of SEEDS) {
        const { props } = makeScenePuzzle(age, seed);
        for (let i = 0; i < props.length; i += 1) {
          for (let j = i + 1; j < props.length; j += 1) {
            const distance = Math.hypot(
              props[i].x - props[j].x,
              (props[i].y - props[j].y) * 0.78
            );
            expect(distance, `age ${age} seed ${seed}`).toBeGreaterThan(10);
          }
        }
      }
    }
  });

  it('is deterministic per seed', () => {
    expect(makeScenePuzzle(5, 999)).toEqual(makeScenePuzzle(5, 999));
  });

  it('keeps moved props in bounds and out of the cat corner', () => {
    for (const age of [3, 4, 5]) {
      for (const seed of SEEDS) {
        const puzzle = makeScenePuzzle(age, seed);
        const moved = puzzle.diffs.filter((diff) => diff.type === 'moved');
        for (const diff of moved) {
          expect(diff.right).toBeTruthy();
          expect(diff.right.x).toBeGreaterThanOrEqual(0);
          expect(diff.right.x).toBeLessThanOrEqual(100);
          expect(diff.right.y).toBeGreaterThanOrEqual(0);
          expect(diff.right.y).toBeLessThanOrEqual(100);
          expect(inCatZone(diff.right.x, diff.right.y)).toBe(false);
          expect(Math.hypot(
            diff.left.x - diff.right.x,
            diff.left.y - diff.right.y
          )).toBeGreaterThan(4);
        }
      }
    }
  });

  it('age 3 swaps in an emoji that appears nowhere in the scene', () => {
    let checked = 0;
    for (const seed of SEEDS) {
      const puzzle = makeScenePuzzle(3, seed);
      const inScene = sceneEmojis(puzzle);
      for (const diff of puzzle.diffs.filter((d) => d.type === 'swap')) {
        expect(inScene.has(diff.right.emoji), `seed ${seed}`).toBe(false);
        expect(PROP_POOL).toContain(diff.right.emoji);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('age 4 and 5 swap in an emoji already in the scene', () => {
    for (const age of [4, 5]) {
      let checked = 0;
      for (const seed of SEEDS) {
        const puzzle = makeScenePuzzle(age, seed);
        const inScene = sceneEmojis(puzzle);
        for (const diff of puzzle.diffs.filter((d) => d.type === 'swap')) {
          expect(inScene.has(diff.right.emoji), `age ${age} seed ${seed}`).toBe(true);
          checked += 1;
        }
      }
      expect(checked).toBeGreaterThan(0);
    }
  });

  it('resizes only the size difference and grows it', () => {
    for (const seed of SEEDS) {
      const puzzle = makeScenePuzzle(5, seed);
      for (const diff of puzzle.diffs.filter((d) => d.type === 'size')) {
        expect(diff.left.scale).toBe(1);
        expect(diff.right.scale).toBeGreaterThan(1.2);
      }
    }
  });
});

describe('sceneFor', () => {
  it('draws one complete left picture and only the missing prop absent on the right', () => {
    for (const seed of SEEDS) {
      const puzzle = makeScenePuzzle(5, seed);
      const left = sceneFor(puzzle, 'left');
      const right = sceneFor(puzzle, 'right');
      const missing = puzzle.diffs.filter((diff) => diff.type === 'missing');
      expect(left.length).toBe(puzzle.props.length);
      expect(right.length).toBe(puzzle.props.length - missing.length);
      for (const diff of missing) {
        expect(left.some((prop) => prop.id === diff.id)).toBe(true);
        expect(right.some((prop) => prop.id === diff.id)).toBe(false);
      }
    }
  });

  it('applies swap, move and size changes on the right only', () => {
    for (const seed of SEEDS) {
      const puzzle = makeScenePuzzle(5, seed);
      const left = new Map(sceneFor(puzzle, 'left').map((prop) => [prop.id, prop]));
      const right = new Map(sceneFor(puzzle, 'right').map((prop) => [prop.id, prop]));
      for (const diff of puzzle.diffs) {
        if (diff.type === 'missing') continue;
        const l = left.get(diff.id);
        const r = right.get(diff.id);
        expect(l.emoji).toBe(diff.left.emoji);
        expect(r.emoji).toBe(diff.right.emoji);
        expect(l.x).toBeCloseTo(diff.left.x);
        expect(r.x).toBeCloseTo(diff.right.x);
        expect(l.scale).toBeCloseTo(diff.left.scale);
        expect(r.scale).toBeCloseTo(diff.right.scale);
      }
    }
  });

  it('marks changed props with their difference type and leaves the rest alone', () => {
    const puzzle = makeScenePuzzle(4, 1234);
    const changed = new Set(puzzle.diffs.map((diff) => diff.id));
    for (const prop of sceneFor(puzzle, 'left')) {
      expect(Boolean(prop.diffType)).toBe(changed.has(prop.id));
    }
  });
});

describe('findDiffAt', () => {
  it('requires a generous 44px tap target at the smallest width', () => {
    expect(hotspotRadius(320)).toBeGreaterThanOrEqual(22);
    expect(hotspotRadius(390)).toBeGreaterThan(hotspotRadius(320));
  });

  it('hits a difference at its position and ignores matches far away', () => {
    const puzzle = makeScenePuzzle(4, 77);
    const diff = puzzle.diffs[0];
    const width = 320;
    const height = 220;
    const px = (diff.left.x / 100) * width;
    const py = (diff.left.y / 100) * height;
    expect(findDiffAt(puzzle, px, py, width, height, [])?.id).toBe(diff.id);
    expect(findDiffAt(puzzle, -500, -500, width, height, [])).toBeNull();
  });

  it('ignores already found differences', () => {
    const puzzle = makeScenePuzzle(3, 42);
    const found = puzzle.diffs.map((diff) => diff.id);
    const [px, py] = [
      (puzzle.diffs[0].left.x / 100) * 320,
      (puzzle.diffs[0].left.y / 100) * 220
    ];
    expect(findDiffAt(puzzle, px, py, 320, 220, found)).toBeNull();
  });

  it('counts a moved prop from its old position, its new position and along the path', () => {
    const puzzle = makeScenePuzzle(5, 2026);
    const moved = puzzle.diffs.find((diff) => diff.type === 'moved');
    expect(moved).toBeTruthy();
    const width = 320;
    const height = 240;
    const others = puzzle.diffs.filter((diff) => diff.id !== moved.id).map((diff) => diff.id);
    const points = diffPointsPx(moved, width, height);
    const mid = {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2
    };
    expect(findDiffAt(puzzle, points[0].x, points[0].y, width, height, others)?.id).toBe(moved.id);
    expect(findDiffAt(puzzle, points[1].x, points[1].y, width, height, others)?.id).toBe(moved.id);
    expect(findDiffAt(puzzle, mid.x, mid.y, width, height, others)?.id).toBe(moved.id);
  });

  it('draws the missing prop hotspot at the empty spot in Picture 2', () => {
    let missing = null;
    let puzzle = null;
    for (const seed of SEEDS) {
      const candidate = makeScenePuzzle(5, seed);
      missing = candidate.diffs.find((diff) => diff.type === 'missing');
      if (missing) {
        puzzle = candidate;
        break;
      }
    }
    expect(missing).toBeTruthy();
    const width = 320;
    const height = 240;
    const px = (missing.left.x / 100) * width;
    const py = (missing.left.y / 100) * height;
    const others = puzzle.diffs.filter((diff) => diff.id !== missing.id).map((diff) => diff.id);
    expect(findDiffAt(puzzle, px, py, width, height, others)?.id).toBe(missing.id);
  });
});

describe('postcard album', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty and keeps the album key stable', () => {
    expect(POSTCARD_KEY).toBe('spotPostcards');
    expect(loadPostcards()).toEqual([]);
  });

  it('prepends a postcard with a timestamp and persists every card', () => {
    const one = addPostcard({ age: 3, seed: 11 }, localStorage);
    expect(one).toHaveLength(1);
    expect(one[0]).toMatchObject({ age: 3, seed: 11 });
    expect(typeof one[0].at).toBe('number');

    const two = addPostcard({ age: 4, seed: 12 }, localStorage);
    expect(two).toHaveLength(2);
    expect(two[0]).toMatchObject({ age: 4, seed: 12 });
    expect(two[1]).toMatchObject({ age: 3, seed: 11 });
    expect(loadPostcards()).toHaveLength(2);
  });

  it('keeps every card in storage but shows only the latest twelve', () => {
    for (let i = 0; i < 15; i += 1) addPostcard({ age: 5, seed: i }, localStorage);
    const all = loadPostcards();
    expect(all).toHaveLength(15);
    expect(all[0].seed).toBe(14);
    expect(latestPostcards(all)).toHaveLength(ALBUM_LIMIT);
    expect(latestPostcards(all)[0].seed).toBe(14);
    expect(latestPostcards(all, 3)).toHaveLength(3);
    expect(latestPostcards('nope')).toEqual([]);
  });

  it('tolerates corrupt or missing JSON', () => {
    localStorage.setItem(POSTCARD_KEY, '{not json');
    expect(loadPostcards()).toEqual([]);
    localStorage.setItem(POSTCARD_KEY, '{"nope":true}');
    expect(loadPostcards()).toEqual([]);
  });

  it('tolerates a storage that throws', () => {
    const broken = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('full');
      }
    };
    expect(loadPostcards(broken)).toEqual([]);
    expect(() => addPostcard({ age: 3, seed: 1 }, broken)).not.toThrow();
    expect(addPostcard({ age: 3, seed: 2 }, broken)).toHaveLength(1);
  });

  it('ships a five-picture set', () => {
    expect(SET_SIZE).toBe(5);
    expect(CAT_ZONE.x).toBeGreaterThan(60);
  });
});
