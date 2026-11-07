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

- **Gallery Page** (`/games/glossary-puzzle`): the landing view — LadderBar, wrapping category chips, image grid. Full app chrome via GameShell (back link + sound toggle). Accepts `?level={n}` to preselect the difficulty step. Cards are 4:3 `<button>`s (thumb + name + badge); tapping one opens the Preview Screen. Category order (`CATEGORY_ORDER`): `myPhotos, nature, animals, food, adventure, vehicles, shows`; the former Blippi category is now **Shows** (`🧢`), and `My Photos ⭐` is always shown.
- **Preview Screen**: full-bleed gallery overlay (not a route) showing the complete uncropped image + big name, a faint grid tease of `levelConfig(level)`, a `Level {n} · {pieces} pieces` pill, and the primary **▶ Start** link to `/games/glossary-puzzle/play/{level}?image={id}`. Closes via big ✕ or backdrop tap; plays `playPickup()` once on open. Resume (Continue card) skips it.
- **My Photos**: the family's own pictures — added by a parent through the **Parent Gate** (3-second continuous press; ring fills, iOS callout suppressed, early release resets), decoded on-device and stored per-device in IndexedDB (`kids-games-photos`). Not synced; cleared with site data. `photo:<uuid>` ids play exactly like builtins.
- **Solved Badge**: per-image progress persisted under `glossary-puzzle-solved` (`{ [imageId]: highestLevelSolved }`); `badgeFor` yields a small ✓ when solved at the current level, a gold rim + 🎓 once solved at level 10 (`MAX_LEVEL`), else none.
- **Photo Pipeline**: `addPhotoFromFile` decodes `createImageBitmap(file, {imageOrientation:'from-image'})` → `createImageBitmap(file)` → `HTMLImageElement`, applies EXIF orientation, then fits the longest edge to **1600px** JPEG q0.85 as the blob and **400px** q0.8 as the thumb; caps **30 photos / ~50MB total**, checked before insert; typed errors `decode | limit | quota`. iPhone HEIC arrives as JPEG through the file input.
- **resolveImage**: the one merged image source — builtin id → `PUZZLE_IMAGES` VM, `photo:<uuid>` → IndexedDB record, anything else (including a since-deleted photo) → `null` so callers fall back to the level rotation.
- **Level**: 1–10 (the shared ladder cap); Level *N* gives grid `cols = 2 + ⌊N/2⌋`, `rows = 2 + ⌊(N−1)/2⌋`, snap radius `max(14, 44 − 2N)`. Level 10 is the top of the ladder; deeper links clamp to 10. Any image can be played at any level.
- **Toddler Snap**: a drop is accepted if the lifted ghost's visual point *or* raw thumb lands anywhere inside the piece's own target hole expanded by `max(snapRadius, 20% cell size)`; accepted drops that land far from center glide magnetically into place (~160ms).
- **Level Page**: `/games/glossary-puzzle/play/{n}?image={id}` — every solving session is its own URL; without `?image=` the image rotates by level.
- **Free-Play Page**: `/games/glossary-puzzle/play?image={id}&level={n}` — opened from gallery image cards; also serves `?resume=1` for saved Progress State (placed pieces handed off via sessionStorage).
- **PuzzleBoard**: shared solving component (board, Tray, drag ghost, Snap, Idle Nudge, win overlay) used by both play routes; remounted per URL via `{#key}` so navigation always yields a fresh board.
- **Link-based Back / Next**: exiting an active puzzle uses an ordinary `<a href>` to the gallery; the win dialog offers **Play Again** (same image + level), **Next Level ▶** (same image, level + 1; at level 10 it is replaced by the shared 🎓 mastery badge), and **Back** (gallery link). No parental gate, no unlock gating.

## Sequence Memory Game

- **Pad**: One of 4 emoji buttons in a 2×2 grid that lights up during sequence playback.
- **Sequence**: An ordered list of Pads that the player must memorize and reproduce.
- **Round**: One complete cycle of sequence playback → player input → either advance or game over.
- **Second Chance**: After the first wrong tap, the same Sequence replays at half speed before the player tries again.

## Emoji Math Game

