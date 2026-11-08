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
/** Extra collision padding around a Blocker so the stroke rests on its edge. */
export const BLOCKER_PAD = 8;
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
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist(a, c) <= r;
  let t = ((c.x - a.x) * dx + (c.y - a.y) * dy) / len2;
  t = clamp(t, 0, 1);
  const px = a.x + dx * t;
  const py = a.y + dy * t;
  return Math.hypot(c.x - px, c.y - py) <= r;
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

/** Closest Blocker hit by a→b, or null. Padded so the stroke never enters art. */
export function blockerHit(blockers, a, b) {
  let hit = null;
  let hitAt = Infinity;
  for (const blocker of blockers) {
    const r = blocker.r + BLOCKER_PAD;
    if (!segmentHitsCircle(a, b, blocker, r)) continue;
    const at = clipSegmentToCircle(a, b, blocker, r);
    const ahead = at ? dist(a, at) : 0;
    if (ahead < hitAt) {
      hit = blocker;
      hitAt = ahead;
    }
  }
  return hit;
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

function buildRoute(home, dest, curve, sign, level, layout) {
  const points = [];
  const bump = 8 * Math.sin((Math.PI * (level + layout)) / 5);
  for (let i = 0; i <= 36; i += 1) {
    const t = i / 36;
    points.push({
      x: home.x + (dest.x - home.x) * t + (curve + bump) * Math.sin(Math.PI * t) * sign,
      y: home.y + (dest.y - home.y) * t
    });
  }
  return points;
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

function placeBlockers(spec, route, rng, layout) {
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
      if (dist(candidate, spec.home) < r + 92 || dist(candidate, spec.dest) < r + 92) continue;
      if (placed.some((other) => dist(candidate, other) < r + other.r + 26)) continue;
      const blocksRoute = distanceToPath(route, candidate) <= r + 12;
      if (blocksRoute) continue;
      chosen = candidate;
    }
    if (chosen) placed.push(chosen);
  }
  return placed;
}

/**
 * Build the Scene for one ladder Step + Layout. Deterministic: same inputs give
 * the same cottage, cabin, route, Blockers and Stars.
 */
export function sceneFor(level, layout = 0) {
  const spec = levelSpec(level);
  const step = clamp(Math.round(layout) || 0, 0, LAYOUTS - 1);
  const sign = (spec.level + step) % 2 === 0 ? 1 : -1;
  const route = buildRoute(spec.home, spec.dest, spec.curve, sign, spec.level, step);
  const rng = makeRng(spec.level * 7919 + step * 104729 + 13);
  const stars = starSpots(route, spec.stars, step, rng).map((star, i) => ({
    ...star,
    id: `${spec.level}-${step}-${i}`,
    required: i < spec.required
  }));
  const blockers = placeBlockers(spec, route, rng, step);
  return {
    level: spec.level,
    layout: step,
    home: { ...spec.home },
    dest: { ...spec.dest },
    route,
    blockers,
    stars,
    required: Math.min(spec.required, stars.length)
  };
}
