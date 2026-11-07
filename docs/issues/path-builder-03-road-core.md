# 03 — Path Builder: Road Core

## What to build

Replace the grid board with the continuous Forest Road. A portrait Scene shows a cottage (Home) and a cabin (Destination) on opposite sides, with rocks, ponds and hedges as Blockers. The child draws a freehand Road; the fox Walker travels it; Stars collect as it passes. There is no timer and no fail state.

## Acceptance criteria

- [ ] The Scene renders in portrait with no visible grid or tiles
- [ ] Home and Destination sit on opposite sides and are always visible
- [ ] Pressing anywhere seeds the Road at Home; dragging draws a freehand line
- [ ] The Road persists after lifting; pressing near an earlier point truncates to it
- [ ] Redraw clears the Road, collected Stars, and returns the fox Home
- [ ] A stroke into a Blocker stops at its edge and does not consume the Road
- [ ] When the Road reaches the Destination, the fox walks it automatically
- [ ] Stars within the collection radius are collected as the fox passes
- [ ] Arrival solves the Layout when the required Stars are collected
- [ ] A missed required Star returns the fox and keeps the Road editable
- [ ] The game no longer uses the retired grid engine for this route
- [ ] Unit tests cover segment–circle collision, path sampling, and scene generation
- [ ] E2E covers draw → walk → solve, and a stroke stopping at a Blocker
- [ ] No new dependencies; SVG art only; existing progress keys unchanged

## Blocked by

None — can start immediately
