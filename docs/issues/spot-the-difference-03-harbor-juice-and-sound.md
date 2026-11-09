# 03 — Spot the Difference: Harbor Juice and Sound

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Make a find feel like a little discovery: a clean ring in both pictures, a visible token fill, a postcard toast and a cat that reacts. Add the harbor sound set — gull, rising find chime, soft miss thud, completion jingle and a buoy bell at the set end — all behind the existing sound setting.

## Acceptance criteria

- [x] A found difference rings both pictures with a ✓ badge and stays until the puzzle ends
- [x] A missing prop's ring is visually distinct from a present prop's ring
- [x] Found tokens fill one by one; the set strip fills one slot per solved puzzle
- [x] A solved puzzle shows a short "Postcard added" toast
- [x] The set-complete card shows the album and the new postcards
- [x] The cat reacts subtly to a find (no new tap target)
- [x] A new picture plays a gull cry
- [x] Each find plays a rising two-note chime
- [x] A wrong tap plays a quiet low thud, never a negative sting
- [x] Each solve plays a four-note jingle; the set end plays a buoy bell
- [x] Every sound respects the existing sound setting
- [x] Effects remain usable under reduced motion
- [x] Navigating away clears pending timers and stops the sound
- [x] E2E or behavioral coverage for the toast, album and muted path

## Blocked by

- 02 — Twin Postcards Core