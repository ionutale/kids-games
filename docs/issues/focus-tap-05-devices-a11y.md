# 05 — Focus Tap: Devices and Accessibility Gate

## What to build

Prove the Pond Catch works on the target phones and for children who mute sound or reduce motion. Make the frog, the target and the jar understandable without relying on colour or numbers.

## Acceptance criteria

- [ ] The pond, frog, sign and jar fit 320×568 with no horizontal overflow
- [ ] The layout fits 390×844 in portrait with a clear stream band
- [ ] The target, the jar count and the goal are announced for assistive technology
- [ ] The frog and jar are decorative for screen readers, not duplicate names
- [ ] The sound toggle mutes the music and effects with no thrown errors
- [ ] Reduced motion disables firefly drift and the sparkle animation
- [ ] The game remains fully playable under reduced motion
- [ ] `pnpm test`, the focus-tap e2e suite and `pnpm check` are green

## Blocked by

- 03 — Pond Catch Core
- 04 — Pond Juice and Sound
