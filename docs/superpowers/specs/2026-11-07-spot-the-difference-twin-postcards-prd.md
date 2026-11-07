# PRD — Spot the Difference: Twin Postcards

- **Date:** 2026-11-07
- **Decision:** prototype winner A on `prototype/spot-the-difference` (`b2182edf`, refined `18df6908`)
- **Baseline:** the shipped two-emoji-grid game with a foreign-emoji toddler aid

## Problem Statement

Spot the Difference is two abstract emoji grids on a glass panel. It works — tap a cell that differs, ring both grids, shake a match — but there is no place and no reason to look. The toddler band solves itself by looking for the one emoji that appears nowhere else, so the intended comparison never happens. Difficulty is locked to the Settings age band with no set arc; progress is a found/total number and a lifetime solved count. There is no collection, no reward, and no sound pass. The game is a puzzle generator, not a cozy picture game.

## Solution

A seaside harbor, shown as two stacked picture panels. A pier cat with a magnifier watches; props are scattered across the lighthouse, pier, sea and sky. The child taps a changed spot in either picture, and both pictures ring it. Differences are Readable: a prop swapped, a prop missing, a prop moved, or a prop resized. Hotspots are generous. A wrong tap only wobbles. After idling, one unfound difference pulses. Five puzzles make a calm set; each solved puzzle adds a postcard to a persisted album. The HUD is a row of found tokens and a five-slot set strip. There is no timer, no fail and no ladder. Difficulty follows the Settings age band: 9/11/12 props and 2/3/4 differences at ages 3/4/5.

## User Stories

1. As a 3-year-old, I want to see a harbor with a lighthouse and a pier, so that the game feels like a place.
2. As a 3-year-old, I want two pictures of the same place, so that I understand I am comparing them.
3. As a 3-year-old, I want to tap the spot that changed, so that I can show what I noticed.
4. As a 3-year-old, I want a big tap area around each change, so that I do not miss it.
5. As a 3-year-old, I want the change to be marked in both pictures, so that I know I was right.
6. As a 3-year-old, I want a wrong tap to be gentle, so that mistakes are not scary.
7. As a 3-year-old, I want a cat with a magnifier, so that I have a friend in the scene.
8. As a 3-year-old, I want only two changes at first, so that the search is not overwhelming.
9. As a 4-year-old, I want three changes, so that the puzzle grows with me.
10. As a 4-year-old, I want changes that are not just a foreign object, so that I really compare.
11. As a 4-year-old, I want a soft hint when I am stuck, so that I can keep going.
12. As a 4-year-old, I want to see how many changes I have found, so that I know I am close.
13. As a 4-year-old, I want a postcard when I finish a picture, so that I have a reward.
14. As a 5-year-old, I want four changes, so that a puzzle lasts.
15. As a 5-year-old, I want moved and resized props, so that I have to look carefully.
16. As a 5-year-old, I want a set of five pictures, so that a visit has a shape.
17. As a 5-year-old, I want the album to keep my postcards, so that my collection grows.
18. As a parent, I want no timer and no fail, so that my child can take their time.
19. As a parent, I want the target to be a picture, not a number, so that a pre-reader can play.
20. As a parent, I want the game to fit a small phone in portrait, so that it is usable on the go.
21. As a parent, I want a calm harbor, so that the game is pleasant to watch.
22. As a parent, I want a quiet gull, chime and jingle, so that the game is not noisy.
23. As a parent, I want the sound to respect the app toggle, so that I can mute it.
24. As a parent, I want reduced motion respected, so that the scene stays calm.
25. As a returning child, I want my postcards to still be there, so that my album means something.
26. As a returning child, I want a new set to start cleanly, so that I can play again.
27. As a designer, I want the four difference types readably distinct, so that the puzzle is fair.
28. As a designer, I want a moved prop to ring in both positions, so that either answer counts.
29. As a designer, I want the toddler foreign-emoji aid kept only at age 3, so that older bands must compare.
30. As a designer, I want the set flat within an age band, so that the difficulty contract stays the Settings band.

## Implementation Decisions

