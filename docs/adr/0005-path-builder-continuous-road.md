# ADR 0005: Path Builder becomes a continuous drawn road

- **Status:** Accepted
- **Date:** 2026-11-07
- **Deciders:** Ion, LLM
- **Related:** `CONTEXT.md` Path Builder, `docs/superpowers/specs/2026-11-07-path-builder-road-prd.md`

## Context

Path Builder shipped as a grid puzzle: a 4×4–6×6 board, tap an adjacent cell to extend a path, a blue dot trail, flag and checkered flag, brick obstacles, a BFS hint, and five near-identical boards per level. For ages 3–5 it was abstract and fiddly: the child had to infer "adjacent cell", the world was a starry void, and a wrong tap was silently ignored or wobbled.

Three prototypes were built on `prototype/path-builder`: a freehand forest road with a fox, a side-on snow slide with gentle momentum, and a hidden-lattice toy train. The owner chose the forest road and refined it: start-anywhere drawing, a full-body fox, forest life, star glow, and a quiet sound pass.

## Decision

Replace the grid board with a **continuous illustrated Scene**. The child draws a freehand **Road** from **Home** to **Destination**, avoiding **Blockers**; a **Walker** (a fox) travels the Road once it connects. There is no timer and no fail state. **Stars** become required at later Levels. A one-time ghost hand and an idle **Guide** teach the gesture. The shared 10-step ladder, five Layouts per Level, saved level/mastery and the hub entry stay exactly as they are.

## Alternatives considered

1. **Keep the grid and re-skin it.** Rejected: it does not fix the abstraction or the fiddly adjacency, which were the stated pains.
2. **Snow Slide as the anchor.** Rejected as the primary: momentum is playful, but the "draw a road and travel it" fantasy is clearer and calmer for 3–5. Kept as an explored contrast.
3. **Toy Train (hidden lattice).** Rejected as the primary: still a discrete grid, and the child taps spots rather than drawing.

## Consequences

### Positive

- A pre-reader can play with one gesture: draw from Home to Destination.
- The world carries the meaning (cottage, fox, forest) instead of arrows and bricks.
- Difficulty can grow by distance, Blocker shapes and required Stars without a bigger grid.
- Wrong drops never consume an item; the Road persists and can be edited.

### Negative / accepted costs

- The cell-based BFS engine is obsolete for this game; collision and scene geometry are new code and need their own tests.
- Freehand collision is approximate; a stroke stops at a Blocker edge and may feel abrupt. It must be tuned and shown with feedback.
- Old grid landmarks (`Start`, `Goal`, `Obstacle`, `Hint`, `Path`, `Puzzle`) are retired; the glossary and tests must migrate.
- Saved progress is unchanged, so existing players keep their level and mastery.
