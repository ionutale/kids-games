# 03 — Sorting: Motion and Sound Polish

## What to build

Make placement feel physical. A correct item arcs from the finger into the basket and its mini settles into the pile; the basket gives a soft bounce; pickup, correct, and miss each have a distinct, quiet voice. Keep the gentle return already built for a wrong basket, and make every animation safe under reduced motion.

## Acceptance criteria

- [ ] A correct item arcs into the basket instead of only disappearing
- [ ] The collected mini pops into the pile with a small settle
- [ ] The basket reacts to a correct drop with a soft bounce, not a hard snap
- [ ] Pickup, correct, and miss sounds are distinct
- [ ] Miss uses a quiet low tone; no sawtooth or harsh feedback
- [ ] Wrong-basket return still springs back to the item's slot
- [ ] Every animation respects `prefers-reduced-motion` without losing state
- [ ] No new dependencies

## Blocked by

None — can start immediately
