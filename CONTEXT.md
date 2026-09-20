# Kids Games — Domain Glossary

## Puzzle Game

- **Puzzle**: An image divided into multiple solvable fragments (Pieces).
- **Piece**: A single fragment of the Puzzle, featuring traditional interlocking edges (tabs and blanks), generated dynamically at runtime via SVG paths.
- **Board**: The fixed area showing a faded ghost image where Pieces are assembled. Scales to device screen with Aspect Ratio Preservation using letterboxing.
- **Target Position**: The absolute, predetermined coordinates on the Board where a specific Piece must be dropped to snap into place.
- **Tray**: A designated UI area holding unplaced Pieces. Auto-refills — holds a limited number at a time, slides in new ones when slots open.
- **Snap Radius**: An invisible, forgiving boundary around a Target Position. If a Piece is dropped within it, it auto-locks into its Target Position.
- **Difficulty Level**: A selectable configuration (Easy/Medium/Hard) determining Piece count and Snap Radius size.
- **Source Image**: The complete image that is dynamically sliced into Pieces at runtime.
- **Idle Nudge**: An automatic visual hint (jiggling a Piece + highlighting its Target Position) triggered after 8s of inactivity.
- **Celebration Sequence**: Multi-stage visual + audio reward triggered when the final Piece is placed, requiring manual input to proceed.
- **Progress State**: Saved status of an ongoing Puzzle (Source Image, Difficulty, placed Pieces) stored in localStorage.
- **Fixed Orientation**: Pieces are always upright — no rotation mechanics.
- **Open Gallery**: Visual menu with image thumbnails letting users freely select any Puzzle.
- **Positive-Only Audio**: Successful snap → satisfying sound. Failed drop → silence. No punitive sounds.
- **Parental Gate**: *Removed (2026-08)* — exit is now an ordinary link back to the gallery (see Glossary Puzzle below).
- **Monochrome Blueprint**: Ghost image on the Board rendered in heavily washed-out greyscale.
- **Single-Touch Lock**: Only one touch registered during a drag — resting palms ignored.
- **Drag Offset and Magnify**: Dragged Piece scales up 1.12× and shifts above the touch point.
- **Flat Borders**: Outer-perimeter Pieces have straight external edges.
- **Permanent Lock**: Snapped Pieces ignore all future touch events.

## Glossary Puzzle (Jigsaw) Game

- **Gallery Page** (`/games/glossary-puzzle`): the landing view — Level Bar, categories, image grid. Full app chrome via GameShell (back link + sound toggle). Accepts `?level={n}` to preselect the difficulty step.
- **Level**: 1–10 shown in the Level Bar, but the **Level = Difficulty Step** and the ladder is unbounded: Level *N* ⇒ grid `cols = 2 + ⌊N/2⌋`, `rows = 2 + ⌊(N−1)/2⌋`, snap radius `max(14, 44 − 2N)`. Any image can be played at any level.
- **Toddler Snap**: a drop is accepted if the lifted ghost's visual point *or* raw thumb lands anywhere inside the piece's own target hole expanded by `max(snapRadius, 20% cell size)`; accepted drops that land far from center glide magnetically into place (~160ms).
- **Level Page**: `/games/glossary-puzzle/play/{n}?image={id}` — every solving session is its own URL; without `?image=` the image rotates by level.
- **Free-Play Page**: `/games/glossary-puzzle/play?image={id}&level={n}` — opened from gallery image cards; also serves `?resume=1` for saved Progress State (placed pieces handed off via sessionStorage).
- **PuzzleBoard**: shared solving component (board, Tray, drag ghost, Snap, Idle Nudge, win overlay) used by both play routes; remounted per URL via `{#key}` so navigation always yields a fresh board.
- **Link-based Back / Next**: exiting an active puzzle uses an ordinary `<a href>` to the gallery; the win dialog offers **Play Again** (same image + level), **Next Level ▶** (same image, level + 1 — always available), and **Back** (gallery link). No parental gate, no unlock gating.

## Sequence Memory Game

- **Pad**: One of 4 emoji buttons in a 2×2 grid that lights up during sequence playback.
- **Sequence**: An ordered list of Pads that the player must memorize and reproduce.
- **Round**: One complete cycle of sequence playback → player input → either advance or game over.
- **Second Chance**: After the first wrong tap, the Sequence replays at half speed before the player tries again.

