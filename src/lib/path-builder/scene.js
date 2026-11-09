// Forest Road scene model: a portrait continuous world (620×1000) with a
// cottage (Home), a cabin (Destination), circular Blockers and Stars laid on a
// suggested route. No grid, no cells — everything here is plain geometry.
import { makeRng } from '#lib/trainers/rng.js';

export const W = 620;
export const H = 1000;
export const LEVELS = 10;
export const LAYOUTS = 5;

/** Pointer distance that still counts as "the destination is reached". */
export const DEST_RADIUS = 62;
/** Forgiving distance at which the Walker collects a Star. */
export const STAR_RADIUS = 46;
/** Half the visible Road stroke width: the tip's centre rests this far outside
 *  the Blocker art so the drawn edge of the Road meets the drawn edge of the art. */
export const ROAD_HALF = 11;
/** Collision padding around a Blocker. Equal to the Road half-width, so the
 *  stroke stops with its visible edge on the Blocker's drawn edge. */
export const BLOCKER_PAD = ROAD_HALF;
/** Tolerance around a Blocker edge, so a tip resting exactly on it can move again. */
export const EDGE_EPS = 1.5;
/**
 * How much of its 64×64 icon box each Blocker drawing covers, as a fraction of
 * the box half-width (measured to the outer edge of its stroke). The page scales
 * the icon by 1/extent, which makes the drawn radius equal the collision radius.
 */
export const BLOCKER_ART_EXTENT = { rock: 0.9375, pond: 0.928, hedge: 0.975 };
/** How close a press must be to an earlier road point to truncate there. */
export const TRUNCATE_RADIUS = 44;
/** How close a press must be to the road tip to keep drawing. */
export const CONTINUE_RADIUS = 90;

export function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function near(a, b, radius) {
  return dist(a, b) <= radius;
}

/**
 * True when the segment a→b touches the circle (center c, radius r).
 * Used both for road collision and for keeping Blockers off the guide route.
 */
export function segmentHitsCircle(a, b, c, r) {
  return dist(closestOnSegment(a, b, c), c) <= r;
}

/** Point on the segment a→b closest to p (clamped to the segment). */
export function closestOnSegment(a, b, p) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return { x: a.x, y: a.y };
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / len2, 0, 1);
  return { x: a.x + dx * t, y: a.y + dy * t };
}

/**
 * First point where a→b enters the circle, or null when it never does.
 * A segment that starts inside reports its start point.
 */
export function clipSegmentToCircle(a, b, c, r) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const fx = a.x - c.x;
  const fy = a.y - c.y;
  const A = dx * dx + dy * dy;
  const C = fx * fx + fy * fy - r * r;
  if (A === 0) return C <= 0 ? { x: a.x, y: a.y } : null;
  const B = 2 * (fx * dx + fy * dy);
  const disc = B * B - 4 * A * C;
  if (disc < 0) return null;
  if (C <= 0) return { x: a.x, y: a.y };
  const root = Math.sqrt(disc);
  const t = (-B - root) / (2 * A);
  if (t < 0 || t > 1) return null;
  return { x: a.x + dx * t, y: a.y + dy * t };
}

/** Shortest distance from p to the polyline (not just its vertices). */
export function distanceToPath(points, p) {
  let best = Infinity;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = clamp(t, 0, 1);
    const d = Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
    if (d < best) best = d;
  }
  return points.length === 1 ? dist(points[0], p) : best;
}

export function pathLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += dist(points[i - 1], points[i]);
  return total;
}

/** Point at normalized arc length t (0..1) with the segment heading angle. */
export function pointAt(points, t) {
  if (!points || points.length === 0) return null;
  if (points.length === 1) return { ...points[0], angle: 0 };
  const total = pathLength(points);
  const target = clamp(t, 0, 1) * total;
  let walked = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const length = dist(a, b);
    const last = i === points.length - 1;
    if (walked + length >= target || last) {
      const u = length === 0 ? 0 : (target - walked) / length;
      return {
        x: a.x + (b.x - a.x) * u,
        y: a.y + (b.y - a.y) * u,
        angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
      };
    }
    walked += length;
  }
  return { ...points[points.length - 1], angle: 0 };
}

/** Index of the nearest road point within `radius`, or -1. */
export function nearestRoadIndex(points, p, radius) {
  let best = -1;
  let bestDist = radius;
  for (let i = 0; i < points.length; i += 1) {
    const d = dist(points[i], p);
    if (d <= bestDist) {
      best = i;
      bestDist = d;
    }
  }
  return best;
}

