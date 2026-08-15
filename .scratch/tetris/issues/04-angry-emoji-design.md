# 04 — Angry Emoji Design

Type: grilling
Status: resolved
Blocked by: 05

## Question

What are the exact design details for angry-emoji-2d?

- Scoring and stars: how are points computed (targets destroyed + shots remaining + damage done)? What are the 1/2/3-star thresholds per level tier?
- Shots (ammo) per level: fixed count per level, or does it vary by level design? What happens when ammo runs out — immediate failure or a chance to replay?
- Block materials: what are the equivalent materials (wood/ice/stone-style), what breaks each, and how do they read visually for kids?
- Trajectory preview: always on, or toggleable? How far does the dotted aim-line extend?
- Level design conventions: what rules-of-thumb for 20+ hand-crafted levels (bird placement, tower layouts, target count per level, difficulty tiers spanning the 20 levels)?
- The emoji cast: which emojis are projectiles, which are targets (angry emoji), and what do they look like at rest vs. hit?

Depends on the physics feel findings from [05-destructible-towers-prototype](05-destructible-towers-prototype.md).

Resolves the fog: star thresholds, ammo per level, block materials, trajectory preview, level-design conventions.

## Answer

Settled in grilling session (all recommendations accepted):

- **Scoring**: +10 per target destroyed, +5 per block knocked out, +25 per unused shot at level end. Stars: 1★ ≥1 target, 2★ ≥60% of max score, 3★ ≥90% of max score (max = all targets + all blocks + all shots unused).
- **Ammo**: varies per level (1–3 birds), tuned per layout.
- **Ammo exhaustion**: level ends, remaining targets shown, replay prompt appears; unused shots drop out of the score.
- **Materials**: wood/ice/stone from the validated prototype, with kid-readable looks (logs/icicles/boulders) and a crack overlay at ≤40% HP.
- **Trajectory preview**: always-on dotted aim-line (as in the prototype), showing the first bounce point.
- **Level design**: 4 tiers × 5 levels (20 total) — T1 single tower/1 bird/no stone; T2 mixed materials/2 birds; T3 stone + shields/2–3 birds; T4 multi-tower + moving blocks/3 birds; tiers unlock sequentially.
- **Emoji cast**: projectiles 😡 (default), 🐦🔥 (breaks stone), 🧱 (bouncy); targets 😠 (basic), 🤬 (2 hits), 👿 (boss, shielded). Rest = neutral face; hit = cracked face + circling stars.
