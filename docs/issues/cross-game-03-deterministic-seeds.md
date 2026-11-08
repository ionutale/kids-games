# 03 — Cross-game: Deterministic Seeds

## What to build

Give every scene/round generator an explicit seed and a dev/test-only way to set it. Focus Tap and Quick Count already seed from the route load; Path Builder, Pop, Soccer and Spot need the same. A known seed reproduces a scene, blocker layout, bubble pattern, keeper phase or difference set; production still gets a fresh seed per round or set.

## Acceptance criteria

- [ ] Every scene/round generator takes a seed and is pure for that seed
- [ ] A dev/test `?seed=` hook (or a load-function seed) exists on Path Builder, Pop, Soccer and Spot
- [ ] Focus Tap and Quick Count keep their existing seed path
- [ ] The Soccer seed offsets the keeper patrol phase, so a timing test is reproducible
- [ ] Production defaults to a fresh seed per round or set
- [ ] E2E uses a seed for at least one deterministic test per game
- [ ] Seeds are not shown in the UI and are not saved as progress
- [ ] Unit tests cover same-seed/same-output and different-seed/different-output
- [ ] No new dependencies

## Foundation status (2026-11-07)

`src/lib/game/seed.js` landed with unit tests, and a hidden `?seed=` is wired on the existing Spot, Path Builder, Soccer and Pop routes. Verified in the browser: the same seed reproduces the Spot/Path grid, the first Pop bubble and the Soccer keeper phase; a different seed changes them. The new cores still consume the helper and add the per-game E2E assertions.

## Blocked by

None — do before the first game core. The six-game review (`2026-11-07-six-game-review.md`) is the source of the shared checklist.