/**
 * Blocker that stops a stroke from `a` to `b`, or null.
 *
 * A tip resting exactly on a Blocker's padded edge (the normal result of a
 * previous collision) is allowed to slide along that edge or move away from it;
 * only motion that pushes deeper into the circle is refused. Without this,
 * every later segment started on the edge counts as a fresh hit and the Road
 * freezes for good.
 */
export function blockerHit(blockers, a, b) {
  let hit = null;
  let hitAt = Infinity;
  for (const blocker of blockers) {
    const r = blocker.r + BLOCKER_PAD;
    const closest = closestOnSegment(a, b, blocker);
    if (dist(closest, blocker) >= r - EDGE_EPS) continue;
    const touching = dist(a, blocker) <= r + EDGE_EPS;
    const at = touching ? { x: a.x, y: a.y } : clipSegmentToCircle(a, b, blocker, r);
    if (!at) continue;
    const ahead = dist(a, at);
    if (ahead < hitAt) {
      hit = blocker;
      hitAt = ahead;
    }
  }
  return hit;
}

/** Icon box width that makes a Blocker's drawn radius equal its collision radius. */
export function blockerArtSize(blocker) {
  return (blocker.r * 2) / (BLOCKER_ART_EXTENT[blocker.kind] ?? 0.9375);
}

/** Radius the Blocker art actually draws, in scene units. */
export function blockerArtRadius(blocker) {
  return (blockerArtSize(blocker) / 2) * (BLOCKER_ART_EXTENT[blocker.kind] ?? 0.9375);
}

export function roadReachesDestination(scene, road) {
  return road.length > 1 && road.some((p) => dist(p, scene.dest) <= DEST_RADIUS);
}

export function starCollected(position, star) {
  return dist(position, star) <= STAR_RADIUS;
}

/** Count of required Stars already gathered. Optional Stars do not count. */
export function requiredStarsCollected(scene, collected) {
  return scene.stars.filter((star) => star.required && collected.includes(star.id)).length;
}

/** Solved when every required Star was gathered on the walk. */
export function hasRequiredStars(scene, collected) {
  return requiredStarsCollected(scene, collected) >= scene.required;
}

const LEVEL_CONFIG = [
  { blockers: 0, stars: 0, required: 0 },
  { blockers: 0, stars: 0, required: 0 },
  { blockers: 1, stars: 1, required: 0 },
  { blockers: 1, stars: 1, required: 0 },
  { blockers: 2, stars: 1, required: 0 },
  { blockers: 2, stars: 1, required: 1 },
  { blockers: 2, stars: 1, required: 1 },
  { blockers: 2, stars: 1, required: 1 },
  { blockers: 3, stars: 2, required: 2 },
  { blockers: 3, stars: 2, required: 2 }
];

const BLOCKER_KINDS = ['rock', 'pond', 'hedge'];

/** Per-level difficulty: distance grows, then Blockers, then required Stars. */
export function levelSpec(level) {
  const n = clamp(Math.round(level) || 1, 1, LEVELS);
  const config = LEVEL_CONFIG[n - 1];
  const t = (n - 1) / (LEVELS - 1);
  return {
    level: n,
    blockers: config.blockers,
    stars: config.stars,
    required: config.required,
    home: { x: 116 + 12 * t, y: 830 + 46 * t },
    dest: { x: 504 - 12 * t, y: 172 - 46 * t },
    // A gentle early curve that widens into a proper winding road later.
    curve: 30 + 9 * n,
    clearance: 36 - 1.2 * n
  };
}

/**
 * Per-Layout presentation shifts. Home stays bottom-left and the cabin
 * top-right (the "opposite sides" rule), but the exact spots, the sway of the
 * suggested route and the phase of its second bend all change, so five Layouts
 * never look like the same road re-rendered.
 */
const LAYOUT_SHIFTS = [
  { home: { x: -18, y: 12 }, dest: { x: 16, y: -12 }, sway: 0.86, phase: 0.4, bend: 1.0 },
  { home: { x: 10, y: -16 }, dest: { x: -14, y: 10 }, sway: 1.14, phase: 1.5, bend: 1.25 },
  { home: { x: -6, y: 20 }, dest: { x: 20, y: 6 }, sway: 0.96, phase: 2.7, bend: 0.8 },
  { home: { x: 16, y: 0 }, dest: { x: -20, y: -16 }, sway: 1.22, phase: 3.9, bend: 1.15 },
  { home: { x: 0, y: -8 }, dest: { x: 4, y: 18 }, sway: 1.05, phase: 5.1, bend: 0.9 }
];