- **Scene.** A portrait seaside harbor per panel: sky, sea and sand bands, a lighthouse on the left, a pier on the right, distant boats, gulls, clouds and a sun. A pier cat with a brass magnifier sits bottom-right on the sand. Props are emoji placed over the scene; the cat and backdrop are flat inline SVG/CSS.
- **Twin Pictures.** Two panels stacked with a thin gap, labelled Picture 1 and Picture 2. Each panel is a complete scene. On a phone the panels share the available height evenly.
- **Puzzle model.** A scene generator (planned `src/lib/spot-difference/scene.js`) replaces `makePuzzle`/`isDifference`. `ageSpec(age)`: age ≤3 → 9 props, 2 differences; age 4 → 11 props, 3 differences; age ≥5 → 12 props, 4 differences. Props are drawn without replacement from a harbor prop pool and placed with a minimum spacing, clear of the cat corner.
- **Difference types.** Four readable types: **swap** (one prop becomes another), **missing** (a prop disappears in Picture 2), **moved** (a prop shifts), **size** (a prop grows). The type list is shuffled and one of each is used as far as the difference count allows. At age 3 a swap uses an emoji that appears nowhere in the scene (the toddler aid); from age 4 the replacement reuses an in-scene emoji, so cells must be compared. Moves and resizes are larger at age 3.
- **Hotspots.** A tap anywhere inside a generous circular hotspot counts. The radius is the larger of 22px or 7% of the panel width, plus the span of a moved prop so one hotspot covers both positions. Both panels are tappable.
- **Found state.** A found difference rings in both pictures with a green ring and a ✓. A missing prop's ring is drawn at the empty spot in Picture 2. Found differences stay visible for the rest of the puzzle.
- **Wrong tap.** A light wobble ring at the touch point, silent or a very soft thud. No mistake count, no penalty.
- **Hint.** After about 8 seconds with no find, one unfound difference pulses a dashed golden ring in both panels for about 2.4 seconds; the timer re-arms. The hint stops when the puzzle is solved.
- **Set.** Five puzzles at the current Settings age band. Flat difficulty inside the set: the same difference count and prop count, with variety from the scene and the type mix. A solved puzzle shows a short "Postcard added" toast, then the next puzzle after ~1.1 seconds. The fifth opens a set-complete card with the album, Play again and Back.
- **Album.** Each solved puzzle prepends `{ age, seed, at }` to `spotPostcards` in localStorage. The album keeps every postcard and shows the latest 12 on the set-complete card. One album across all age bands. Replays add new postcards.
- **HUD.** Found tokens (one per difference in the current puzzle) and a five-slot set strip. No digits.
- **Sound.** Harbor set: a gull cry when a new picture appears, a rising two-note find chime per difference, a soft low thud on a wrong tap, a four-note completion jingle when a puzzle is solved, and a buoy bell when the set ends. Respects the existing sound setting; no negative sting.
- **Levels.** No ladder. The Settings age band is the difficulty contract; there is no level number and no mastery flag. The hub entry is unchanged.
- **Constraints.** No new dependencies. Do not edit shared components (GameShell, HUD, ladder) or the global theme. Keep the route path, the hub entry and the sound toggle. Retire the old emoji-grid generator and its unit tests; the old design doc stays as history.

## Testing Decisions

- **Test external behavior:** a tap on a difference rings both panels and adds a token; a tap on a match only wobbles; a moved prop counts from either position; solving adds a postcard; the set strip advances; the fifth puzzle opens the album; the album survives a reload; age 3 / 4 / 5 produce 2 / 3 / 4 differences.
- **Highest seam:** the route DOM. Keep `data-testid="spot-root"` (prototype: `spot-prototype`), `panel-left` / `panel-right`, `.prop`, `.ring`, `.hint`, `.wrong`, `spot-progress` (`.token`, `.slot`), `postcard-album`, `set-complete`, and the prototype switcher out of production. Tests should not read Svelte state.
- **Unit:** `ageSpec` prop/difference counts; puzzle generation produces exactly N differences of valid types; moved props stay in bounds; a move's hotspot spans both points; the age-3 swap uses a foreign emoji and age 4+ reuses an in-scene emoji; hit testing picks the nearest unfound difference; the postcard store adds and reads back, and tolerates corrupt JSON.
- **E2E:** solve an age-3 puzzle and advance; find a moved difference from its old position; wrong-tap wobble; full five-puzzle set to the album; album persistence across reload; age-band switch in Settings; 320×568 and 390×844; muted sound; reduced motion.
- **Prior art:** `tests/unit/spot-difference.test.js` and `tests/e2e/spot-the-difference.test.js` for the existing generators and route hooks.

## Out of Scope

- The Magic Lens and Spot the Change theses; they remain prototypes.
- Any timer, fail state, or mistake count.
- A hidden-object mode, a magnifier in the production twin game, or a one-panel mirror.
- Voice-over, accounts, cloud albums, or a new art pipeline.
- The shared ladder, shared components, or the global theme.
- A difficulty ramp inside a set, or a second set difficulty beyond the age band.

## Further Notes

- Prototype source: `prototype/spot-the-difference` (`b2182edf`, refined `18df6908`), variant A.
- The prototype plays three puzzles at ages 3, 4 and 5 so all bands can be judged; the production set is five puzzles at the single Settings band.
- The old design doc `2026-07-10-spot-the-difference-design.md` and ticket `spot-the-difference-01-core-game.md` describe the shipped emoji-grid version and stay as history.
- Risk: 9–12 props over two short panels at 320×568 can crowd; cap the prop count at the low end, keep generous spacing and never place a prop under the cat.
- Risk: a missing prop's ghost ring can look like a found prop; use a dashed ring and a small ✓ badge to distinguish it.
- Risk: localStorage can be unavailable; the album must degrade to an in-memory list without throwing.
