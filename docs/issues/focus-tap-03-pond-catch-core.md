# 03 — Focus Tap: Pond Catch Core

## What to build

Put the existing focus-tap engine inside the moonlit pond. A frog on a lily pad holds the target sign; the stream rises; tapping a target flicks the frog's tongue, pops the emoji, and lights a firefly in the jar. Distractors wobble silently. The round ends when the jar reaches the goal.

## Acceptance criteria

- [ ] The pond renders in portrait with the moon, pads, reeds and fireflies
- [ ] The frog sits bottom-left and holds the target sign; the jar sits bottom-right
- [ ] The target and distractor engine, spawns and tier rules are reused unchanged
- [ ] Tapping a target pops it, lights one firefly and moves the frog's tongue to it
- [ ] Tapping a distractor wobbles it and never fills the jar
- [ ] The jar fills to the goal; there are no digits
- [ ] Reaching the goal ends the round with a calm card and the ladder actions
- [ ] The shared landing and play route level stay unchanged
- [ ] E2E covers a target catch, a distractor, the goal and the end card
- [ ] No new dependencies

## Blocked by

None — can start immediately
