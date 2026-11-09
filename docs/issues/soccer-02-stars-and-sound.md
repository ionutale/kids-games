# 02 — Soccer: Stars and Stadium Sound

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Honour ADR 0001 and make a goal feel like an event. Store the best stars per level in `soccerStars`, show them in a local star row above the shared ladder, and add the stadium sound set (whistle, kick, net, glove, miss, crowd). Goal and save juice should make each outcome legible.

## Acceptance criteria

- [x] Stars are 1/2/3 for 3/4/5 goals
- [x] The best stars per level are stored in `soccerStars` and survive a reload
- [x] A local star row above the ladder shows the best for the current level
- [x] The shared ladder remains untouched and shows no stars
- [x] A goal flashes the net and plays a net swish plus a quiet crowd cheer
- [x] A save plays a glove thud and shows the keeper's dive
- [x] A miss plays a whoosh, with no negative sting
- [x] A whistle opens each round after the first
- [x] Everything respects the existing sound setting
- [x] Sound and juice remain usable under reduced motion
- [x] Unit tests replace the old `starsFor(wasted)` tests with the stars-by-goals mapping, and cover the star store
- [x] E2E covers the local star row and its persistence

## Blocked by

- 01 — Night Penalty Core