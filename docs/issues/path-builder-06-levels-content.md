# 06 — Path Builder: Levels and Content

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Turn the three prototype layouts into a full ten-level ladder with five Layouts per Level. Difficulty grows by distance, Blocker count and shape, and required Stars — never by timers or a bigger grid. Keep the existing progress keys, mastery rule and hub entry.

## Acceptance criteria

- [x] Every Level has exactly five Layouts and auto-advances after each solve
- [x] Levels 1–2 are open routes with almost no Blockers
- [x] Levels 3–5 introduce one or two Blockers
- [x] Levels 6–10 require one or two Stars and tighter routes
- [x] Home and Destination stay on opposite sides at every Level
- [x] Blockers never fully seal the Scene; every required Star is reachable
- [x] Level 10 keeps the mastery moment; saved level/mastery keys are unchanged
- [x] Layouts vary enough that a Level does not repeat the same scene
- [x] Unit tests cover the Level → Scene configuration and route validity
- [x] E2E covers a late Level and the ladder switch
- [x] No new dependencies

## Blocked by

- 03 — Road Core