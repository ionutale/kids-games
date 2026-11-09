// Pop — the Rising Pond rules.
//
// One 30-second round per ladder level. Bubbles rise from the water carrying a
// surprise; the jar fills by POINTS (normal +1, giant +2, star +2) and the
// target decides whether the round ends as a win. No digits are ever drawn on
// the play surface: the jar is the score and the moon is the clock.
import { MAX_LEVEL } from '#lib/ladder/progress.js';

export const ROUND_SECONDS = 30;

export const SURPRISES = ['fish', 'starfish', 'shell', 'flower', 'butterfly'];

// Cumulative chances, so the star band sits below the giant band.
export const STAR_CHANCE = 0.1;
export const GIANT_CHANCE = 0.34;

export const BUBBLE_SIZE = {
  normal: [48, 60],
  giant: 86,
  star: 56
};

function clampLevel(level) {
  const n = parseInt(level, 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_LEVEL, Math.max(1, n));
}

/** Points needed in the jar: 6 at level 1, 15 at level 10. */
export function targetFor(level) {
  return Math.min(5 + clampLevel(level), 15);
}

/** Unlocked bubble types, in teaching order. */
export function typesFor(level) {
  const n = clampLevel(level);
  if (n >= 6) return ['normal', 'giant', 'star'];
  if (n >= 3) return ['normal', 'giant'];
  return ['normal'];
}

/** The surprise pool grows with the level: 2 kinds at L1, all 5 from L7. */
export function surpriseCountFor(level) {
  return Math.min(SURPRISES.length, 2 + Math.floor((clampLevel(level) - 1) / 2));
}

export function surprisePoolFor(level) {
  return SURPRISES.slice(0, surpriseCountFor(level));
}

/**
 * Pick a bubble type for one spawn. `rand` is injectable so tests (and the
 * `?seed=` hook) get a deterministic pond.
 */
export function pickType(types = ['normal'], rand = Math.random) {
  const r = rand();
  if (types.includes('star') && r < STAR_CHANCE) return 'star';
  if (types.includes('giant') && r < GIANT_CHANCE) return 'giant';
  return 'normal';
}

/** Diameter in px. Normal bubbles breathe between 48 and 60. */
export function bubbleSize(type, rand = Math.random) {
  if (type === 'giant') return BUBBLE_SIZE.giant;
  if (type === 'star') return BUBBLE_SIZE.star;
  const [min, max] = BUBBLE_SIZE.normal;
  return min + rand() * (max - min);
}

/** Jar points for a pop. Giant and star are collected twice. */
export function popValue(type) {
  return type === 'normal' ? 1 : 2;
}

/**
 * The trinkets pushed into the jar for one pop: one per point, so the minis
 * always match the fill. A star bubble leaves two star stickers' worth of gold.
 */
export function miniKinds(type, item) {
  const kind = type === 'star' ? 'star' : item;
  return Array.from({ length: popValue(type) }, () => kind);
}

/** Clamped 0..1 for the jar fill bar. */
export function jarPercent(points, target) {
  const t = Math.max(1, parseInt(target, 10) || 1);
  const p = Math.max(0, parseInt(points, 10) || 0);
  return Math.min(1, p / t);
}

export function jarIsFull(points, target) {
  return Math.max(0, points) >= Math.max(1, target);
}

/**
 * Per-level tuning. `spawnMs` and `fallSec` shrink as the level rises (lower is
 * faster), while the concurrent cap and the surprise pool grow. Bubble sizes
 * stay large at every level.
 */
export function levelConfig(level) {
  const n = clampLevel(level);
  return {
    level: n,
    target: targetFor(n),
    spawnMs: Math.max(480, Math.round(830 - n * 35)),
    fallSec: Number((9.3 - n * 0.28).toFixed(2)),
    maxItems: 6 + Math.ceil(n / 2),
    types: typesFor(n),
    surprises: surpriseCountFor(n)
  };
}
