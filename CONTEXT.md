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

- **Gallery Page** (`/games/glossary-puzzle`): the landing view — Level Bar, categories, difficulty selector, image grid. Full app chrome via GameShell (back link + sound toggle).
- **Level**: 1–10 predefined puzzle (image + grid difficulty); unlocked sequentially; persisted in localStorage (`glossary-puzzle-level-unlocked`).
- **Level Page**: `/games/glossary-puzzle/play/{n}` — each Level has its own URL/entry point.
- **Free-Play Page**: `/games/glossary-puzzle/play?image={id}&diff={key}` — opened from gallery image cards; resumed via `?resume=1` from saved Progress State.
- **PuzzleBoard**: shared solving component (board, Tray, drag ghost, Snap, Idle Nudge, win overlay) used by both play routes; Back/Next are real links.
- **Link-based Back**: exiting an active puzzle or leaving the gallery uses ordinary `<a href>` navigation — no parental gate.

## TODO — New Game Ideas

The following games have been proposed but not yet designed or implemented. Each needs to go through the full brainstorming → design → spec → issues pipeline.

| # | Game | Concept | Spec | Issues | Status |
|---|------|---------|------|--------|--------|
| 1 | **Sequence Memory** (Simon Says) | Emoji sequence flashes, player repeats by tapping in order. Tests working memory. | [spec](docs/superpowers/specs/2026-07-10-sequence-memory-design.md) | [issues](docs/issues/sequence-memory-01-core-game.md) | Spec ready |
| 2 | **Emoji Math** | Arithmetic shown with emoji counts. Covers counting, addition, comparison. | [spec](docs/superpowers/specs/2026-07-10-emoji-math-design.md) | [issues](docs/issues/emoji-math-01-core-game.md) | Spec ready |
| 3 | **Spot the Difference** | Two emoji grids, player taps cells that differ. Visual scanning + attention. | [spec](docs/superpowers/specs/2026-07-10-spot-the-difference-design.md) | [issues](docs/issues/spot-the-difference-01-core-game.md) | Spec ready |
| 4 | **Category Sort** | Drag emojis into correct category bins. Categorization + logic. | [spec](docs/superpowers/specs/2026-07-10-category-sort-design.md) | [issues](docs/issues/category-sort-01-core-game.md) | Spec ready |
| 5 | **Path Builder** | Draw a path from Start to Goal avoiding obstacles. Spatial reasoning. | [spec](docs/superpowers/specs/2026-07-10-path-builder-design.md) | [issues](docs/issues/path-builder-01-engine.md) | Spec ready |
| 6 | **Tetris** | Classic falling-block puzzle with line clears, difficulty levels, classic scoring + best score. | [spec](docs/superpowers/specs/2026-08-15-tetris-design.md) | — | [Spec ready](docs/superpowers/plans/2026-08-15-arcade-trilogy-plan.md) |
| 7 | **Emoji Jump** (Doodle Jump clone) | Endless vertical climber — touch-button steering, full Doodle Jump depth (platforms, springs, enemies, power-ups). | [spec](docs/superpowers/specs/2026-08-15-emoji-jump-design.md) | — | [Spec ready](docs/superpowers/plans/2026-08-15-arcade-trilogy-plan.md) |
| 8 | **Angry Emoji 2D** (Angry Birds clone) | Slingshot-drag emoji projectiles against destructible block towers; 20+ levels, 1-3 stars each. | [spec](docs/superpowers/specs/2026-08-15-angry-emoji-2d-design.md) | — | [Spec ready](docs/superpowers/plans/2026-08-15-arcade-trilogy-plan.md) |

## Sequence Memory Game

- **Pad**: One of 4 emoji buttons in a 2×2 grid that lights up during sequence playback.
- **Sequence**: An ordered list of Pads that the player must memorize and reproduce.
- **Round**: One complete cycle of sequence playback → player input → either advance or game over.
- **Second Chance**: After the first wrong tap, the Sequence replays at half speed before the player tries again.

## Emoji Math Game

- **Equation**: An arithmetic expression shown with emoji counts (e.g., `🍎 + 🍎 = ?`).
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

## Path Builder Game

- **Puzzle**: A single Grid with a Start, Goal, and Obstacles that the player must solve.
- **Start**: The origin cell marked with 🚩 where the Path begins.
- **Goal**: The destination cell marked with 🏁 that the Path must reach.
- **Obstacle**: An impassable cell marked with 🧱 that the Path cannot cross.
- **Path**: An ordered list of adjacent cells connecting Start to Goal.
- **Hint**: A visual indicator showing the next optimal cell on the shortest Path.

## Tetris Game

- **Board**: A 10×20 grid where Pieces fall and Line Clears happen.
- **Piece**: One of 7 SVG tetrominoes (I, O, T, S, Z, J, L) that the player steers.
- **Drop Interval**: Milliseconds per row-fall; difficulty-based at level 1, shrinking ~8% per Level with a 100ms floor.
- **Level**: Advances every 10 cleared Lines; multiplies Line-Clear scores.
- **Line Clear**: 1–4 completed rows removed; scores 100/300/500/800 × Level.
- **Ghost Piece**: Easy-only preview showing where the Piece will land.
- **Hold Piece**: Hard-only ability to stash a Piece for later.
- **Soft Drop**: Press-and-hold descent, +1 point per cell.
- **Hard Drop**: Instant drop, +2 points per cell.
- **Hint Button**: Highlights the best landing spot for the current Piece; no cooldown.
- **Best Score**: Per-difficulty high score persisted in localStorage.

## Emoji Jump Game

- **Climb**: The endless upward progression; score = height in meters.
- **Platform**: Static/moving/breakable surfaces that bounce the protagonist; spawn gaps 1.5–3.5× jump height with guaranteed reachability.
- **Altitude Band**: Start (0–150m, static-only), Mid (150–400m, moving/breakable/springs), Deep (400m+, enemies + power-ups, max density).
- **Spring**: ≤5% of platforms; bounces 2.5× a normal jump.
- **Enemy**: 👾 drifting on platforms from mid-altitude; contact = death.
- **Power-up**: Jetpack (fly ~150m/5s) and Shield (one hit); ≤3% each, collected by touching.
- **Best Height**: Highest climb persisted in localStorage.

## Angry Emoji 2D Game

- **Slingshot**: Touch drag-to-aim, release-to-launch; dotted aim-line always on.
- **Projectile**: 😡 default, 🐦🔥 heavy (breaks stone), 🧱 bouncy.
- **Target**: 😠 basic, 🤬 tough (2 hits), 👿 boss (shielded); hit state = cracked face + circling stars.
- **Block**: Wood/Ice/Stone destructible tower materials (validated AABB physics); crack overlay at ≤40% HP.
- **Physics Core**: AABB-only, no rotation; 4 substeps (no tunneling); kinetic-energy damage with 150px/s threshold.
- **Tier**: 4 tiers × 5 Levels; sequential unlock; tier 1 no stone → tier 4 multi-tower + moving blocks.
- **Ammo**: 1–3 shots per Level, tuned per layout; exhaustion ends the Level with a replay prompt.
- **Star**: 1★ ≥1 target, 2★ ≥60% max score, 3★ ≥90% max score; best stars persisted per Level.
