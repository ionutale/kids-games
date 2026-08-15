# Kids Games Arcade Trilogy — Implementation Plan (Tetris, Emoji Jump, Angry Emoji)

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task.

**Goal:** Build three arcade games — Tetris, Emoji Jump (Doodle Jump clone), Angry Emoji 2D (Angry Birds clone) — for the kids-games hub (ages 2–8+), each with difficulty-appropriate design, positive-only audio, localStorage best-score persistence, and full test coverage (unit + behavioral + e2e).

**Architecture:** Pure JS logic modules in `src/lib/<game>/` (no canvas — DOM/CSS/SVG + emoji, matching hub conventions). Game loops via requestAnimationFrame. Svelte 5 runes in `+page.svelte` routes.

**Tech Stack:** Svelte 5, SvelteKit, Vitest, Playwright, WebAudio tones (`$lib/sounds/audioManager.js`)

**Specs:**
- [Tetris spec](../specs/2026-08-15-tetris-design.md)
- [Emoji Jump spec](../specs/2026-08-15-emoji-jump-design.md)
- [Angry Emoji 2D spec](../specs/2026-08-15-angry-emoji-2d-design.md)

**Build order:** Tetris (simplest — no physics) → Emoji Jump (light physics) → Angry Emoji 2D (heaviest — validated physics engine, 20 levels). Each game is a complete vertical slice (logic → UI → integration → tests) before the next begins.

---

### Task 1: Tetris — Engine + Pieces

**Files:**
- Create: `src/lib/tetris/engine.js`
- Create: `src/lib/tetris/pieces.js`

- [ ] **Step 1: Create `src/lib/tetris/pieces.js`**

```js
// 7 tetrominoes: I, O, T, S, Z, J, L — each as a rotation-state matrix + SVG path
export const SHAPES = {
  I: { cells: [[1,1,1,1]], color: '#4FC3F7' },
  O: { cells: [[1,1],[1,1]], color: '#FFD54F' },
  T: { cells: [[0,1,0],[1,1,1]], color: '#BA68C8' },
  S: { cells: [[0,1,1],[1,1,0]], color: '#81C784' },
  Z: { cells: [[1,1,0],[0,1,1]], color: '#E57373' },
  J: { cells: [[1,0,0],[1,1,1]], color: '#64B5F6' },
  L: { cells: [[0,0,1],[1,1,1]], color: '#FFB74D' },
};

export function spawn(type, x = 3) {
  // returns { type, cells, x, y, rotation }
}

export function rotateCW(cells) { /* matrix rotate */ }
export function rotateCCW(cells) { /* matrix rotate */ }
```

- [ ] **Step 2: Create `src/lib/tetris/engine.js`**

```js
export const DIFFICULTIES = {
  easy:   { dropMs: 1000, ghost: true,  hold: false },
  medium: { dropMs: 700,  ghost: false, hold: false },
  hard:   { dropMs: 450,  ghost: false, hold: true },
};
export const SPEED_FLOOR_MS = 100;
export const LINES_PER_LEVEL = 10;
export const SCORES = { single: 100, double: 300, triple: 500, tetris: 800 };

export function createBoard(rows = 20, cols = 10) { /* 2D grid, null = empty */ }
export function stepInterval(level, difficulty) {
  // dropMs * 0.92^(level-1), floored at SPEED_FLOOR_MS
}
export function placePiece(board, piece) { /* lock piece into board */ }
export function clearLines(board) { /* returns { lines, score } using SCORES × level */ }
export function collide(board, piece, dx, dy) { /* AABB collision check */ }
export function softDropScore(cells) { return cells; }      // +1/cell
export function hardDropScore(cells) { return cells * 2; }  // +2/cell
```

- [ ] **Step 3: Unit tests** — `tests/unit/tetris.test.js`
  - 7 shapes spawn with correct dimensions; CW/CCW rotation round-trips
  - `stepInterval` shrinks ~8%/level and floors at 100ms per difficulty
  - `clearLines` scores 100/300/500/800 × level; multiple lines clear at once
  - soft/hard drop scoring
  - `collide` detects walls, floor, and occupied cells

