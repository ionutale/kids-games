# PRD — Path Builder: the Forest Road

- **Date:** 2026-11-07
- **Decision:** ADR 0005, prototype winner A on `prototype/path-builder`
- **Baseline:** grid puzzle shipped in the current game

## Problem Statement

Path Builder is a grid puzzle in a 2–5 app. The child taps adjacent cells, watches a blue dot grow, and aims for a checkered flag while avoiding brick tiles. For the target age it is abstract (no world, no character), fiddly (adjacent-tap precision, silent rejects), reading-free only by accident, and not cozy. Five near-identical boards per level make it feel like homework rather than play.

The owner wants a free road-drawing game: the child draws a line with a finger, then a character moves along it. The world should be warm and legible, and there should be no way to lose.

## Solution

A continuous illustrated forest Scene viewed in portrait. Home and Destination sit on opposite sides. The child draws a freehand Road from Home to Destination; the Road cannot enter a Blocker (rock, pond, hedge); a fox Walker travels the Road once it connects. Stars are collected as the Walker passes and become required at later Levels. A one-time ghost hand and an idle faint Guide teach the gesture. There is no timer, no fail state, and no score to lose. The shared ladder, five Layouts per Level, saved progress and hub entry are unchanged.

## User Stories

1. As a 3-year-old, I want to see a cottage and a fox, so that I understand where the journey starts.
2. As a 3-year-old, I want to draw a road with one finger, so that I do not have to understand cells or arrows.
3. As a 3-year-old, I want the road to start at the cottage even if I press in the middle of the forest, so that I cannot get stuck.
4. As a 3-year-old, I want the fox to walk the road I drew, so that my drawing comes alive.
5. As a 3-year-old, I want a rock or pond to stop my line, so that the world behaves like a real place.
6. As a 3-year-old, I want to lift my finger and continue the road, so that one long stroke is not required.
7. As a 3-year-old, I want to rub back over the road to erase it, so that I can fix a mistake.
8. As a 3-year-old, I want a big Redraw button, so that starting over is always easy.
9. As a 3-year-old, I want stars to sparkle when the fox passes, so that collecting feels rewarding.
10. As a 3-year-old, I want no timer and no losing sound, so that I can take as long as I need.
11. As a 3-year-old, I want the forest to have fireflies and mushrooms, so that the place feels alive and cozy.
12. As a 4-year-old, I want a ghost hand to show me how to draw the first road, so that I can copy it.
13. As a 4-year-old, I want a faint road to appear if I pause, so that I can get unstuck without an adult.
14. As a 4-year-old, I want the correct path to be visible only as a hint, so that I still draw it myself.
15. As a 4-year-old, I want more rocks and ponds as I go, so that the roads get more interesting.
16. As a 4-year-old, I want stars to become required, so that I have a reason to curve the road.
17. As a 5-year-old, I want longer routes and tighter gaps, so that the game still challenges me.
18. As a 5-year-old, I want to see my collected stars, so that I know what I still need.
19. As a parent, I want the game to fit a small phone in portrait, so that it is playable on the go.
20. As a parent, I want the drawing to be forgiving, so that my child does not fight the touchscreen.
21. As a parent, I want the sound to be quiet and gentle, so that it does not overwhelm.
22. As a parent, I want the sound to respect the existing toggle, so that I can mute the app.
23. As a parent, I want motion to respect reduced-motion settings, so that the game stays calm.
24. As a parent, I want the level and mastery to be saved, so that progress is not lost.
25. As a parent, I want five short layouts per level, so that a session has a clear end.
26. As a returning child, I want to pick any level from the ladder, so that I can revisit a favourite.
27. As a returning child, I want the fox and forest to stay consistent, so that the world feels familiar.
28. As a designer, I want the road to be a polyline with collision against circular Blockers, so that the scene can grow without a hidden grid.
29. As a designer, I want the Guide to be generated from the Scene, so that it always suggests a valid route.
30. As a designer, I want the old grid engine retired for this game, so that two path models do not coexist.

## Implementation Decisions