- **Equation**: An arithmetic expression shown with emoji counts and real + / − signs (e.g., `🍎 + 🍎 = ?`, `🍎🍎🍎 − 🍎 = ?`); age 4 mixes addition and subtraction within 10, age 5+ interleaves addition, subtraction ≤20, and comparison.
- **Distractor**: One of the three incorrect multiple-choice answers, positioned ±1 or ±2 from the correct answer.
- **Milestone**: A celebration triggered every 10 correct answers.

## Spot the Difference Game

- **Harbor**: the chosen world — a seaside harbor with a lighthouse, pier, boats, gulls and a pier cat.
- **Twin Pictures**: the two stacked panels, Picture 1 and Picture 2, showing the same harbor.
- **Prop**: one emoji object placed on the harbor. Nine to twelve per picture.
- **Difference**: one prop that changes between the pictures — Swap, Missing, Moved or Size.
- **Hotspot**: the generous circle around a Difference. A Moved prop's hotspot spans both positions.
- **Found Difference**: a Difference that has been tapped; it rings in both pictures.
- **Hint**: after about eight seconds with no find, one unfound Difference pulses softly. No penalty.
- **Postcard**: the reward for a solved puzzle; stored in the album.
- **Set**: five puzzles at the Settings age band (2 / 3 / 4 Differences). Flat difficulty.
- **Postcard Album**: the persisted collection (`spotPostcards`); the latest twelve show on the set-complete card.
- **Found Tokens**: the row of tokens for the current puzzle's Differences.
- **Set Strip**: the row of postcard slots showing Set progress.
- **No pressure**: no timer, no fail, no mistake count; a wrong tap only wobbles.

## Category Sort Game

- **Room**: the cutaway scene that holds the Zones and the Tray. It replaced the old single-item drop area.
- **Zone**: a large illustrated home for one Category (Animals, Food, Vehicles, Nature, Clothes, Toys). "Bin" is the legacy name for the same thing.
- **Category**: a labeled group of related Emojis.
- **Tray**: the rug at the bottom of the Room holding every item in the Round.
- **Round**: one shuffled set of 6–10 Emojis that must be placed into the Zones.
- **Shelf**: the growing collection of placed Emojis inside a Zone.
- **Tap-to-Place**: drag an Emoji into a Zone, or tap the Emoji to lift it and tap the Zone.
- **Helper**: a green glow plus ✓ on the matching Zone, shown only for the first five placements of level 1, then retired. The dragged Emoji keeps its own green glow as the item-side cue.
- **Spring-back**: a wrong Zone wobbles silently and the dragged Emoji springs back to its tray slot; it is never consumed.

## Path Builder Game

The game is moving from a grid puzzle to a continuous freehand road (ADR 0005). The grid terms are legacy until the migration ships.

- **Scene**: the continuous illustrated world for one Layout; no visible grid or blocks.
- **Road**: the freehand line the child draws from Home to Destination. It cannot enter a Blocker. The Road persists between strokes; backtracking over it erases to that point.
- **Walker**: the character that travels the Road after it connects (a fox in the current world).
- **Home**: the fixed starting place of a Scene, on one side.
- **Destination**: the fixed goal place, on the opposite side.
- **Blocker**: a natural obstacle (rock, pond, hedge) the Road cannot enter; the stroke stops at its edge.
- **Star**: a collectible the Walker picks up when the Road passes near it; required in later Levels.
- **Guide**: the teaching aid — a one-time ghost hand that traces the first Road, and a faint suggested Road shown after idling.
- **Layout**: one generated Scene; five Layouts make a Level.
- **Level**: one step of the shared 10-step Ladder; difficulty grows by distance, Blockers and required Stars.
- **Legacy grid terms**: Puzzle, Start, Goal, Obstacle (cell-based) are retired by ADR 0005.

## Pop Game

- **Bubble**: a rising soap film carrying one Surprise.
- **Surprise**: the trinket inside a Bubble — fish, starfish, shell, flower or butterfly.
- **Pop**: bursting a Bubble. Consecutive Pops in one swipe form a **Chain**, with rising pitch.
- **Giant Bubble**: needs two taps; worth two Jar slots.
- **Star Bubble**: rare; worth two Jar slots and leaves a star sticker on the Jar.
- **Jar**: the visual score target; fills as Surprises are collected. No numbers.
- **Moon Timer**: the 30-second gentle clock, drawn as a moon crossing an arc.
- **Round**: one 30-second pond session. The shared Ladder's Level chooses the target and speed.
- **Good Try**: the calm card when the Moon Timer ends before the Jar fills — Try again / Back, no star, no sad sound.
- **Rising Pond**: the chosen world — a moonlit pond with lily pads, reeds and fireflies.

