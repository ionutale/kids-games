# 06 — Focus Tap: Levels and Content

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Tune the ten-level ramp for the Pond Catch. The goal is 6 + level catches (cap 20), the spawn and rise speeds follow the existing config, and the lookalike tiers stay. The target should rotate within a round only if a new decision says so; for now it stays fixed.

## Acceptance criteria

- [x] Level 1 needs 7 catches; level 10 needs 16, capped at 20
- [x] Spawn interval and rise time follow the existing level config
- [x] Levels 1–2 use cross-category distractors
- [x] Levels 3–5 use same-category distractors
- [x] Levels 6–10 use lookalikes
- [x] The target is fixed for the whole round
- [x] Six items on screen at most, with the forced-target rule preserved
- [x] Level 10 keeps the mastery moment
- [x] Unit tests cover the goal and tier mapping
- [x] E2E covers a late level
- [x] No new dependencies

## Blocked by

- 03 — Pond Catch Core