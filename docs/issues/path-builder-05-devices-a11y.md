# 05 — Path Builder: Devices and Accessibility Gate

## What to build

Prove the finished Forest Road works on the phones the app targets and for children who use sound-off or reduced motion. Add meaningful labels and status text for assistive technology, and keep the drawing surface reachable at small sizes.

## Acceptance criteria

- [ ] The Scene, Redraw button and destination fit 320×568 with no horizontal overflow
- [ ] The Scene fits 390×844 in portrait with the whole Route area visible
- [ ] The board exposes an accessible label, and Home, Destination and remaining Stars are announced
- [ ] The walking status is available as text, not only as motion
- [ ] The existing sound toggle mutes every forest sound with no thrown errors
- [ ] A reduced-motion pass disables the ghost-hand drift, the walking bob, and decorative fireflies
- [ ] The Game stays fully playable under reduced motion, including the idle Guide
- [ ] `pnpm test`, the path-builder e2e suite, and `pnpm check` are green

## Blocked by

- 03 — Road Core
- 04 — Guidance, Feedback and Sound
