// Penalty-shootout rules for the Night Penalty.
//
// The camera sits behind the ball. The goal mouth is wide and shallow so it
// reads as a real goal and the bear keeper patrols sideways across it. A round
// is five shots; the level target (3 goals at level 1, 5 at level 10) decides
// the win, and stars are 1/2/3 for 3/4/5 goals.
//
// Fairness contract: the result depends on the keeper's x at release and on
// the impact point, never on the swipe length. A long swipe only means a faster
// flight; it cannot shrink the keeper's reach or turn a goal into a save.
import { MAX_LEVEL } from '#lib/ladder/progress.js';

export const SHOTS = 5;
export const BALL_START = { x: 50, y: 82 };

// A press with no real travel is a tap, not a swipe: it never spends a shot.
export const TAP_SLOP_PX = 8;
// Pointer travel that maps to the fastest flight. Length changes the flight
// time only; the outcome is always keeper-at-release plus impact point.
export const SWIPE_MIN_PX = 8;
export const SWIPE_MAX_PX = 150;

// The ball's radius in field percentage points, used for the save band.
const BALL_RADIUS = 1.1;
// The mouth is shallow: a low horizontal band high in the field.
const MOUTH_TOP = 5;
const MOUTH_BOTTOM = 15;
// The narrowest the mouth may become, so a late level still leaves two corners.
const MOUTH_FLOOR = 34;

function clampLevel(level) {
  const n = parseInt(level, 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_LEVEL, Math.max(1, n));
}

/** Goals needed to win: 3 at level 1, 4 from level 5, 5 from level 9. */
export function targetFor(level) {
  const n = clampLevel(level);
  return Math.min(5, 3 + Math.floor((n - 1) / 4));
}

/** Stars for a finished round: 3 goals earn one, 4 two, 5 three. */
export function starsForGoals(goals) {
  const n = Math.max(0, parseInt(goals, 10) || 0);
  if (n >= 5) return 3;
  if (n >= 4) return 2;
  if (n >= 3) return 1;
  return 0;
}

/**
 * Flight time in milliseconds from the pointer travel. A longer swipe is a
 * faster shot; it never changes whether the shot scores or is saved.
 */
export function flightDuration(travelPx, { calm = false } = {}) {
  const travel = Math.max(SWIPE_MIN_PX, Number(travelPx) || 0);
  const power = Math.min(
    1,
    (travel - SWIPE_MIN_PX) / (SWIPE_MAX_PX - SWIPE_MIN_PX)
  );
  return Math.round(calm ? 360 - 100 * power : 720 - 340 * power);
}

/** The wide, shallow goal mouth in field percentages, level 1 → level 10. */
export function goalBounds(level) {
  const n = clampLevel(level);
  const width = Math.max(MOUTH_FLOOR, 48 - (n - 1) * 1.6);
  return {
    x0: 50 - width / 2,
    x1: 50 + width / 2,
    y0: MOUTH_TOP,
    y1: MOUTH_BOTTOM
  };
}

/** Share of the mouth the keeper's body covers; rises gently with the level. */
function coverFraction(level) {
  return Math.min(0.46, 0.28 + clampLevel(level) * 0.018);
}

export function keeperHalfWidth(level) {
  const mouth = goalBounds(level).x1 - goalBounds(level).x0;
  return (mouth * coverFraction(level)) / 2;
}

/** Round trips per second along the goal mouth; rises gently with the level. */
export function keeperHz(level) {
  return 0.07 + (clampLevel(level) - 1) * 0.03;
}

/** The keeper's centre x at a moment in seconds: a continuous triangle patrol. */
export function keeperCenter(level, tSeconds) {
  const goal = goalBounds(level);
  const half = keeperHalfWidth(level);
  const min = goal.x0 + half;
  const max = goal.x1 - half;
  if (max <= min) return 50;
  const phase = (((tSeconds * keeperHz(level)) % 1) + 1) % 1;
  const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2;
  return min + (max - min) * tri;
}

export function quadPoint(p0, p1, p2, t) {
  const inv = 1 - t;
  return {
    x: inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x,
    y: inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y
  };
}

/** The single arc control point, shared by the aim preview and the flight. */
export function controlPoint(p0, p2) {
  const aimVec = { x: 50 - p0.x, y: (MOUTH_TOP + MOUTH_BOTTOM) / 2 - p0.y };
  const aimLen = Math.hypot(aimVec.x, aimVec.y) || 1;
  const perpAim = { x: -aimVec.y / aimLen, y: aimVec.x / aimLen };
  const lateral = (p2.x - p0.x) * perpAim.x + (p2.y - p0.y) * perpAim.y;
  return {
    x: (p0.x + p2.x) / 2 + perpAim.x * lateral * 0.35,
    y: (p0.y + p2.y) / 2 + perpAim.y * lateral * 0.35
  };
}

function inMouth(pt, goal) {
  return pt.x > goal.x0 && pt.x < goal.x1 && pt.y > goal.y0 && pt.y < goal.y1;
}

/**
 * Where the shot meets the goal: the release point when it already lands in
 * the mouth, otherwise the first point of the arc that is inside the mouth.
 * A swipe that passes through the mouth on its way over the bar still counts.
 */
export function impactPoint(p0, p2, level) {
  const goal = goalBounds(level);
  if (inMouth(p2, goal)) return p2;
  const p1 = controlPoint(p0, p2);
  // 40 samples keeps the first-entry detection inside the shallow mouth.
  for (let i = 1; i <= 40; i++) {
    const pt = quadPoint(p0, p1, p2, i / 40);
    if (inMouth(pt, goal)) return pt;
  }
  return null;
}

/**
 * The outcome of one shot. `keeperX` must be the keeper's x at release. There
 * is deliberately no power argument: swipe length never changes the result.
 */
export function shotResult(p0, p2, level, keeperX) {
  if (Math.hypot(p2.x - p0.x, p2.y - p0.y) < 3) return 'miss';
  const impact = impactPoint(p0, p2, level);
  if (!impact) return 'miss';
  const reach = keeperHalfWidth(level) + BALL_RADIUS;
  if (Math.abs(impact.x - keeperX) <= reach) return 'save';
  return 'goal';
}

/** The centre of the wider gap beside the keeper, in field percentages. */
export function openAim(level, keeperX) {
  const goal = goalBounds(level);
  const half = keeperHalfWidth(level);
  const left = { a: goal.x0, b: keeperX - half };
  const right = { a: keeperX + half, b: goal.x1 };
  const gap = right.b - right.a >= left.b - left.a ? right : left;
  return { x: (gap.a + gap.b) / 2, y: (goal.y0 + goal.y1) / 2 };
}

/** Levels that softly glow the open side of the goal as a teaching aid. */
export function openSideGlow(level) {
  return clampLevel(level) <= 2;
}
