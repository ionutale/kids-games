# 03 — Path Builder: Road Core

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Replace the grid board with the continuous Forest Road. A portrait Scene shows a cottage (Home) and a cabin (Destination) on opposite sides, with rocks, ponds and hedges as Blockers. The child draws a freehand Road; the fox Walker travels it; Stars collect as it passes. There is no timer and no fail state.

## Acceptance criteria

- [x] The Scene renders in portrait with no visible grid or tiles
- [x] Home and Destination sit on opposite sides and are always visible
- [x] Pressing anywhere seeds the Road at Home; dragging draws a freehand line
- [x] The Road persists after lifting; pressing near an earlier point truncates to it
- [x] Redraw clears the Road, collected Stars, and returns the fox Home
- [x] A stroke into a Blocker stops at its edge and does not consume the Road
- [x] When the Road reaches the Destination, the fox walks it automatically
- [x] Stars within the collection radius are collected as the fox passes
- [x] Arrival solves the Layout when the required Stars are collected
- [x] A missed required Star returns the fox and keeps the Road editable
- [x] The game no longer uses the retired grid engine for this route
- [x] Unit tests cover segment–circle collision, path sampling, and scene generation
- [x] E2E covers draw → walk → solve, and a stroke stopping at a Blocker
- [x] No new dependencies; SVG art only; existing progress keys unchanged

## Blocked by

None — can start immediately