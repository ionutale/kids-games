# 03 — Quick Count: Flash Picnic Core

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Replace the abstract panel with the bear picnic. The bear asks “How many?”; a brief flash of one repeated theme object lands on the checkered cloth; three pills show the digit and the matching dots. A correct answer lights a berry in the basket. The existing flash timing, goal and landing stay.

## Acceptance criteria

- [x] The picnic renders in portrait with the bear, cloth and berry basket
- [x] The flash shows N repeated theme objects in a non-overlapping layout
- [x] The flash duration follows the existing level config
- [x] Three answer pills show the digit plus that many theme dots
- [x] A correct pill lights one berry in the basket and advances the prompt
- [x] A wrong pill wobbles silently and does not advance
- [x] The basket reaches the goal and the round ends with the ladder actions
- [x] Counts are 1–3 at L1, 1–6 at L4 and 1–8 at L7
- [x] The shared landing, play route level and ladder are unchanged
- [x] E2E covers flash → answer → correct, and a wrong pill
- [x] No new dependencies

## Blocked by

None — can start immediately