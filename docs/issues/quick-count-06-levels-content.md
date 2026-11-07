# 06 — Quick Count: Levels and Content

## What to build

Tune the ten-level ramp for the Flash Picnic. The count grows from 1–3 to 1–10, the flash shortens, and the goal grows with the level. The old distinct-emoji cap is retired by repeats.

## Acceptance criteria

- [ ] Counts are 1–3 at level 1, 1–6 at level 4, 1–8 at level 7 and 1–10 at level 10
- [ ] Flash duration follows `max(800, 3000 − 150·level)` ms
- [ ] Goal is 5 + min(level, 10) prompts
- [ ] Answer options are unique, non-negative and within the level range ±2
- [ ] Themes rotate across berries, eggs, cookies and apples
- [ ] The count ticks only on levels 1–2
- [ ] Level 10 keeps the mastery moment
- [ ] Unit tests cover the count ramp, options and goal
- [ ] E2E covers a late level
- [ ] No new dependencies

## Blocked by

- 03 — Flash Picnic Core
