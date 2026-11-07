# 02 — Soccer: Stars and Stadium Sound

## What to build

Honour ADR 0001 and make a goal feel like an event. Store the best stars per level in `soccerStars`, show them in a local star row above the shared ladder, and add the stadium sound set (whistle, kick, net, glove, miss, crowd). Goal and save juice should make each outcome legible.

## Acceptance criteria

- [ ] Stars are 1/2/3 for 3/4/5 goals
- [ ] The best stars per level are stored in `soccerStars` and survive a reload
- [ ] A local star row above the ladder shows the best for the current level
- [ ] The shared ladder remains untouched and shows no stars
- [ ] A goal flashes the net and plays a net swish plus a quiet crowd cheer
- [ ] A save plays a glove thud and shows the keeper's dive
- [ ] A miss plays a whoosh, with no negative sting
- [ ] A whistle opens each round after the first
- [ ] Everything respects the existing sound setting
- [ ] Sound and juice remain usable under reduced motion
- [ ] Unit tests replace the old `starsFor(wasted)` tests with the stars-by-goals mapping, and cover the star store
- [ ] E2E covers the local star row and its persistence

## Blocked by

- 01 — Night Penalty Core