- [ ] **Step 4: Behavioral tests** — `tests/behavioral/tetris.test.js`
  - Full round: spawn → move → rotate → soft drop → lock → line clear → level up
  - Difficulty matrix: intervals per E/M/H, ghost/hold availability
  - Game-over when stack reaches the top

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(tetris): engine + pieces with unit/behavioral tests"
```

---

### Task 2: Tetris — Route + UI

**Files:**
- Create: `src/routes/games/tetris/+page.js` (prerender=false, ssr=false)
- Create: `src/routes/games/tetris/+page.svelte`

- [ ] **Step 1: `+page.js`** — SSR off, matching hub convention

- [ ] **Step 2: Board rendering** — SVG tetrominoes in a kids palette; 10×20 grid of cells; ghost piece on Easy; subtle board border

- [ ] **Step 3: Controls** — on-screen buttons (left, right, CW, CCW, soft drop, hard drop) + swipe-drag on board to move + tap = rotate CW; single-touch lock; keyboard optional (←/→/↑/Z/↓/Space)

- [ ] **Step 4: Game flow** — rAF loop with accumulated drop time; `playing` / `paused` / `gameOver` states; pause button + auto-pause on visibilitychange; game-over overlay with score + best; tap to restart; parental gate (3 taps within 3s) to exit

- [ ] **Step 5: Scoring & persistence** — classic 100/300/500/800 × level; level-up every 10 lines; best score per difficulty in localStorage (`tetris-best-easy|medium|hard`); level-up = brief full-board flash (non-modal, <1.5s); new best = Confetti.svelte burst

- [ ] **Step 6: Hint button** — highlights best landing spot (ghost-cell flash) for current piece; no cooldown

- [ ] **Step 7: Sounds** — lock=tap, line clear=ascending chime (pitch rises with combo), Tetris=fanfare, level-up=two-note, new best=fanfare, failed drop=silence (WebAudio tones)

- [ ] **Step 8: E2E tests** — `tests/e2e/tetris.test.js`
  - Board + buttons load; hard drop places a piece
  - Scripted placements clear a line and score
  - Pause/resume; game-over overlay + restart

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat(tetris): route, UI, scoring, sounds, e2e tests"
```

---

### Task 3: Emoji Jump — Engine

**Files:**
- Create: `src/lib/emoji-jump/engine.js`

- [ ] **Step 1: Physics constants**

```js
export const GRAVITY = 980;          // px/s²
export const BAND_START = 0;         // 0–150m
export const BAND_MID = 150;
export const BAND_DEEP = 400;
export const GAP_MIN = 1.5;          // × jump height
export const GAP_MAX = 3.5;
export const SPRING_BOUNCE = 2.5;    // × normal jump
export const SPRING_RATE = 0.05;     // ≤5% of platforms
export const POWERUP_RATE = 0.03;    // ≤3% each
export const ENEMY_FIRST_M = 200;    // no enemies before 200m
export const ENEMY_SPACING_M = 60;
```

- [ ] **Step 2: Platform generation** — `nextPlatform(prev, height)`: vertical gap 1.5–3.5× jump height, horizontal jitter around the climb column, **reachability guarantee** (column drift bounded so every gap is jumpable); band-dependent type mix (static ~70%, moving ~15%, breakable ~15% from mid; static-only before 150m)

- [ ] **Step 3: Core loop functions** — jump physics (landing bounce), spring bounce (2.5×), breakable collapse after one bounce, moving platform drift, enemy drift + spacing per altitude, power-up spawn/collect (jetpack ~150m/5s, shield one hit), score = meters climbed + 50/spring

- [ ] **Step 4: Unit tests** — `tests/unit/emoji-jump.test.js`
  - Gaps within 1.5–3.5× jump height; reachability property holds for 1000 generated platforms
  - Band progression: static-only <150m; enemies/power-ups ≥400m
  - Spring 2.5×; jetpack flight; shield absorbs one hit
  - Score: meters + 50/spring, no dodge bonus

