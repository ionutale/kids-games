// Twin Postcards — a seaside harbor scene built for comparison, not for
// scanning emoji grids. Two pictures share `props`; `diffs` describes the four
// readable changes (swap, missing, moved, size). Everything here is pure so the
// route can stay a thin renderer and the tests can hit the generator directly.
import { makeRng, shuffle } from '#lib/trainers/rng.js';

export const SET_SIZE = 5;

export const DIFF_TYPES = ['swap', 'missing', 'moved', 'size'];

export const PROP_POOL = [
  '🐚', '🦀', '🐟', '🐠', '🦑', '🐙', '🦐',
  '⛵', '🚤', '🪣', '🕶️', '🎩', '🧢',
  '🍦', '🍋', '🍉', '🥤', '🪁', '🧺',
  '⚽', '🎈', '⚓', '🧭', '🔔', '🐦', '🦩', '🌊'
];

/** The cat occupies the bottom-right corner. Props stay out of it. */
export const CAT_ZONE = { x: 72, y: 58 };

export function inCatZone(x, y) {
  return x > CAT_ZONE.x && y > CAT_ZONE.y;
}

/**
 * Difficulty comes from the Settings age band, never from a ladder.
 * Ages 2 and 3 share the toddler band; from 5 every age uses the top band.
 */
export function ageSpec(ageLevel) {
  const age = Number(ageLevel) || 3;
  if (age <= 3) return { age: 3, props: 9, diffs: 2, move: 22, scale: 1.55 };
  if (age === 4) return { age: 4, props: 11, diffs: 3, move: 16, scale: 1.42 };
  return { age: 5, props: 12, diffs: 4, move: 13, scale: 1.32 };
}

// A jittered 5×4 lattice. The lattice keeps props spaced and in bounds even on
// a 320×568 phone; the jitter keeps two puzzles from looking like a spreadsheet.
// The top-left slot is left empty for the "Picture 1/2" badge and the
// bottom-right slot is the cat's corner.
const SLOTS = [];
for (const y of [12, 28, 44, 60]) {
  for (const x of [13, 31, 49, 67, 85]) {
    if (x <= 20 && y <= 16) continue;
    if (inCatZone(x, y)) continue;
    SLOTS.push({ x, y });
  }
}

function place(count, rng) {
  const chosen = shuffle(SLOTS, rng).slice(0, count);
  return chosen.map((slot) => ({
    x: Math.max(8, Math.min(92, slot.x + (rng() - 0.5) * 3)),
    y: Math.max(9, Math.min(70, slot.y + (rng() - 0.5) * 2.4))
  }));
}

function nearestPropDistance(props, x, y, skipId = -1) {
  let nearest = Infinity;
  for (const p of props) {
    if (p.id === skipId) continue;
    const d = Math.hypot(p.x - x, (p.y - y) * 0.78);
    if (d < nearest) nearest = d;
  }
  return nearest;
}

function moveTarget(base, props, spec, rng) {
  const directions = shuffle(
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1]
    ],
    rng
  );
  let best = null;
  let bestScore = -Infinity;
  for (const [dx, dy] of directions) {
    const x = Math.max(9, Math.min(91, base.x + dx * spec.move));
    const y = Math.max(10, Math.min(69, base.y + dy * spec.move * 0.72));
    if (inCatZone(x, y)) continue;
    const travelled = Math.hypot(x - base.x, (y - base.y) * 0.78);
    // A move that is mostly eaten by the panel edge is not a readable change.
    if (travelled < spec.move * 0.45) continue;
    const clearance = nearestPropDistance(props, x, y, base.id);
    // Prefer a roomy landing, then a clearly visible distance.
    const score = Math.min(clearance, 22) + Math.min(travelled, 32) * 1.4;
    if (score > bestScore) {
      bestScore = score;
      best = { x, y };
    }
  }
  // Every direction was crowded or in the cat corner: fall back to the roomiest
  // legal point rather than giving up on the moved difference.
  if (best) return best;
  return { x: Math.max(9, Math.min(60, base.x)), y: Math.max(10, base.y - spec.move * 0.72) };
}

function makeDiff(id, type, left, right) {
  return {
    id,
    type,
    left: { emoji: left.emoji, x: left.x, y: left.y, scale: left.scale },
    right: right
      ? { emoji: right.emoji, x: right.x, y: right.y, scale: right.scale }
      : null
  };
}

/**
 * Build one puzzle. Exactly `ageSpec(age).diffs` differences, each of a
 * different type as far as the count allows. Deterministic per seed.
 */