## Emoji Math Game

- **Equation**: An arithmetic expression shown with emoji counts and real + / − signs (e.g., `🍎 + 🍎 = ?`, `🍎🍎🍎 − 🍎 = ?`); age 4 mixes addition and subtraction within 10, age 5+ interleaves addition, subtraction ≤20, and comparison.
- **Distractor**: One of the three incorrect multiple-choice answers, positioned ±1 or ±2 from the correct answer.
- **Milestone**: A celebration triggered every 10 correct answers.

## Spot the Difference Game

- **Difference**: A cell that contains a different Emoji between the two Grids.
- **Puzzle**: A single round consisting of two Grids with N Differences to find.
- **Found Difference**: A Difference cell that the player has correctly tapped, marked with a highlight ring.

## Category Sort Game

- **Bin**: A drop target area representing one Category.
- **Category**: A labeled group of related Emojis (e.g., Animals, Food, Vehicles).
- **Round**: A set of 8-10 Emojis the player must sort into the correct Bins.
- **Tap-to-Place**: The dual interaction — drag the Emoji into a Bin, or tap the Emoji to lift it and tap the Bin to drop it.
- **Hover-Correct**: A green glow + ✓ mark on the Bin matching the dragged Emoji, shown only for the first five placements of the first round, then permanently retired; non-matching Bins dim softly. The dragged Emoji keeps its own green drop feedback afterward.

## Path Builder Game

- **Puzzle**: A single Grid with a Start, Goal, and Obstacles that the player must solve.
- **Start**: The origin cell marked with 🚩 where the Path begins.
- **Goal**: The destination cell marked with 🏁 that the Path must reach.
- **Obstacle**: An impassable cell marked with 🧱 that the Path cannot cross.
- **Path**: An ordered list of adjacent cells connecting Start to Goal.
- **Hint**: A visual indicator showing the next optimal cell on the shortest Path.


## Quiz Games

- **Topic**: One quiz's content set (`src/lib/quiz/topics.js`) — Animals, Food, Vehicles, Colors & Shapes, Clothes, Toys, Instruments.
- **Item**: A single quiz entry `{ emoji, en, it, ro, de, fr, zh }`; every quiz requires all six locale names.
- **Quiz Round**: One pass through a Topic: big emoji → 3 localized name options → silent red shake on wrong, green pop + confetti on correct, All-done overlay with Play Again.


## Italian Grammar Game

- **Exercise**: One grammar task — a sentence with a `___` blank (verb, article, plural, preposition, imperative) or a picture-to-sentence match; always 3 options.
- **Prompt**: The sentence with the blank, or the scene emoji for picture exercises.
- **Level**: 1–10 distinct difficulty steps (volere → -are → -ere/-ire → articles → plurals → prepositions → imperatives → pictures → mixed); L11+ plateaus on the mixed pool. No Level Bar — advance with Next Level ▶.
- **Content language**: Always Italian; UI chrome follows the app locale.


## TODO — New Game Ideas

The following games have been proposed but not yet designed or implemented. Each needs to go through the full brainstorming → design → spec → issues pipeline.

