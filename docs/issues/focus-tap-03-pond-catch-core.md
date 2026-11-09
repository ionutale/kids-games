# 03 — Focus Tap: Pond Catch Core

- **Status:** Implemented (shipped 2026-11-09).

## What to build

Put the existing focus-tap engine inside the moonlit pond. A frog on a lily pad holds the target sign; the stream rises; tapping a target flicks the frog's tongue, pops the emoji, and lights a firefly in the jar. Distractors wobble silently. The round ends when the jar reaches the goal.

## Acceptance criteria

- [x] The pond renders in portrait with the moon, pads, reeds and fireflies
- [x] The frog sits bottom-left and holds the target sign; the jar sits bottom-right
- [x] The target and distractor engine, spawns and tier rules are reused unchanged
- [x] Tapping a target pops it, lights one firefly and moves the frog's tongue to it
- [x] Tapping a distractor wobbles it and never fills the jar
- [x] The jar fills to the goal; there are no digits
- [x] Reaching the goal ends the round with a calm card and the ladder actions
- [x] The shared landing and play route level stay unchanged
- [x] E2E covers a target catch, a distractor, the goal and the end card
- [x] No new dependencies

## Blocked by

None — can start immediately