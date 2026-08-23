# 01 — Spot the Difference: Core Game + Hub + Tests

## What to build

Two emoji grids side-by-side (stacked on mobile). Player taps cells that differ. Difficulty by age: 3×3 to 5×5 grids, 1-5 differences.

Files:
- `src/routes/games/spot-the-difference/+page.svelte`
- `src/routes/games/spot-the-difference/+page.js`
- `src/lib/spot-the-difference/generator.js` — puzzle generation logic

## Acceptance criteria

- [ ] Two emoji grids render (stacked on mobile viewport)
- [ ] Puzzle generator creates N differences at random positions
- [ ] Tapping a difference cell highlights it on both grids
- [ ] Tapping a matching cell shows gentle shake feedback
- [ ] All differences found → celebration + "Next Puzzle" button
- [ ] Grid size and difference count match age setting
- [ ] Endless puzzles (Home button to exit)
- [ ] Running total of puzzles solved displayed
- [ ] Game appears in hub with icon
- [ ] Translation keys for all 3 languages
- [ ] CONTEXT.md updated
- [ ] Unit + behavioral + E2E tests pass

## Blocked by

None — can start immediately
