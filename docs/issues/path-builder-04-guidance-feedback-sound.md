# 04 — Path Builder: Guidance, Feedback and Sound

## What to build

Teach the gesture without words and make every outcome legible. A ghost hand traces the first Road once per device (key `path-builderGhostSeen`); after roughly six seconds without a completed Road, a faint Guide fades in and out. Stars glow and pop, a Blocker wiggles with a quiet bump, and a gentle forest sound pass plays while drawing, walking and arriving.

## Acceptance criteria

- [ ] A ghost hand demonstrates the first Road once per device (key `path-builderGhostSeen`)
- [ ] Any press dismisses the demonstration and leaves the Road playable
- [ ] After ~6s without a completed Road, a faint full Guide appears and fades
- [ ] The idle Guide is a valid route derived from the Scene
- [ ] The Guide never auto-completes the Road
- [ ] Stars have a warm halo; collected Stars shrink and fade
- [ ] A Blocker stop wiggles the Blocker and plays a quiet bump
- [ ] Drawing plays a soft scratch; the walk plays soft footsteps
- [ ] Star collection and arrival each have a distinct, quiet chime
- [ ] All sound respects the existing sound setting and stays silent when muted
- [ ] Guidance and feedback remain usable under reduced motion
- [ ] E2E covers the demonstration, its dismissal, and the idle Guide

## Blocked by

- 03 — Road Core
