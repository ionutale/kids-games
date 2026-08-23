export const POINTS = { target: 10, block: 5, unusedShot: 25 };

export function levelMaxScore(level) {
  const def = level; // a level definition object
  const targets = def.targets.length;
  const blocks = def.blocks.length;
  return targets * POINTS.target + blocks * POINTS.block + def.ammo * POINTS.unusedShot;
}

export function starsFor(score, maxScore, targetsDestroyed) {
  if (targetsDestroyed < 1) return 0;
  if (score >= maxScore * 0.9) return 3;
  if (score >= maxScore * 0.6) return 2;
  return 1;
}