- [ ] **Step 5: Behavioral tests** — `tests/behavioral/emoji-jump.test.js`
  - Full run: spawn → bounce → steer → spring → enemy → power-up → death
  - Fairness: generated columns always reachable

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(emoji-jump): engine with unit/behavioral tests"
```

---

### Task 4: Emoji Jump — Route + UI

**Files:**
- Create: `src/routes/games/emoji-jump/+page.js` (prerender=false, ssr=false)
- Create: `src/routes/games/emoji-jump/+page.svelte`

- [ ] **Step 1: Rendering** — fixed 😀 protagonist with squash-and-stretch + tilt; platforms as colored SVG/CSS blocks (emoji+SVG mix); springs as spring emoji (compress on contact); 👾 enemies; jetpack/shield power-ups floating above platforms; world scrolls up with climb

- [ ] **Step 2: Controls** — press-and-hold left/right buttons; keyboard ←/→; single-touch lock

- [ ] **Step 3: Game flow** — rAF loop, fixed-timestep physics; `playing`/`paused`/`gameOver`; auto-pause on blur; game-over overlay with height + best height; tap to restart; parental gate to exit

- [ ] **Step 4: Persistence** — best height in localStorage (`emoji-jump-best`)

- [ ] **Step 5: Sounds** — bounce=soft pop, spring=boing, power-up=bright chime, new best=fanfare, game over=silence

- [ ] **Step 6: E2E tests** — `tests/e2e/emoji-jump.test.js`
  - Page loads with emoji + steering buttons
  - Buttons move the emoji horizontally
  - Falling below screen → game-over overlay
  - Best height persists across reloads

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(emoji-jump): route, UI, persistence, sounds, e2e tests"
```

---

### Task 5: Angry Emoji — Physics Engine (lift from prototype)

**Files:**
- Create: `src/lib/angry-emoji/phys.js`

- [ ] **Step 1: Lift the validated engine** from `src/lib/angry-emoji/phys-prototype.html` on branch `prototype/angry-emoji-towers` (commit 5fc2e89) — the pure `PHYS` module (createWorld/addBody/step) with: AABB-only collision (no rotation), 4 fixed substeps, positional correction with 0.5px slop, impulse resolution with restitution, Coulomb friction, kinetic-energy damage (speed² × mass × 0.001, 150px/s threshold), materials wood hp60 / ice hp25 / stone hp240

- [ ] **Step 2: Port engine to ESM module** (`src/lib/angry-emoji/phys.js`) with the prototype's constants; add `removeBody`/`queryBodies` if needed by level logic; verify the Node physics tests from the prototype still pass (stack 0 jitter, no tunneling @1750px/s, wood breaks full-power/not gentle, ~0.1ms/step @100+ bodies)

- [ ] **Step 3: Unit tests** — `tests/unit/angry-emoji.test.js`
  - Physics: stack stability, tunneling guard, material damage thresholds, friction stops sliding
  - Projectile behaviors: 🐦🔥 breaks stone, 🧱 bouncy restitution

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(angry-emoji): lift validated physics engine with unit tests"
```

---

### Task 6: Angry Emoji — Levels + Score

**Files:**
- Create: `src/lib/angry-emoji/levels.js`
- Create: `src/lib/angry-emoji/score.js`

- [ ] **Step 1: `src/lib/angry-emoji/score.js`**

```js
export const POINTS = { target: 10, block: 5, unusedShot: 25 };
export function levelMaxScore(level) { /* all targets + all blocks + ammo×25 */ }
export function starsFor(score, maxScore, targetsDestroyed) {
  if (targetsDestroyed < 1) return 0;
  if (score >= maxScore * 0.9) return 3;
  if (score >= maxScore * 0.6) return 2;
  return 1;
}
```

- [ ] **Step 2: `src/lib/angry-emoji/levels.js`** — 20 level definitions as static config arrays: tower layouts (block types + positions), emoji placements, ammo counts (1–3), tier assignment (T1 single tower/1 bird/no stone → T4 multi-tower + moving blocks/3 birds); levels reference the physics engine's body spawn API

- [ ] **Step 3: Unit tests** — 20 levels valid (ammo 1–3, no stone in T1, tier progression), star thresholds (1★/2★/3★), max-score math

- [ ] **Step 4: Behavioral tests** — `tests/behavioral/angry-emoji.test.js`
  - Full level simulation: launch → flight → impact → collapse → target destroyed → score → stars
  - Ammo exhaustion → remaining targets shown, replay prompt
  - Shielded boss requires 🐦🔥

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(angry-emoji): levels + score with unit/behavioral tests"
```

