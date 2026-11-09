# 03 — Pop: Devices and Accessibility Gate

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Prove the pond works on the target phones and for children who mute sound or reduce motion. Add meaningful labels and status text, and make the jar and timer readable without colour alone.

## Acceptance criteria

- [x] The pond, jar, moon and ladder fit 320×568 with no horizontal overflow
- [x] The layout fits 390×844 in portrait with all bubbles reachable
- [x] The jar exposes its fill state as text for assistive technology
- [x] Bubble types and remaining target are announced, not only drawn
- [x] The sound toggle mutes every pond sound with no thrown errors
- [x] Reduced motion disables fireflies, bobbing bubbles and ripples
- [x] The game remains fully playable under reduced motion
- [x] `pnpm test`, the pop e2e suite and `pnpm check` are green

## Blocked by

- 01 — Rising Pond Core
- 02 — Juice and Sound