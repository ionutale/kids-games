# 02 — Pop: Juice and Sound

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Make every pop legible and collectible: a ripple where the bubble burst, minis popping into the jar, a star sticker on the rim, and the quiet pond sound pass. Giant cracks, star sparkles, and the fill chime should be distinct without becoming noisy.

## Acceptance criteria

- [x] Each pop leaves a short ripple at the burst point
- [x] Surprises pop into the jar and settle visibly
- [x] A star sticker appears when the jar fills or a star bubble pops
- [x] Pop plays a water plop whose pitch rises through a chain
- [x] Spawn plays a soft bubble-up at low volume
- [x] Filling the jar plays a three-note chime
- [x] No clock ticking and no negative sound
- [x] Everything respects the existing sound setting
- [x] Ripples, stickers and jar minis remain usable under reduced motion
- [x] Navigating away stops the animation loop and pending timers
- [x] E2E or behavioral coverage for the jar minis, star sticker and muted sound

## Blocked by

- 01 — Rising Pond Core