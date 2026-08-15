# 05 — Destructible Towers Prototype

Type: prototype
Status: open
Blocked by:

## Question

Can hand-rolled physics make destructible block towers feel right?

Build a cheap, rough prototype of the core Angry Birds feel — an emoji projectile launched on a parabolic arc colliding with a tower of destructible blocks that collapses under gravity — to answer:

- AABB vs. circle-block collision: what's the minimal collision model that feels right?
- Block stacking stability: how do blocks rest on each other without jitter or tunneling at the speeds we need?
- Destruction feel: what breaks, what crumbles, what stays? Impact thresholds per material (wood/ice/stone-style)?
- Performance: how many simultaneous bodies can move before the frame rate dies on a mid-range tablet?

Link the prototype as an asset from this issue. The answer becomes the physics section of the angry-emoji-2d spec and gates [04-angry-emoji-design](04-angry-emoji-design.md).

Resolves the fog: destructible-tower physics feel.
