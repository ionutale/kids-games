# 06 — Quick Count: Levels and Content

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Tune the ten-level ramp for the Flash Picnic. The count grows from 1–3 to 1–10, the flash shortens, and the goal grows with the level. The old distinct-emoji cap is retired by repeats.

## Acceptance criteria

- [x] Counts are 1–3 at level 1, 1–6 at level 4, 1–8 at level 7 and 1–10 at level 10
- [x] A dedicated `countMax(level)` supplies the ramp; `levelConfig.max` is not used
- [x] Flash duration follows `max(800, 3000 − 150·level)` ms
- [x] Goal is 5 + min(level, 10) prompts
- [x] Answer options are unique, at least 1, and within the level range ±2
- [x] Themes rotate across berries, eggs, cookies and apples
- [x] The count ticks only on levels 1–2
- [x] Level 10 keeps the mastery moment
- [x] Unit tests cover the count ramp, options and goal
- [x] E2E covers a late level
- [x] No new dependencies

## Blocked by

- 03 — Flash Picnic Core