export function makeScenePuzzle(ageLevel, seed = Date.now()) {
  const spec = ageSpec(ageLevel);
  const rng = makeRng(seed);
  const spots = place(spec.props, rng);
  const emojis = shuffle(PROP_POOL, rng).slice(0, spec.props);
  const props = spots.map((spot, id) => ({
    id,
    emoji: emojis[id],
    x: spot.x,
    y: spot.y,
    scale: 1
  }));

  const sceneEmojis = new Set(props.map((p) => p.emoji));
  const diffIds = shuffle(
    props.map((p) => p.id),
    rng
  ).slice(0, spec.diffs);
  const types = shuffle(DIFF_TYPES, rng);
  const usedReplacements = new Set();

  const diffs = diffIds.map((id, index) => {
    const base = props[id];
    const type = types[index % types.length];

    if (type === 'swap') {
      let candidates;
      if (spec.age <= 3) {
        // Toddler aid: the replacement appears nowhere else in the picture.
        candidates = PROP_POOL.filter((e) => e !== base.emoji && !sceneEmojis.has(e));
      } else {
        // Older bands reuse an emoji already in the scene, so the child has to
        // compare positions instead of scanning for a foreign object.
        candidates = props
          .map((p) => p.emoji)
          .filter((e) => e !== base.emoji && !usedReplacements.has(e));
        if (!candidates.length) {
          candidates = props.map((p) => p.emoji).filter((e) => e !== base.emoji);
        }
      }
      if (!candidates.length) {
        candidates = PROP_POOL.filter((e) => e !== base.emoji);
      }
      const replacement = candidates[Math.floor(rng() * candidates.length) % candidates.length];
      usedReplacements.add(replacement);
      return makeDiff(id, type, base, { ...base, emoji: replacement });
    }

    if (type === 'missing') {
      return makeDiff(id, type, base, null);
    }

    if (type === 'moved') {
      const target = moveTarget(base, props, spec, rng);
      return makeDiff(id, type, base, { ...base, x: target.x, y: target.y });
    }

    return makeDiff(id, type, base, { ...base, scale: spec.scale });
  });

  return { age: spec.age, spec, seed, props, diffs };
}

/** The props to draw on one side. Missing props simply do not exist on the right. */
export function sceneFor(puzzle, side) {
  if (!puzzle) return [];
  const byId = new Map(puzzle.diffs.map((d) => [d.id, d]));
  return puzzle.props
    .map((prop) => {
      const diff = byId.get(prop.id);
      if (!diff) return prop;
      if (diff.type === 'missing') return side === 'left' ? { ...prop, diffType: diff.type } : null;
      const point = diff[side] ?? diff.left;
      return { ...point, id: prop.id, diffType: diff.type };
    })
    .filter(Boolean);
}

export function diffPoints(diff) {
  if (!diff) return [];
  if (diff.type === 'missing') return [{ x: diff.left.x, y: diff.left.y }];
  if (diff.type === 'moved' && diff.right) {
    return [
      { x: diff.left.x, y: diff.left.y },
      { x: diff.right.x, y: diff.right.y }
    ];
  }
  return [{ x: diff.left.x, y: diff.left.y }];
}

export function diffPointsPx(diff, width, height) {
  return diffPoints(diff).map((point) => ({
    x: (point.x / 100) * width,
    y: (point.y / 100) * height
  }));
}

export function diffCenterPx(diff, width, height) {
  const points = diffPointsPx(diff, width, height);
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length
  };
}

function distanceToSegment(px, py, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (!lengthSq) return Math.hypot(px - a.x, py - a.y);
  let t = ((px - a.x) * dx + (py - a.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
}

/** Generous circular hotspot (at least 22px, or 7% of the panel width). */
export function hotspotRadius(width) {
  return Math.max(22, width * 0.07);
}

/**
 * The nearest unfound difference under a tap. A moved prop is one capsule
 * between its two positions, so either end — or anywhere along the move —
 * counts. Found differences are ignored.
 */
export function findDiffAt(puzzle, px, py, width, height, found = []) {
  if (!puzzle) return null;
  const radius = hotspotRadius(width);
  let best = null;
  let bestDistance = Infinity;
  for (const diff of puzzle.diffs) {
    if (found.includes(diff.id)) continue;
    const points = diffPointsPx(diff, width, height);
    const distance =
      points.length > 1
        ? distanceToSegment(px, py, points[0], points[points.length - 1])
        : Math.hypot(px - points[0].x, py - points[0].y);
    if (distance <= radius && distance < bestDistance) {
      bestDistance = distance;
      best = diff;
    }
  }
  return best;
}
