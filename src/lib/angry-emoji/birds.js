/**
 * Per-shot projectile loadout, graduated by tier.
 * Index 0 of a plan is the LAST shot; the last index is the opener.
 * Tier 4's opener is always the fire bird so the shielded boss stays breakable.
 */
const PLANS = {
  1: ['bird'],
  2: ['ball', 'bird'],
  3: ['ball', 'birdFire'],
  4: ['bird', 'ball', 'birdFire']
};

export function birdForShot(tier, shotsLeft) {
  const plan = PLANS[tier] ?? PLANS[1];
  const idx = Math.max(0, Math.min(plan.length, shotsLeft) - 1);
  return plan[idx] ?? 'bird';
}
