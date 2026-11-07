# 06 — Path Builder: Levels and Content

## What to build

Turn the three prototype layouts into a full ten-level ladder with five Layouts per Level. Difficulty grows by distance, Blocker count and shape, and required Stars — never by timers or a bigger grid. Keep the existing progress keys, mastery rule and hub entry.

## Acceptance criteria

- [ ] Every Level has exactly five Layouts and auto-advances after each solve
- [ ] Levels 1–2 are open routes with almost no Blockers
- [ ] Levels 3–5 introduce one or two Blockers
- [ ] Levels 6–10 require one or two Stars and tighter routes
- [ ] Home and Destination stay on opposite sides at every Level
- [ ] Blockers never fully seal the Scene; every required Star is reachable
- [ ] Level 10 keeps the mastery moment; saved level/mastery keys are unchanged
- [ ] Layouts vary enough that a Level does not repeat the same scene
- [ ] Unit tests cover the Level → Scene configuration and route validity
- [ ] E2E covers a late Level and the ladder switch
- [ ] No new dependencies

## Blocked by

- 03 — Road Core
