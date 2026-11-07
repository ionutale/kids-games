# 03 — Soccer: Devices and Accessibility Gate

## What to build

Prove the Night Penalty works on the target phones and for children who mute sound or reduce motion. Make the pitch, shots and stars understandable without relying on colour alone.

## Acceptance criteria

- [ ] The pitch, goal, pips and ladder fit 320×568 with no horizontal overflow
- [ ] The layout fits 390×844 in portrait with the whole goal and striker visible
- [ ] Shots left, goals and the star row expose useful text for assistive technology
- [ ] The reticle and impact are announced as a status, not only drawn
- [ ] The sound toggle mutes every stadium sound with no thrown errors
- [ ] Reduced motion disables floodlight flicker, crowd motion and the ball spin
- [ ] The game remains fully playable under reduced motion
- [ ] `pnpm test`, the soccer e2e suite and `pnpm check` are green

## Blocked by

- 01 — Night Penalty Core
- 02 — Stars and Stadium Sound