## Quiz Games

- **Topic**: One quiz's content set (`src/lib/quiz/topics.js`) — Animals, Food, Vehicles, Colors & Shapes, Clothes, Toys, Instruments.
- **Item**: A single quiz entry `{ emoji, en, it, ro, de, fr, zh }`; every quiz requires all six locale names.
- **Quiz Round**: One pass through a Topic: big emoji → 3 localized name options → silent red shake on wrong (after two misses the correct option pulses softly), green pop + confetti on correct, All-done overlay with Play Again and Back.


## Italian Grammar Game

- **Exercise**: One grammar task — a sentence with a `___` blank (verb, article, plural, preposition, imperative) or a picture-to-sentence match; always 3 options.
- **Prompt**: The sentence with the blank, or the scene emoji for picture exercises.
- **Level**: 1–10 distinct difficulty steps (volere → -are → -ere/-ire → articles → plurals → prepositions → imperatives → pictures → mixed); the ladder ends at 10 — Next Level ▶ disappears there and deeper links clamp to 10. The landing shows the shared LadderBar.
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

## Level Ladder (shared)

- **Ladder**: Every level game offers exactly 10 levels; the current level persists per game. Finishing level 10 marks the game **Mastered** (🎓); deeper links clamp to 10.
- **Ladder Store** (`src/lib/ladder/progress.js`): the one progress store — camelCase localStorage keys (`{gameId}Level`, `{gameId}Mastered`), clamps 1–10, plus one-time migration from pre-ladder keys (`memory-unlocked-level`, `path-builder-level`).
- **LadderBar** (`src/lib/ladder/LadderBar.svelte`): the one level indicator/picker — done steps below the current level, 🎓 on step 10 once mastered; free pick, nothing is ever locked. It does not show stars.
- **LadderActions** (`src/lib/ladder/LadderActions.svelte`): the one win-overlay action row — Replay / Next Level ▶ / Back; at level 10 the Next action is replaced by 🎓, and mastery is saved when the overlay renders at the top level.
- **Ladder Games**: memory, puzzle, glossary-puzzle, sorting, category-sort, path-builder, pop, soccer, grammar, focus-tap, quick-count, speed-match, what-comes-next. Free-play games (paint, stickers, splash) and score games (sequence-memory, emoji-math, spot-the-difference) have no ladder.

## Soccer Game

- **Pitch**: the night stadium seen from behind the ball. SVG ball, child striker, bear keeper, crowd and net. No emoji on the pitch.
- **Shot**: a swipe anywhere. A reticle and dashed trajectory show the impact point; the swipe length only sets the flight time.
- **Flight**: the ball's arc to the impact. A Goal flashes the net; the arc does not change the result.
- **Keeper**: the bear in the goal mouth. He patrols continuously and dives late; the far corner always has room.
- **Reach**: the band around the Keeper that turns an impact in the goal into a Save.
- **Goal**: an impact in the goal mouth outside the Keeper's Reach. A Save is the same impact inside the Reach. A Miss is outside the mouth.
- **Shots**: five per Round, shown as ball pips.
- **Round**: five shots. The target is 3 goals at level 1 rising to 5 at level 10. All five shots are always played; the target decides the win. A round below the target shows a Good Try.
- **Star Row**: 1/2/3 stars for 3/4/5 goals. The best per level is stored in `soccerStars` and shown in a local row above the ladder. The shared ladder still shows no stars (ADR 0001).
- **Good Try**: the calm card when the five shots finish below the target — Try again / Back, no star, no sad sound.
- **Night Penalty**: the chosen world and behind-the-ball camera.

## Brain Trainers (shared)

