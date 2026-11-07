# 06 — Focus Tap: Levels and Content

## What to build

Tune the ten-level ramp for the Pond Catch. The goal is 6 + level catches (cap 20), the spawn and rise speeds follow the existing config, and the lookalike tiers stay. The target should rotate within a round only if a new decision says so; for now it stays fixed.

## Acceptance criteria

- [ ] Level 1 needs 7 catches; level 10 needs 16, capped at 20
- [ ] Spawn interval and rise time follow the existing level config
- [ ] Levels 1–2 use cross-category distractors
- [ ] Levels 3–5 use same-category distractors
- [ ] Levels 6–10 use lookalikes
- [ ] The target is fixed for the whole round
- [ ] Five items on screen at most, with the forced-target rule preserved
- [ ] Level 10 keeps the mastery moment
- [ ] Unit tests cover the goal and tier mapping
- [ ] E2E covers a late level
- [ ] No new dependencies

## Blocked by

- 03 — Pond Catch Core
