# 04 — Soccer: Levels and Content

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Tune the ten-level ladder for the Night Penalty. Each level is a five-shot round with its own target, goal width and keeper speed. Stars persist per level and the local star row shows the best.

## Acceptance criteria

- [x] Every level has exactly five shots
- [x] Targets follow 3 goals at level 1 rising to 5 at level 10
- [x] Goal width shrinks with the level, but never below the fairness floor
- [x] Keeper coverage and patrol speed rise gently with the level
- [x] The keeper still leaves the far corner open at level 10
- [x] Stars are 1/2/3 for 3/4/5 goals and stored per level
- [x] Level 10 keeps the mastery moment
- [x] Unit tests replace the old `targetScoreFor` test with the 3→5 curve, and cover the goal bounds and keeper at all levels
- [x] An e2e pass at a late level proves the smaller goal and faster keeper stay fair
- [x] No new dependencies

## Blocked by

- 01 — Night Penalty Core