function layoutShift(layout) {
  return LAYOUT_SHIFTS[clamp(Math.round(layout) || 0, 0, LAYOUTS - 1)];
}

function buildRoute(spec, sign, layout) {
  const shift = layoutShift(layout);
  const home = { x: spec.home.x + shift.home.x, y: spec.home.y + shift.home.y };
  const dest = { x: spec.dest.x + shift.dest.x, y: spec.dest.y + shift.dest.y };
  const points = [];
  const bump = 8 * Math.sin((Math.PI * (spec.level + layout)) / 5);
  for (let i = 0; i <= 36; i += 1) {
    const t = i / 36;
    const arc = Math.sin(Math.PI * t);
    const wave =
      (spec.curve + bump) * arc +
      spec.curve * 0.34 * Math.sin(2 * Math.PI * t + shift.phase) * arc * shift.bend;
    points.push({
      x: home.x + (dest.x - home.x) * t + shift.sway * sign * wave,
      y: home.y + (dest.y - home.y) * t + 10 * Math.sin(2 * Math.PI * t + shift.phase) * arc
    });
  }
  return { home, dest, points };
}

function starSpots(route, count, layout, rng) {
  const spots = [];
  if (count === 0) return spots;
  const fractions =
    count === 1
      ? [0.42 + 0.04 * layout + rng() * 0.04]
      : [0.33 + 0.03 * layout + rng() * 0.03, 0.68 + 0.02 * layout + rng() * 0.03];
  fractions.forEach((f) => {
    const p = pointAt(route, f);
    spots.push({ x: p.x, y: p.y });
  });
  return spots;
}

function placeBlockers(spec, route, home, dest, rng, layout) {
  const placed = [];
  for (let i = 0; i < spec.blockers; i += 1) {
    const kind = BLOCKER_KINDS[(i + layout + spec.level) % BLOCKER_KINDS.length];
    const r = kind === 'rock' ? 58 + spec.level * 1.4 : kind === 'pond' ? 50 + spec.level : 44 + spec.level;
    let chosen = null;
    for (let attempt = 0; attempt < 90 && !chosen; attempt += 1) {
      const u = 0.2 + rng() * 0.6;
      const idx = clamp(Math.round(u * (route.length - 1)), 2, route.length - 3);
      const base = route[idx];
      const next = route[idx + 1];
      const prev = route[idx - 1];
      const tx = next.x - prev.x;
      const ty = next.y - prev.y;
      const len = Math.hypot(tx, ty) || 1;
      const side = (i + layout + attempt) % 2 === 0 ? 1 : -1;
      const nx = (-ty / len) * side;
      const ny = (tx / len) * side;
      const gap = spec.clearance + rng() * 14;
      const x = base.x + nx * (r + gap);
      const y = base.y + ny * (r + gap);
      const candidate = { x, y, r, kind };
      if (x - r < 14 || x + r > W - 14 || y - r < 120 || y + r > H - 90) continue;
      if (dist(candidate, home) < r + 92 || dist(candidate, dest) < r + 92) continue;
      if (placed.some((other) => dist(candidate, other) < r + other.r + 26)) continue;
      const blocksRoute = distanceToPath(route, candidate) <= r + 12;
      if (blocksRoute) continue;
      chosen = candidate;
    }
    if (chosen) placed.push(chosen);
  }
  return placed;
}

// Forest dressing anchors. Each Layout jitters them and shifts a soft clearing,
// so two Layouts of the same Level read as two different places.
const TREE_ANCHORS = [
  { x: 52, y: 140, s: 52 },
  { x: 566, y: 190, s: 46 },
  { x: 46, y: 410, s: 60 },
  { x: 574, y: 500, s: 54 },
  { x: 58, y: 740, s: 64 },
  { x: 560, y: 830, s: 58 },
  { x: 84, y: 930, s: 50 },
  { x: 540, y: 960, s: 48 }
];

const MUSHROOM_ANCHORS = [
  { x: 70, y: 640, s: 26 },
  { x: 548, y: 700, s: 22 },
  { x: 110, y: 960, s: 24 },
  { x: 520, y: 950, s: 20 }
];