| # | Game | Concept | Spec | Issues | Status |
|---|------|---------|------|--------|--------|
| 1 | **Sequence Memory** (Simon Says) | Emoji sequence flashes, player repeats by tapping in order. Tests working memory. | [spec](docs/superpowers/specs/2026-07-10-sequence-memory-design.md) | [sequence-memory-01-core-game.md) | Implemented |
| 2 | **Emoji Math** | Arithmetic shown with emoji counts. Covers counting, addition, subtraction, comparison. | [spec](docs/superpowers/specs/2026-07-10-emoji-math-design.md) | [emoji-math-01-core-game.md) | Implemented |
| 3 | **Spot the Difference** | Two emoji grids, player taps cells that differ. Visual scanning + attention. | [spec](docs/superpowers/specs/2026-07-10-spot-the-difference-design.md) | [spot-the-difference-01-core-game.md) | Implemented |
| 4 | **Category Sort** | Drag emojis into correct category bins. Categorization + logic. | [spec](docs/superpowers/specs/2026-07-10-category-sort-design.md) | [category-sort-01-core-game.md) | Implemented |
| 5 | **Path Builder** | Draw a path from Start to Goal avoiding obstacles. Spatial reasoning. | [spec](docs/superpowers/specs/2026-07-10-path-builder-design.md) | [path-builder-01-engine.md) | Implemented |
| 6 | **Tetris** | Classic falling-block puzzle with line clears, difficulty levels, classic scoring + best score. | [spec](docs/superpowers/specs/2026-08-15-tetris-design.md) | [plan](docs/superpowers/plans/2026-08-15-arcade-trilogy-plan.md) | Removed (2026-09) |
| 7 | **Emoji Jump** (Doodle Jump clone) | Endless vertical climber — touch-button steering, full Doodle Jump depth (platforms, springs, enemies, power-ups). | [spec](docs/superpowers/specs/2026-08-15-emoji-jump-design.md) | [plan](docs/superpowers/plans/2026-08-15-arcade-trilogy-plan.md) | Removed (2026-09) |
| 8 | **Angry Emoji 2D** (Angry Birds clone) | Slingshot-drag emoji projectiles against destructible block towers; 20+ levels, 1-3 stars each. | [spec](docs/superpowers/specs/2026-08-15-angry-emoji-2d-design.md) | [plan](docs/superpowers/plans/2026-08-15-arcade-trilogy-plan.md) | Removed (2026-09) |
| 9 | **Focus tap** (Brain Trainer 1) | Floating emoji stream; catch only the Target, resist Distractors. Selective attention + impulse control. | [spec](docs/superpowers/specs/2026-08-23-focus-tap-design.md) | [issues](docs/issues/focus-tap-01-core-game.md) | Implemented |
| 10 | **Quick Count** (Brain Trainer 2) | Emojis flash briefly, child answers "how many?" via 3 Answer Pills. Subitizing + estimation. | [spec](docs/superpowers/specs/2026-08-23-quick-count-design.md) | [issues](docs/issues/quick-count-01-core-game.md) | Implemented |
| 11 | **Speed Match** (Brain Trainer 3) | Deck of emoji Pair Cards; same or different? Auto-advance window keeps tempo. Processing speed. | [spec](docs/superpowers/specs/2026-08-23-speed-match-design.md) | [issues](docs/issues/speed-match-01-core-game.md) | Implemented |
| 12 | **What Comes Next** (Brain Trainer 4) | Complete the emoji Pattern Unit from 3 options; pedagogical arc AB → AABB → ABC → growing. Pattern logic / pre-math. | [spec](docs/superpowers/specs/2026-08-23-what-comes-next-design.md) | [issues](docs/issues/what-comes-next-01-core-game.md) | Implemented |

## Sequence Memory Game

- **Pad**: One of 4 emoji buttons in a 2×2 grid that lights up during sequence playback.
- **Sequence**: An ordered list of Pads that the player must memorize and reproduce.
- **Round**: One complete cycle of sequence playback → player input → either advance or game over.
- **Second Chance**: After the first wrong tap, the Sequence replays at half speed before the player tries again.

## Emoji Math Game

- **Equation**: An arithmetic expression shown with emoji counts and real + / − signs (e.g., `🍎 + 🍎 = ?`, `🍎🍎🍎 − 🍎 = ?`); age 4 mixes addition and subtraction within 10, age 5+ interleaves addition, subtraction ≤20, and comparison.
- **Distractor**: One of the three incorrect multiple-choice answers, positioned ±1 or ±2 from the correct answer.
- **Milestone**: A celebration triggered every 10 correct answers.

## Spot the Difference Game

- **Difference**: A cell that contains a different Emoji between the two Grids.
- **Puzzle**: A single round consisting of two Grids with N Differences to find.
- **Found Difference**: A Difference cell that the player has correctly tapped, marked with a highlight ring.

## Category Sort Game

- **Bin**: A drop target area representing one Category.
- **Category**: A labeled group of related Emojis (e.g., Animals, Food, Vehicles).
- **Round**: A set of 8-10 Emojis the player must sort into the correct Bins.
- **Tap-to-Place**: The dual interaction — drag the Emoji into a Bin, or tap the Emoji to lift it and tap the Bin to drop it.
- **Hover-Correct**: A green glow + ✓ mark on the Bin matching the dragged Emoji, shown only for the first five placements of the first round, then permanently retired; non-matching Bins dim softly. The dragged Emoji keeps its own green drop feedback afterward.

