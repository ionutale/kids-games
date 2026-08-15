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
- **Parental Gate**: 3-tap- within-3s required to exit an active puzzle.
- **Monochrome Blueprint**: Ghost image on the Board rendered in heavily washed-out greyscale.
- **Single-Touch Lock**: Only one touch registered during a drag — resting palms ignored.
- **Drag Offset and Magnify**: Dragged Piece scales up 1.12× and shifts above the touch point.
- **Flat Borders**: Outer-perimeter Pieces have straight external edges.
- **Permanent Lock**: Snapped Pieces ignore all future touch events.

## TODO — New Game Ideas

The following games have been proposed but not yet designed or implemented. Each needs to go through the full brainstorming → design → spec → issues pipeline.

| # | Game | Concept | Spec | Issues | Status |
|---|------|---------|------|--------|--------|
| 1 | **Sequence Memory** (Simon Says) | Emoji sequence flashes, player repeats by tapping in order. Tests working memory. | [spec](docs/superpowers/specs/2026-07-10-sequence-memory-design.md) | [issues](docs/issues/sequence-memory-01-core-game.md) | Spec ready |
| 2 | **Emoji Math** | Arithmetic shown with emoji counts. Covers counting, addition, comparison. | [spec](docs/superpowers/specs/2026-07-10-emoji-math-design.md) | [issues](docs/issues/emoji-math-01-core-game.md) | Spec ready |
| 3 | **Spot the Difference** | Two emoji grids, player taps cells that differ. Visual scanning + attention. | [spec](docs/superpowers/specs/2026-07-10-spot-the-difference-design.md) | [issues](docs/issues/spot-the-difference-01-core-game.md) | Spec ready |
| 4 | **Category Sort** | Drag emojis into correct category bins. Categorization + logic. | [spec](docs/superpowers/specs/2026-07-10-category-sort-design.md) | [issues](docs/issues/category-sort-01-core-game.md) | Spec ready |
| 5 | **Path Builder** | Draw a path from Start to Goal avoiding obstacles. Spatial reasoning. | [spec](docs/superpowers/specs/2026-07-10-path-builder-design.md) | [issues](docs/issues/path-builder-01-engine.md) | Spec ready |
| 6 | **Tetris** | Classic falling-block puzzle with line clears, difficulty levels, classic scoring + best score. | — | — | [Wayfinding](.scratch/tetris/map.md) |
| 7 | **Emoji Jump** (Doodle Jump clone) | Endless vertical climber — touch-button steering, full Doodle Jump depth (platforms, springs, enemies, power-ups). | — | — | [Wayfinding](.scratch/tetris/map.md) |
| 8 | **Angry Emoji 2D** (Angry Birds clone) | Slingshot-drag emoji projectiles against destructible block towers; 20+ levels, 1-3 stars each. | — | — | [Wayfinding](.scratch/tetris/map.md) |

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