- **Trainer**: A short, goal-driven mini-game that trains one cognitive skill. No score, no fail state; Positive-Only Audio throughout; celebration only at round end.
- **Trainer Routes**: Every trainer uses `/games/{id}` (landing: hero + Play + LadderBar; levels advance via Next Level ▶ / Replay), `/games/{id}/play` (redirects to the saved level), and `/games/{id}/play/[n]` (plays round *n*, saves it). Accepts `?seed=` for deterministic tests.
- **Trainer Progress**: The current level (1–10, clamped) and a mastery flag persist per game, via the shared ladder store `src/lib/ladder/progress.js`.
- **Emoji Catalog**: Shared categorized emoji sets (`src/lib/trainers/emojiSets.js`: animals, food, vehicles, nature, sea, toys) plus an explicit Lookalikes table of visually confusable pairs reserved for high difficulty.
- **Trainer SFX Set**: The hybrid sound layer per trainer — synthesized micro-events (`trainerSounds.js`) + CC0 mp3 stings. Wobble and Speed Match window expiry are always silent.
- **Theme Loop**: A trainer's seamless background music track (15–30s, CC0, ≤400KB), volume ≈ 0.2, controlled solely by the existing SoundToggle; no separate music toggle.
- **Fanfare Sting**: Shared CC0 `fanfare.mp3` played when pressing Next Level ▶, pitch-shifted per game for identity.
- **Accent Sprites**: Kenney CC0 decorations allowed in exactly two places — trainer landing hero band and WinOverlay badge; play areas stay clean.

## Focus Tap Game

- **Pond**: the moonlit pond scene; the chosen world for the game.
- **Frog**: the character on a lily pad who holds the Target Sign.
- **Target Sign**: the little board the Frog holds, showing the Target emoji.
- **Target**: the emoji the Frog asks for; the only emoji that scores.
- **Distractor**: any non-target emoji. Tapping it wobbles it silently; never penalized.
- **Catch**: a tap on a Target. The Frog's tongue flicks out, the target pops, and a firefly lands in the Jar.
- **Firefly Jar**: the visual progress; each Catch lights one firefly; the Jar fills to the round Goal. No numbers.
- **Stream**: the floating emojis rising up the pond; spawn interval shrinks and rise time drops with level.
- **Sneaky Tier**: distractor difficulty band — L1–2 cross-category, L3–5 same-category, L6+ lookalikes.
- **Goal**: 6 + level Catches, capped at 20. No timer, no fail.
- **Trainer Music**: the shared focus-tap music keeps playing under the pond; catch plops, a soft croak and a fill chime sit on top.

## Quick Count Game

- **Picnic**: the chosen world; a bear, a checkered cloth, a berry bush and a basket. Replaces the abstract starry panel.
- **Bear**: the asker. Holds a speech bubble ("How many?" or "3 🍓") and reacts to a correct feed.
- **Cloth**: the checkered picnic cloth where the Flash Objects appear.
- **Flash Object**: one themed object (berry, egg, cookie, apple) repeated for the round. Repeats let the count grow past the old distinct-emoji cap.
- **Count**: how many Flash Objects appear; 1–3 at level 1, 1–6 at level 4, 1–8 at level 7, 1–10 at level 10.
- **Answer Pill**: one of three number buttons; each shows the digit and that many theme dots.
- **Berry Basket**: the round progress; one berry lights per correct answer. No digits.
- **Flash**: the brief display of the Cloth. Its duration is `max(800, 3000 − 150·level)` ms.
- **Count Tick**: a soft tick per Flash Object during the Flash, on levels 1–2 only, as a counting aid.
- **Goal**: 5 + min(level, 10) prompts. No timer, no fail.
- **Trainer Music**: the shared quick-count music stays under the picnic effects.

## Speed Match Game

- **Pair Card**: One deck card showing two emojis side by side; the child judges same or different.
- **Deck**: The full set of Pair Cards for a round (`8 + min(n, 12)`); finishing the Deck completes the round.
- **Auto-Advance Window**: Level-shrinking tempo window (`max(1500, 4000 − 100·n)` ms); expired cards advance silently — no penalty, ever.

## What Comes Next Game

- **Pattern Unit**: The repeating emoji block (e.g., AB, AABB, ABC) underlying a Prompt Strip.
- **Pattern Arc**: The fixed pedagogical ordering by level: AB → AAB/AABB → ABC/AABC → growing blocks `[A×k][B]`. Every level 1–10 is a distinct step (unit, strip length, distractor similarity, block count); L11+ plateaus at max difficulty (7 growing blocks).
- **Prompt Strip**: The visible emoji sequence with exactly one ❓ slot; answered from 3 options.