const FIREFLY_ANCHORS = [
  { x: 150, y: 250 },
  { x: 470, y: 300 },
  { x: 90, y: 560 },
  { x: 540, y: 620 },
  { x: 200, y: 940 },
  { x: 460, y: 900 }
];

const CLEARING_ANCHORS = [
  { x: 330, y: 640, rx: 210, ry: 150 },
  { x: 250, y: 720, rx: 176, ry: 128 },
  { x: 388, y: 552, rx: 196, ry: 158 },
  { x: 286, y: 486, rx: 168, ry: 138 },
  { x: 356, y: 756, rx: 188, ry: 142 }
];

function decorFor(layout, rng) {
  const jitter = (n) => (rng() - 0.5) * n;
  const trees = TREE_ANCHORS.map((spot) => ({
    kind: 'tree',
    x: clamp(spot.x + jitter(24) + (layout - 2) * 3, 28, W - 28),
    y: clamp(spot.y + jitter(30), 104, H - 22),
    s: Math.round(spot.s + jitter(10))
  }));
  const mushrooms = MUSHROOM_ANCHORS.map((spot, i) => ({
    kind: 'mushroom',
    x: clamp(spot.x + jitter(18) + (i % 2 === 0 ? -layout * 3 : layout * 3), 24, W - 24),
    y: clamp(spot.y + jitter(22), 120, H - 18),
    s: Math.round(spot.s + jitter(6))
  }));
  const fireflies = FIREFLY_ANCHORS.map((spot) => ({
    kind: 'firefly',
    x: clamp(spot.x + jitter(36) + layout * 5, 20, W - 20),
    y: clamp(spot.y + jitter(40) - layout * 4, 110, H - 30),
    s: 0
  }));
  return [...trees, ...mushrooms, ...fireflies];
}

function clearingFor(layout, rng) {
  const base = CLEARING_ANCHORS[layout % CLEARING_ANCHORS.length];
  return {
    x: clamp(base.x + (rng() - 0.5) * 40, 190, W - 190),
    y: clamp(base.y + (rng() - 0.5) * 50, 280, H - 240),
    rx: base.rx,
    ry: base.ry
  };
}

/** One comparable string for everything a child sees in a Scene. Tests use it
 *  to prove five Layouts differ on screen, not only in their route points. */
export function sceneSignature(scene) {
  const r = (n) => Math.round(n);
  return [
    `${r(scene.home.x)},${r(scene.home.y)}`,
    `${r(scene.dest.x)},${r(scene.dest.y)}`,
    `${r(scene.clearing.x)},${r(scene.clearing.y)},${r(scene.clearing.rx)},${r(scene.clearing.ry)}`,
    scene.route.map((p) => `${r(p.x)},${r(p.y)}`).join(' '),
    scene.blockers.map((b) => `${b.kind}:${r(b.x)},${r(b.y)},${r(b.r)}`).join(' '),
    scene.stars.map((s) => `${s.required ? 'r' : 'o'}:${r(s.x)},${r(s.y)}`).join(' '),
    scene.decor.map((d) => `${d.kind}:${r(d.x)},${r(d.y)},${d.s}`).join(' ')
  ].join('|');
}

/**
 * Build the Scene for one ladder Step + Layout. Deterministic: same inputs give
 * the same cottage, cabin, route, Blockers, Stars and forest dressing.
 */
export function sceneFor(level, layout = 0) {
  const spec = levelSpec(level);
  const step = clamp(Math.round(layout) || 0, 0, LAYOUTS - 1);
  const sign = (spec.level + step) % 2 === 0 ? 1 : -1;
  const { home, dest, points: route } = buildRoute(spec, sign, step);
  const rng = makeRng(spec.level * 7919 + step * 104729 + 13);
  const stars = starSpots(route, spec.stars, step, rng).map((star, i) => ({
    ...star,
    id: `${spec.level}-${step}-${i}`,
    required: i < spec.required
  }));
  const blockers = placeBlockers(spec, route, home, dest, rng, step);
  const decor = decorFor(step, rng);
  const clearing = clearingFor(step, rng);
  return {
    level: spec.level,
    layout: step,
    home,
    dest,
    route,
    blockers,
    stars,
    decor,
    clearing,
    required: Math.min(spec.required, stars.length)
  };
}

