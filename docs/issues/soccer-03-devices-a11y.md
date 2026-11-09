# 03 — Soccer: Devices and Accessibility Gate

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Prove the Night Penalty works on the target phones and for children who mute sound or reduce motion. Make the pitch, shots and stars understandable without relying on colour alone.

## Acceptance criteria

- [x] The pitch, goal, pips and ladder fit 320×568 with no horizontal overflow
- [x] The layout fits 390×844 in portrait with the whole goal and striker visible
- [x] Shots left, goals and the star row expose useful text for assistive technology
- [x] The reticle and impact are announced as a status, not only drawn
- [x] The sound toggle mutes every stadium sound with no thrown errors
- [x] Reduced motion disables floodlight flicker, crowd motion and the ball spin
- [x] The game remains fully playable under reduced motion
- [x] `pnpm test`, the soccer e2e suite and `pnpm check` are green

## Blocked by

- 01 — Night Penalty Core
- 02 — Stars and Stadium Sound