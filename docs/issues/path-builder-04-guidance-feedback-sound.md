# 04 — Path Builder: Guidance, Feedback and Sound

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Teach the gesture without words and make every outcome legible. A ghost hand traces the first Road once per device (key `path-builderGhostSeen`); after roughly six seconds without a completed Road, a faint Guide fades in and out. Stars glow and pop, a Blocker wiggles with a quiet bump, and a gentle forest sound pass plays while drawing, walking and arriving.

## Acceptance criteria

- [x] A ghost hand demonstrates the first Road once per device (key `path-builderGhostSeen`)
- [x] Any press dismisses the demonstration and leaves the Road playable
- [x] After ~6s without a completed Road, a faint full Guide appears and fades
- [x] The idle Guide is a valid route derived from the Scene
- [x] The Guide never auto-completes the Road
- [x] Stars have a warm halo; collected Stars shrink and fade
- [x] A Blocker stop wiggles the Blocker and plays a quiet bump
- [x] Drawing plays a soft scratch; the walk plays soft footsteps
- [x] Star collection and arrival each have a distinct, quiet chime
- [x] All sound respects the existing sound setting and stays silent when muted
- [x] Guidance and feedback remain usable under reduced motion
- [x] E2E covers the demonstration, its dismissal, and the idle Guide

## Blocked by

- 03 — Road Core