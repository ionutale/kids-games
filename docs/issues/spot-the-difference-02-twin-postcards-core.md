# 02 — Spot the Difference: Twin Postcards Core

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Replace the abstract emoji grids with the harbor Twin Postcards. Two stacked picture panels show the same seaside harbor; a pier cat with a magnifier watches. Props are scattered across the scene, and 2/3/4 of them differ between the pictures. Tap a changed spot in either panel; both panels ring it. A wrong tap wobbles. After idling, one unfound difference pulses. Five solved puzzles make a set and add postcards to the album.

## Acceptance criteria

- [x] Two stacked harbor panels render in portrait with the lighthouse, pier, boats, gulls and the pier cat
- [x] Each panel shows 9–12 props placed without overlap and clear of the cat
- [x] Exactly 2 (age 3), 3 (age 4) or 4 (age 5+) differences are generated, drawn from swap, missing, moved and size
- [x] Tapping a difference in either panel rings it in both panels and adds a found token
- [x] A missing prop's found ring is drawn at the empty spot in Picture 2
- [x] A tap on a match only wobbles; it never counts or penalizes
- [x] A moved prop counts from either its old or its new position
- [x] After ~8s idle, one unfound difference pulses in both panels; the hint stops on solve
- [x] Solving shows a short postcard toast and advances after ~1s
- [x] The fifth solve opens a set-complete card with the album, Play again and Back
- [x] Each solve prepends a postcard to `spotPostcards`; the album survives a reload and shows the latest 12
- [x] The HUD shows found tokens and a five-slot set strip, with no digits
- [x] Every rendered prop has a stable id, so a puzzle update cannot duplicate a keyed block
- [x] The shared GameShell, hub entry and sound toggle are unchanged
- [x] No new dependencies; the old emoji-grid generator is retired
- [x] `tests/unit/spot-difference.test.js` is replaced by the new scene/hotspot/store tests
- [x] Unit tests cover the generator, hotspots and postcard store
- [x] E2E covers a find, a wrong tap, a full set and album persistence

## Blocked by

None — can start immediately