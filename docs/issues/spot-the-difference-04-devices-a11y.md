# 04 — Spot the Difference: Devices and Accessibility Gate

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Prove the Twin Postcards work on the target phones and for children who mute sound or reduce motion. Make the two pictures, the found differences and the set progress understandable without relying on colour alone.

## Acceptance criteria

- [x] The two panels, HUD and set-complete card fit 320×568 with no horizontal overflow
- [x] The layout fits 390×844 in portrait with both pictures fully visible
- [x] Every difference hotspot is at least ~44px in the shorter dimension at 320px
- [x] Picture 1 and Picture 2 are labelled for assistive technology
- [x] The found count and the set progress are announced as status text
- [x] A found difference is not conveyed by colour alone (✓ badge and ring shape)
- [x] The sound toggle mutes every harbor sound with no thrown errors
- [x] Reduced motion disables the cat bob, the hint pulse and the ring pop-in
- [x] The game remains fully playable under reduced motion
- [x] `pnpm test`, the spot-the-difference e2e suite and the `pnpm check` are green

## Blocked by

- 02 — Twin Postcards Core
- 03 — Harbor Juice and Sound