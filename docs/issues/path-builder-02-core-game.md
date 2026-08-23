# 02 — Path Builder: Core Game + Hub + Tests

## What to build

Wire the engine into a Svelte component. Grid renders with Start, Goal, obstacles. Player taps adjacent cells to build a path. Auto-validates when path reaches Goal. 5 puzzles per level, increasing difficulty.

Files:
- `src/routes/games/path-builder/+page.svelte`
- `src/routes/games/path-builder/+page.js`

## Acceptance criteria

- [ ] Grid renders with Start (🚩), Goal (🏁), obstacles (🧱)
- [ ] Tapping a cell adds it to the path (highlights it)
- [ ] Only cells adjacent to the last path cell can be added
- [ ] Tapping an obstacle shows shake (rejected)
- [ ] Tapping an existing path cell removes it and everything after it
- [ ] When path reaches Goal → celebration + next puzzle
- [ ] 5 puzzles per level → "Level Complete" + next level
- [ ] Hint button highlights next optimal cell (3 per puzzle)
- [ ] Grid size and obstacle count scale with level
- [ ] Game appears in hub with icon
- [ ] Translation keys for all 3 languages
- [ ] CONTEXT.md updated
- [ ] Behavioral + E2E tests pass

## Blocked by

- 01 — Path Builder: Puzzle Engine
