# 04 — Spot the Difference: Devices and Accessibility Gate

## What to build

Prove the Twin Postcards work on the target phones and for children who mute sound or reduce motion. Make the two pictures, the found differences and the set progress understandable without relying on colour alone.

## Acceptance criteria

- [ ] The two panels, HUD and set-complete card fit 320×568 with no horizontal overflow
- [ ] The layout fits 390×844 in portrait with both pictures fully visible
- [ ] Every difference hotspot is at least ~44px in the shorter dimension at 320px
- [ ] Picture 1 and Picture 2 are labelled for assistive technology
- [ ] The found count and the set progress are announced as status text
- [ ] A found difference is not conveyed by colour alone (✓ badge and ring shape)
- [ ] The sound toggle mutes every harbor sound with no thrown errors
- [ ] Reduced motion disables the cat bob, the hint pulse and the ring pop-in
- [ ] The game remains fully playable under reduced motion
- [ ] `pnpm test`, the spot-the-difference e2e suite and the `pnpm check` are green

## Blocked by

- 02 — Twin Postcards Core
- 03 — Harbor Juice and Sound
