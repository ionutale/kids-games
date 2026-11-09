# 04 — Focus Tap: Pond Juice and Sound

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Make the catch and the jar feel alive: the tongue, a sparkle at the target, fireflies lighting in the jar, a soft croak, a catch plop, and a fill chime. Keep the shared Trainer Music under it. No negative sound.

## Acceptance criteria

- [x] The tongue visibly reaches the tapped element and retracts
- [x] A sparkle bursts at the catch point
- [x] Each firefly lights with a small pop; the jar fill animates
- [x] A catch plays a quiet plop and a soft croak
- [x] Filling the jar plays a warm three-note chime
- [x] The shared Trainer Music keeps playing under the effects
- [x] All sound respects the existing setting
- [x] Effects remain usable under reduced motion
- [x] Navigating away stops the music and pending timers
- [x] E2E or behavioral coverage for the jar count and the muted path

## Blocked by

- 03 — Pond Catch Core