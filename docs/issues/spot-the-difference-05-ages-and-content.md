# 05 — Spot the Difference: Ages and Content

## What to build

Tune the three Settings age bands for the Twin Postcards. Age 3 gets 9 props and 2 differences with the foreign-emoji aid; age 4 gets 11 and 3 with in-scene replacements; age 5+ gets 12 and 4. A set stays flat at the current band. The type mix stays readable and the moved prop stays in bounds.

## Acceptance criteria

- [ ] Age ≤3: 9 props, 2 differences; a swapped prop uses an emoji absent from the scene
- [ ] Age 4: 11 props, 3 differences; a swapped prop reuses an in-scene emoji
- [ ] Age 5+: 12 props, 4 differences; all four types appear when the count allows
- [ ] One difference of each available type per puzzle where possible
- [ ] Moves and resizes are visibly larger at age 3 than at age 5
- [ ] A moved prop always stays inside the panel and clear of the cat corner
- [ ] The same age band and difference count apply to all five puzzles in a set
- [ ] Changing the Settings band changes the next set, not the current one
- [ ] There is no ladder, level number or mastery flag
- [ ] Unit tests cover the age table, the type mix and the moved bounds
- [ ] E2E covers a puzzle at each age band
- [ ] No new dependencies

## Blocked by

- 02 — Twin Postcards Core
