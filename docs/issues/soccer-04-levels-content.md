# 04 — Soccer: Levels and Content

## What to build

Tune the ten-level ladder for the Night Penalty. Each level is a five-shot round with its own target, goal width and keeper speed. Stars persist per level and the local star row shows the best.

## Acceptance criteria

- [ ] Every level has exactly five shots
- [ ] Targets follow 3 goals at level 1 rising to 5 at level 10
- [ ] Goal width shrinks with the level, but never below the fairness floor
- [ ] Keeper coverage and patrol speed rise gently with the level
- [ ] The keeper still leaves the far corner open at level 10
- [ ] Stars are 1/2/3 for 3/4/5 goals and stored per level
- [ ] Level 10 keeps the mastery moment
- [ ] Unit tests cover the target curve, goal bounds and keeper at all levels
- [ ] An e2e pass at a late level proves the smaller goal and faster keeper stay fair
- [ ] No new dependencies

## Blocked by

- 01 — Night Penalty Core
