# 03 — Cozy Memory: Devices and Final Gate

## What to build

Finish the memory makeover with the checks that keep it from regressing or leaking. Fit a full level-10 board on a small phone, prove the cozy route styles do not follow the player into another game, and run the complete test gate.

## Acceptance criteria

- [ ] Level 10 (24 cards) fits 320×568 without overlapping the ladder
- [ ] No horizontal overflow at 320×568 or 390×844
- [ ] The warm background and card styles do not appear on other game routes
- [ ] Reduced motion leaves every level playable
- [ ] `pnpm test`, the memory e2e suite, and `pnpm check` are green
- [ ] Screenshots at 390×844 and 1280×800 reviewed

## Blocked by

- 02 — Cozy Memory: Peek and Gentle Pace