- **Scene model.** A portrait continuous world (no visible grid) with Home and Destination on opposite sides. Blockers are circles (rock, pond, hedge). Stars sit on a suggested route. All coordinates live in one scene unit space and are mapped to the rendered SVG.
- **Road.** A polyline of scene points. Pointer-down anywhere starts or continues a road from Home; pointer-move appends points; a segment that intersects a Blocker is rejected and the last valid point stays. The road persists after lifting; pressing near an earlier road point truncates to it; Redraw clears.
- **Start-anywhere.** On the first press, the road is seeded at Home and, when clear, a first segment is drawn to the press point. This removes the "press the start" failure mode.
- **Walker.** After the road reaches the Destination, the fox walks the polyline at a readable pace with a small bob. On arrival, if all required Stars were collected, the Layout is solved. Otherwise the fox returns Home, the road persists, and the child edits or redraws.
- **Stars.** Collected when the Walker comes within a forgiving radius of the star. Collected stars sparkle and shrink. Required count is part of the Scene.
- **Blockers.** The road cannot enter; the stroke stops at the edge, the blocker wiggles, and a quiet bump plays.
- **Guidance.** A ghost hand traces the first-ever road once. After roughly six seconds without a completed road, a faint full Guide fades in for a few seconds. It never auto-completes. Any press hides it.
- **Levels.** Keep ten ladder steps and five Layouts per Level. Difficulty grows by Home/Destination distance, Blocker count and shape, and required Stars. Early Levels are nearly free drawing; mid adds Blockers; late adds required Stars. No timers.
- **Sound.** Scratch while drawing, soft footsteps while walking, a two-note chime per star, a quiet bump on a Blocker, a three-note arrival. Respect the existing sound setting. No negative sound on a miss.
- **Art.** Flat inline SVG: fox, cottage, cabin, rock, pond, hedge, tree, mushroom, star, hand, fireflies. No emoji on the game surface.
- **State.** `scene` (Home, Destination, route, blockers, stars, required), `road` (points), `walker`, `collected`, `solved`, `guide`/`ghost`, `layoutIndex`. The old `generatePuzzle`/`validatePath`/`hintCell` grid engine is not used by this game after migration.
- **Constraints.** No new dependencies; do not edit shared components or the global theme; keep progress keys and the hub entry; keep the sound toggle.

## Testing Decisions

- **Test external behavior**, not internal state: can a child draw, does the road stop at a rock, does the fox walk, does a star get collected, does a Layout solve, does the ladder switch.
- **Highest seam:** the rendered Scene and its stable hooks. Give the page `data-testid="pb-root"`, the board `data-testid="scene"`, the fox `data-testid="walker"`, the guide `data-testid="guide"`, and mark Blockers and Stars with data attributes so tests can target them without reading state.
- **Unit:** scene geometry (segment–circle intersection, point-at-distance), scene generation (Home/Destination opposite, required star count, Blockers do not overlap the suggested route), star collection radius, and level-to-scene configuration.
- **E2E:** draw with the existing touch helper and assert the fox moves and the Layout solves; a stroke into a Blocker stops and the road count does not grow; a missed required star returns the fox and keeps the road; the Guide appears after idle; level switching keeps the ladder; 320×568 and 390×844 fit; sound toggle on/off does not throw.
- **Prior art:** `tests/e2e/sorting.test.js` for drag and spring-back; `tests/e2e/category-sort.test.js` for the room and level switching. Use the same touch helpers.
- **Do not** assert CSS values or private variables.

## Out of Scope

- The Snow Slide and Toy Train theses; they remain prototypes only.
- Real physics (falls, momentum) for the forest road.
- Voice-over or recorded narration.
- Accounts, cloud progress, or a new art pipeline.
- Editing shared components or other games.
- A keyboard drawing mode; the primary input is touch/pointer. Screen-reader labels and reduced motion are in scope.

## Further Notes

- Prototype source: `prototype/path-builder` (`3522cf9c`, refined `2b3934ea`), variant A.
- The chosen world is the fox forest. The other worlds remain available as future seasonal skins.
- The empty board is intentional: with no grid, the child sees a clearing, not a puzzle table. The Guide, ghost hand and star glow carry the affordance.
- Risk: freehand collision can feel abrupt; tune the stop distance and show the bump clearly.
- Risk: a long straight line can trivialise early Levels; early scenes should still curve slightly so the toy reads as drawing, not dragging to a target.
