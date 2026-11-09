# 04 — Pop: Levels and Content

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Tune the ten-level ladder for the Rising Pond. Each level is one 30-second round with its own target, spawn rate, fall speed, concurrent cap and bubble types. Giant bubbles unlock at level 3 and star bubbles at level 6; the target grows 6→15; surprise variety grows.

## Acceptance criteria

- [x] One round per level; the shared ladder and saved level/mastery are unchanged
- [x] Targets follow 6→15 across levels 1–10
- [x] Levels 1–2 use normal bubbles only
- [x] Giant bubbles unlock at level 3 and need two taps
- [x] Star bubbles unlock at level 6 and leave a sticker
- [x] Spawn and fall speed grow gently; bubble size stays large
- [x] Surprise variety grows with the level
- [x] Level 10 keeps the mastery moment
- [x] Unit tests cover the level configuration and type unlocking
- [x] An e2e pass at a late level proves the larger target and types fit
- [x] No new dependencies

## Blocked by

- 01 — Rising Pond Core