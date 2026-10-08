// Penalty-shootout rules for the soccer game.
// The keeper patrols the goal; a shot lands as a goal, a save, or a miss.
// Level raises the keeper's share of the goal and how fast he moves.
// He always leaves a gap a ball can fit through.

export const BALL_START = { x: 50, y: 82 };
const BALL_RADIUS = 1.1;

export function targetScoreFor(level) {
  return Math.min(2 + level, 8);
}

export function goalBounds(level) {
  const w = Math.max(10, 24 - level);
  return { x0: 50 - w / 2, x1: 50 + w / 2, y0: 2, y1: 24 };
}

function coverFraction(level) {
  return Math.min(0.46, 0.28 + level * 0.018);
}

export function keeperHalfWidth(level) {
  const mouth = goalBounds(level).x1 - goalBounds(level).x0;
  return (mouth * coverFraction(level)) / 2;
}

/** Round trips per second along the goal mouth. */
export function keeperHz(level) {
  return 0.07 + (level - 1) * 0.03;
}

export function keeperCenter(level, tSeconds) {
  const goal = goalBounds(level);
  const half = keeperHalfWidth(level);
  const min = goal.x0 + half;
  const max = goal.x1 - half;
  if (max <= min) return 50;
  const phase = ((tSeconds * keeperHz(level)) % 1 + 1) % 1;
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

export function controlPoint(p0, p2) {
  const aimVec = { x: 50 - p0.x, y: 13 - p0.y };
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

/** Where the shot meets the goal: the release point if it lands in the mouth, otherwise the first path sample that enters it. */
export function impactPoint(p0, p2, level) {
  const goal = goalBounds(level);
  if (inMouth(p2, goal)) return p2;
  const p1 = controlPoint(p0, p2);
  for (let i = 1; i <= 20; i++) {
    const pt = quadPoint(p0, p1, p2, i / 20);
    if (inMouth(pt, goal)) return pt;
  }
  return null;
}

export function shotResult(p0, p2, level, keeperX) {
  if (Math.hypot(p2.x - p0.x, p2.y - p0.y) < 3) return 'miss';
  const impact = impactPoint(p0, p2, level);
  if (!impact) return 'miss';
  const goal = goalBounds(level);
  const reach = keeperHalfWidth(level) + BALL_RADIUS;
  if (Math.abs(impact.x - keeperX) <= reach) return 'save';
  return 'goal';
}

/** Release point in the wider gap beside the keeper. */
export function openAim(level, keeperX) {
  const goal = goalBounds(level);
  const half = keeperHalfWidth(level);
  const left = { a: goal.x0, b: keeperX - half };
  const right = { a: keeperX + half, b: goal.x1 };
  const gap = right.b - right.a >= left.b - left.a ? right : left;
  return { x: (gap.a + gap.b) / 2, y: (goal.y0 + goal.y1) / 2 };
}

/** Stars for a finished round. Every save or miss costs a star, down to one. */
export function starsFor(wastedShots) {
  if (wastedShots <= 0) return 3;
  if (wastedShots <= 2) return 2;
  return 1;
}
