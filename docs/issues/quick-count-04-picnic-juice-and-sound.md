# 04 — Quick Count: Picnic Juice and Sound

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Make the flash and the basket feel alive: a soft count tick per object on the first levels, a berry plop on a correct answer, a basket-fill chime, and a clear visual fill. Keep the shared Trainer Music under it. No negative sound.

## Acceptance criteria

- [x] A soft tick plays once per object during the flash on levels 1–2 only
- [x] No ticks play from level 3 upward
- [x] A correct answer plays a quiet berry plop
- [x] Filling the basket plays a warm three-note chime
- [x] The berry visibly lights and the basket fill animates
- [x] The shared Trainer Music keeps playing under the effects
- [x] All sound respects the existing setting
- [x] Effects remain usable under reduced motion
- [x] Navigating away stops the music and pending timers
- [x] E2E or behavioral coverage for the basket count and the muted path

## Blocked by

- 03 — Flash Picnic Core