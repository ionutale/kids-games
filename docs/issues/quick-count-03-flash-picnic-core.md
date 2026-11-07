# 03 — Quick Count: Flash Picnic Core

## What to build

Replace the abstract panel with the bear picnic. The bear asks “How many?”; a brief flash of one repeated theme object lands on the checkered cloth; three pills show the digit and the matching dots. A correct answer lights a berry in the basket. The existing flash timing, goal and landing stay.

## Acceptance criteria

- [ ] The picnic renders in portrait with the bear, cloth and berry basket
- [ ] The flash shows N repeated theme objects in a non-overlapping layout
- [ ] The flash duration follows the existing level config
- [ ] Three answer pills show the digit plus that many theme dots
- [ ] A correct pill lights one berry in the basket and advances the prompt
- [ ] A wrong pill wobbles silently and does not advance
- [ ] The basket reaches the goal and the round ends with the ladder actions
- [ ] Counts are 1–3 at L1, 1–6 at L4 and 1–8 at L7
- [ ] The shared landing, play route level and ladder are unchanged
- [ ] E2E covers flash → answer → correct, and a wrong pill
- [ ] No new dependencies

## Blocked by

None — can start immediately