---

### Task 7: Angry Emoji — Route + UI

**Files:**
- Create: `src/routes/games/angry-emoji/+page.js` (prerender=false, ssr=false)
- Create: `src/routes/games/angry-emoji/+page.svelte`

- [ ] **Step 1: Level select** — tier map (4 tiers × 5 levels), per-level best stars, locked tiers unlock sequentially

- [ ] **Step 2: Play view** — slingshot with drag-to-aim/release-to-launch; always-on dotted aim-line to first bounce; emoji projectiles 😡/🐦🔥/🧱 and targets 😠/🤬/👿 (rest = neutral face, hit = cracked face + circling stars); blocks with kid looks (logs/icicles/boulders) + crack overlay at ≤40% HP; score HUD; shots remaining; pause

- [ ] **Step 3: Game flow** — `aiming`/`flying`/`settling`/`levelEnd`/`paused`; settling = wait for stability after projectile stops; level end = all targets destroyed OR ammo exhausted (remaining targets shown, replay prompt); stars awarded; best stars persisted per level (`angry-emoji-levels`); parental gate to exit

- [ ] **Step 4: Sounds** — launch=whoosh, block break=crack/pop, target=happy pop, level complete=ascending chime, new best=fanfare, miss=silence

- [ ] **Step 5: E2E tests** — `tests/e2e/angry-emoji.test.js`
  - Level select shows 20 levels + locked tiers
  - Slingshot drag launches projectile (aim-line visible)
  - Scripted shot destroys a target, awards stars
  - Best stars persist across reloads

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(angry-emoji): route, UI, slingshot, stars, sounds, e2e tests"
```

---

### Task 8: Hub Integration + Localization

**Files:**
- Edit: `src/routes/+page.svelte` (add 3 game tiles to the `games` array)
- Edit: `src/lib/stores/locale.js` (add en/it/ro keys for all 3 games + shared strings)

- [ ] **Step 1: Hub tiles** — add to the `games` array:

```js
{ id: 'tetris',       icon: '🧱', key: 'tetris' },
{ id: 'emoji-jump',   icon: '🦘', key: 'emojiJump' },
{ id: 'angry-emoji',  icon: '😡', key: 'angryEmoji' },
```

- [ ] **Step 2: Locale keys** — en: `tetris: 'Tetris'`, `emojiJump: 'Emoji Jump'`, `angryEmoji: 'Angry Emoji'`; it: `'Tetris'`, `'Salto Emoji'`, `'Emoji Arrabbiato'`; ro: `'Tetris'`, `'Săritura Emoji'`, `'Emoji Furios'`. Reuse existing shared strings (`score`, `level`, `gameOver`, `replay`, `tryAgain`, `playAgain`, `back`).

- [ ] **Step 3: Verification** — all three routes load from the hub in all 3 locales; `pnpm build` passes; screenshots updated (`node scripts/screenshots.mjs` if that's the convention)

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(hub): add tetris, emoji-jump, angry-emoji tiles + localization"
```

---

### Task 9: Final Polish

- [ ] **Step 1: Run full test suite**

```bash
pnpm test && HEADED=true npx playwright test
```

- [ ] **Step 2: Manual pass** — each game on a mobile viewport (390×844): difficulty selection, pause, game over, restart, parental gate, sound toggle

- [ ] **Step 3: If all pass, commit final**

```bash
git add -A && git commit -m "chore: final polish and full test pass"
git push
```
