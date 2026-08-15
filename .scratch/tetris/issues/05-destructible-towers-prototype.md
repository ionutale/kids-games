# 05 — Destructible Towers Prototype

Type: prototype
Status: resolved
Blocked by:

## Verdict

User: **LGTM** — the AABB-only feel is good enough; the spec does NOT need rotating blocks.

## Answer

Prototype validated the physics core for the angry-emoji-2d spec:

- **Collision model**: AABB-only (no rotation) — accepted as the v1 model.
- **Stacking stability**: positional correction with 0.5px slop → 0px jitter on a 6-block tower.
- **Tunneling**: 4 fixed substeps per frame → no pass-through at 1750px/s (max launch speed).
- **Destruction feel**: kinetic-energy damage (speed² × impactor mass × 0.001), 150px/s threshold (resting contact never damages); wood hp 60, ice hp 25, stone hp 240.
- **Materials**: density wood 1.0 / ice 0.8 / stone 1.6; restitution wood 0.05 / ice 0.10 / stone 0.00; friction wood 0.5 / ice 0.05 / stone 0.7.
- **Performance**: ~0.1ms per step at 100+ bodies (≈600fps headroom) — comfortably holds 60fps on mid-range tablets.
- **Coulomb friction** required: without it, impacted walls slide forever on the ground (the "creep-through" artifact).

Context pointer: prototype at `src/lib/angry-emoji/phys-prototype.html` on branch `prototype/angry-emoji-towers` (commit 5fc2e89). Engine is a pure liftable module (`PHYS`) — the spec's physics section should reuse it directly.

## Question

Can hand-rolled physics make destructible block towers feel right?

Build a cheap, rough prototype of the core Angry Birds feel — an emoji projectile launched on a parabolic arc colliding with a tower of destructible blocks that collapses under gravity — to answer:

- AABB vs. circle-block collision: what's the minimal collision model that feels right?
- Block stacking stability: how do blocks rest on each other without jitter or tunneling at the speeds we need?
- Destruction feel: what breaks, what crumbles, what stays? Impact thresholds per material (wood/ice/stone-style)?
- Performance: how many simultaneous bodies can move before the frame rate dies on a mid-range tablet?

Link the prototype as an asset from this issue. The answer becomes the physics section of the angry-emoji-2d spec and gates [04-angry-emoji-design](04-angry-emoji-design.md).

Resolves the fog: destructible-tower physics feel.