## Splash Game

- **Splash**: A free-play game where tapping or dragging on the surface emits celebratory emoji.
- **Particle**: One emoji emitted by Splash that appears, animates, and disappears.
- **Burst**: The group of particles emitted by one spawn event.
- **Live Count**: The number of particles currently animating.
- **Splash Budget**: The cap, cadence, and lifetime that bound Splash's particles.
- **Trail**: The stream of Bursts that follows a moving finger; a still finger is not a Trail.
- **Fluid**: Splash meets the iPhone XR acceptance bar: during a 10-second drag, average frame rate is at least 30fps, the 95th-percentile frame is at most 50ms, and no frame exceeds 200ms.

## Stickers Game

- **Canvas**: The single full-bleed play surface for a World; it holds the World art and all Placed Stickers. V1 has one Canvas, Dino Valley.
- **World**: The themed illustrated setting painted on a Canvas. Dino Valley ships first; Coral Bay, Space Camp, and Moonlit Meadow are future worlds.
- **Scene**: The child's saved arrangement of Placed Stickers on a Canvas. Each World has one Scene.
- **Play Area**: The part of the Canvas above the Shelf where Placed Stickers live.
- **Sticker**: A die-cut illustrated object on the Shelf. A Sticker type can be placed many times.
- **Placed Sticker**: One instance of a Sticker on the Canvas. It can be moved or peeled off; the last touched is on top.
- **Shelf**: The horizontal strip at the bottom of the Canvas holding the World's Sticker types. It scrolls and is not an inventory.
- **Vehicle Sticker**: A Sticker in the vehicle group — emergency (fire truck, police car, ambulance) or work (bulldozer, excavator, dump truck). Vehicles share the Dino Valley Shelf; they do not add a World.
- **Peel**: Dragging a Placed Sticker back to the Shelf to remove it.
- **Soft Cap**: The 80-Placed-Sticker ceiling; the Shelf shows a full cue and new placements pause until a sticker is peeled.
- **Reset**: The two-step action that clears all Placed Stickers from the Canvas.
- **Scene Picker**: The future screen for choosing a World; not in v1.

## Paint Game

- **Paint Studio**: The full-bleed paper place in Paint; a fresh white sheet with a floating dock and corner chips, no `GameShell`.
- **Sheet**: One paper in the Paint Studio — either a Blank Sheet or a Coloring Sheet. One Sheet is active at a time.
- **Blank Sheet**: A free-paint sheet with no line art; brushes, stamps, and eraser work anywhere.
- **Coloring Sheet**: A Sheet with original line art and named Regions; the bucket and clipped brush color it.
- **Region**: One closed, named shape in a Coloring Sheet's line art (sky, volcano, dino body, etc.) that can be filled or painted.
- **Line Art**: The charcoal SVG outlines above a Coloring Sheet; paint never covers them.
- **Bucket**: The tap-to-fill tool that colors one Region with the current color.
- **Clipped Stroke**: A brush stroke confined to the Region under its start point; crossing a line ends the stroke.
- **Stamp**: A discrete SVG decoration (star, heart, butterfly, flower) placed on a Sheet; it may overlap line art like a real sticker.
- **Studio Dock**: The floating bottom tool tray: current color, brush sizes, bucket, stamp, eraser, undo.
- **Paint Palette**: The eight-pot color tray opened from the current color well.
- **Stamp Tray**: The four-stamp picker opened from the stamp tool.
- **Paper Tray**: The paper-card picker opened from the current-paper chip; switching saves the current Sheet.
- **Sheet Document**: The saved fills, strokes, and stamps for one Sheet, stored per sheet under `kids-games-paint` v1.
- **Undo**: The 20-action in-memory history for the active Sheet; it resets on switch or reload.
- **Clear**: The parent-facing, two-step action that clears only the current Sheet; the other Sheets are untouched.

## Assets

- **Free Assets Guide** (`docs/free-assets.md`): complete inventory of all sounds in the repo (mp3 files + synthesized Web Audio tones, with code pointers and known gaps) plus curated free-license source sites for audio, music, images, icons, sprites, and 3D meshes.
- **Game Design Resources** (`docs/game-design-resources.md`): curated free sites explaining best practices for 2D game design, game feel/juice, menus/touch UX, sound design, graphics, and kids-specific UX.
