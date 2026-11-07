# 04 — Sorting: Devices and Accessibility Gate

## What to build

The final quality gate for the cozy sorting game. Make the board usable by keyboard and screen reader, fit the larger boards on small phones, and prove it with the full test gate. This runs after the hint, content, and motion work has settled so it verifies the real thing.

## Acceptance criteria

- [ ] Items and baskets expose useful accessible names, including basket counts
- [ ] Focus rings are visible on every interactive element
- [ ] An item can be selected and placed with the keyboard alone
- [ ] The board fits 320×568 with no horizontal overflow and an unclipped ladder
- [ ] The board fits 390×844 with all four baskets and eight items
- [ ] A reduced-motion pass leaves every level playable
- [ ] `pnpm test`, the sorting e2e suite, and `pnpm check` are green

## Blocked by

- 01 — No Reading Required
- 02 — More Worlds, Real Curve
- 03 — Motion and Sound Polish
