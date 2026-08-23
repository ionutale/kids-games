/**
 * 20 level definitions — 4 tiers × 5 levels, deterministic layouts.
 * World space: 900×620, ground surface at y=580, slingshot at x≈150.
 *
 * Tier rules (from the spec):
 *  T1 (1–5):  single tower, wood only, no stone, ammo 1–2
 *  T2 (6–10): two towers, ice introduced, ammo 2
 *  T3 (11–15): stone appears, tougher targets, ammo 2
 *  T4 (16–20): multi-tower, boss target, ammo 3
 */

export const WORLD_W = 900;
export const WORLD_H = 620;
export const GROUND_Y = 580;
export const SLING = { x: 150, y: 500 };

function tower(x, baseY, floors, type, blockW = 46, blockH = 46) {
  const blocks = [];
  for (let i = 0; i < floors; i++) {
    blocks.push({ x, y: baseY - blockH / 2 - i * blockH, w: blockW, h: blockH, type });
  }
  return { blocks, topY: baseY - blockH * floors };
}

function tierOf(n) {
  return Math.min(4, Math.floor((n - 1) / 5) + 1);
}

function buildLevel(n) {
  const tier = tierOf(n);
  const blocks = [];
  const targets = [];
  let ammo = tier === 4 ? 3 : tier >= 2 ? 2 : n === 1 ? 1 : 2;

  // tower column helper positions drift right with level number for variety
  const colA = 560 + ((n % 5) * 14);
  const colB = 720 + ((n % 3) * 12);

  if (tier === 1) {
    const t = tower(colA, GROUND_Y - 23, 3 + (n % 3), 'wood');
    blocks.push(...t.blocks);
    targets.push({ x: colA, y: t.topY - 24, type: 'targetBasic' });
  } else if (tier === 2) {
    const leftType = 'wood';
    const rightType = 'ice';
    const a = tower(colA, GROUND_Y - 23, 4, leftType);
    const b = tower(colB, GROUND_Y - 23, 3, rightType);
    blocks.push(...a.blocks, ...b.blocks);
    targets.push({ x: colA, y: a.topY - 24, type: 'targetBasic' });
    targets.push({ x: colB, y: b.topY - 24, type: 'targetBasic' });
  } else if (tier === 3) {
    const a = tower(colA, GROUND_Y - 23, 5, n % 2 ? 'stone' : 'wood');
    const b = tower(colB, GROUND_Y - 23, 4, 'ice');
    blocks.push(...a.blocks, ...b.blocks);
    targets.push({ x: colA, y: a.topY - 24, type: n > 13 ? 'targetTough' : 'targetBasic' });
    targets.push({ x: colB, y: b.topY - 24, type: 'targetTough' });
  } else {
    const a = tower(colA - 40, GROUND_Y - 23, 5, 'stone');
    const b = tower(colB, GROUND_Y - 23, 6, 'wood');
    const c = tower(colB + 120, GROUND_Y - 23, 4, 'ice');
    blocks.push(...a.blocks, ...b.blocks, ...c.blocks);
    targets.push({ x: colA - 40, y: a.topY - 24, type: 'targetTough' });
    targets.push({ x: colB + 60, y: GROUND_Y - 30, type: 'targetBasic' });
    targets.push({
      x: colB,
      y: b.topY - 26,
      type: n >= 18 ? 'targetBoss' : 'targetTough'
    });
  }

  return { level: n, tier, ammo, blocks, targets };
}

export const LEVELS = Array.from({ length: 20 }, (_, i) => buildLevel(i + 1));

export function getLevel(n) {
  return LEVELS[Math.max(0, Math.min(19, n - 1))];
}
