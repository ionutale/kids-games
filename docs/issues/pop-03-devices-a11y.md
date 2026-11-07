# 03 — Pop: Devices and Accessibility Gate

## What to build

Prove the pond works on the target phones and for children who mute sound or reduce motion. Add meaningful labels and status text, and make the jar and timer readable without colour alone.

## Acceptance criteria

- [ ] The pond, jar, moon and ladder fit 320×568 with no horizontal overflow
- [ ] The layout fits 390×844 in portrait with all bubbles reachable
- [ ] The jar exposes its fill state as text for assistive technology
- [ ] Bubble types and remaining target are announced, not only drawn
- [ ] The sound toggle mutes every pond sound with no thrown errors
- [ ] Reduced motion disables fireflies, bobbing bubbles and ripples
- [ ] The game remains fully playable under reduced motion
- [ ] `pnpm test`, the pop e2e suite and `pnpm check` are green

## Blocked by

- 01 — Rising Pond Core
- 02 — Juice and Sound