## Path Builder Game

- **Puzzle**: A single Grid with a Start, Goal, and Obstacles that the player must solve.
- **Start**: The origin cell marked with 🚩 where the Path begins.
- **Goal**: The destination cell marked with 🏁 that the Path must reach.
- **Obstacle**: An impassable cell marked with 🧱 that the Path cannot cross.
- **Path**: An ordered list of adjacent cells connecting Start to Goal.
- **Hint**: A visual indicator showing the next optimal cell on the shortest Path.

## Brain Trainers (shared)

- **Trainer**: A short, goal-driven mini-game that trains one cognitive skill. No score, no fail state; Positive-Only Audio throughout; celebration only at round end.
- **Trainer Routes**: Every trainer uses `/games/{id}` (landing: hero + Play, no Level Bar — levels advance via Next Level ▶ / Replay), `/games/{id}/play` (redirects to the saved level), and `/games/{id}/play/[n]` (plays round *n*, saves it). Accepts `?seed=` for deterministic tests.
- **Trainer Progress**: Only the current level persists per game, via `src/lib/trainers/progress.js`.
- **Emoji Catalog**: Shared categorized emoji sets (`src/lib/trainers/emojiSets.js`: animals, food, vehicles, nature, sea, toys) plus an explicit Lookalikes table of visually confusable pairs reserved for high difficulty.
- **Trainer SFX Set**: The hybrid sound layer per trainer — synthesized micro-events (`trainerSounds.js`) + CC0 mp3 stings. Wobble and Speed Match window expiry are always silent.
- **Theme Loop**: A trainer's seamless background music track (15–30s, CC0, ≤400KB), volume ≈ 0.2, controlled solely by the existing SoundToggle; no separate music toggle.
- **Fanfare Sting**: Shared CC0 `fanfare.mp3` played when pressing Next Level ▶, pitch-shifted per game for identity.
- **Accent Sprites**: Kenney CC0 decorations allowed in exactly two places — trainer landing hero band and WinOverlay badge; play areas stay clean.

## Focus Tap Game

- **Target**: The emoji type the round asks the child to catch; shown large in the header ("Catch 🍎!").
- **Distractor**: Any non-target emoji in the Stream. Tapping one → gentle wobble, silent, never penalized.
- **Catch**: A successful tap on the Target; increments progress toward the round goal.
- **Stream**: The floating emojis rising up the screen; spawn interval shrinks and rise time drops with level.
- **Sneaky Tier**: Distractor difficulty band by level — L1–2 cross-category, L3–5 same-category, L6+ lookalikes.

## Quick Count Game

- **Flash**: The brief, level-scaled display of emojis to count (`max(800, 3000 − 150·n)` ms).
- **Glimpse Set**: The scattered, non-overlapping group of emojis shown during a Flash.
- **Answer Pill**: One of three big tappable number buttons (correct count ± near-misses) answering "how many?".

## Speed Match Game

- **Pair Card**: One deck card showing two emojis side by side; the child judges same or different.
- **Deck**: The full set of Pair Cards for a round (`8 + min(n, 12)`); finishing the Deck completes the round.
- **Auto-Advance Window**: Level-shrinking tempo window (`max(1500, 4000 − 100·n)` ms); expired cards advance silently — no penalty, ever.

## What Comes Next Game

- **Pattern Unit**: The repeating emoji block (e.g., AB, AABB, ABC) underlying a Prompt Strip.
- **Pattern Arc**: The fixed pedagogical ordering by level: AB → AAB/AABB → ABC/AABC → growing blocks `[A×k][B]`. Every level 1–10 is a distinct step (unit, strip length, distractor similarity, block count); L11+ plateaus at max difficulty (7 growing blocks).
- **Prompt Strip**: The visible emoji sequence with exactly one ❓ slot; answered from 3 options.

## Assets

- **Free Assets Guide** (`docs/free-assets.md`): complete inventory of all sounds in the repo (mp3 files + synthesized Web Audio tones, with code pointers and known gaps) plus curated free-license source sites for audio, music, images, icons, sprites, and 3D meshes.
- **Game Design Resources** (`docs/game-design-resources.md`): curated free sites explaining best practices for 2D game design, game feel/juice, menus/touch UX, sound design, graphics, and kids-specific UX.
