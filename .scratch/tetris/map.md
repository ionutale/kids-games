# Wayfinder Map: Tetris, Emoji Jump, Angry Emoji

## Destination

Design specs + implementation plan for three arcade-style games, filed in `docs/superpowers/specs/` and `docs/superpowers/plans/`, ready to be sliced into implementation issues like the other "Spec ready" games:

- **Tetris** — `docs/superpowers/specs/2026-08-15-tetris-design.md`
- **Emoji Jump** (Doodle Jump clone) — `docs/superpowers/specs/2026-08-15-emoji-jump-design.md`
- **Angry Emoji 2D** (Angry Birds clone) — `docs/superpowers/specs/2026-08-15-angry-emoji-2d-design.md`
- **One shared implementation plan** covering all three games in a build order.

## Notes

- Domain: kids-games hub (SvelteKit 5, touch-first, fullscreen on load, single-touch lock).
- Skills to consult on tickets: `/grilling` and `/domain-modeling`.
- Standing hub conventions: positive-only audio (WebAudio tones via `$lib/sounds/audioManager.js`), parental gate (3 taps within 3s) to exit, single-touch lock during drags, localStorage for persisted state, i18n EN/IT/RO via `$lib/stores/locale.js`.
- **Physics stance**: per-game hand-rolled physics, zero new dependencies (repo currently has one tiny dep: headbreaker).
- **Scope dominators**: emoji-jump is full Doodle Jump depth (moving/breakable platforms, springs, enemies, power-ups); angry-emoji-2d is 20+ levels with destructible towers. The towers are the hardest engineering surface of the whole effort — see [05-destructible-towers-prototype](issues/05-destructible-towers-prototype.md).
- Update `CONTEXT.md` glossary with new game terms as they resolve (domain-modeling).

## Decisions so far

- [Destination: design spec](issues/00-charting-round.md) — the map resolves design decisions, then hands off to implementation tickets.
- [Player fit: difficulty levels](issues/00-charting-round.md) — Easy/Medium/Hard like the puzzle game; score matters at every age.
- [Score scope: classic + best score](issues/00-charting-round.md) — 100/300/500/800 per line × level, speed-up per level, best score in localStorage (reusing the puzzle's Progress State pattern). No hub-wide leaderboard.
- [Controls: buttons + swipe](issues/00-charting-round.md) — on-screen buttons (move L/R, rotate, soft drop, hard drop) + swipe-drag to move, tap = rotate; keyboard optional.
- [Rendering: SVG tetrominoes](issues/00-charting-round.md) — colorful SVG tetrominoes in a kids palette, crisp at any scale.
- [Difficulty model: speed + features](issues/00-charting-round.md) — drop speed + lines-per-level differ; Easy gets a ghost piece; Hard adds a hold piece; score unaffected.
- [Board: 10×20 standard](issues/00-charting-round.md) — standard 10 columns × 20 rows, 7 tetrominoes.
- [Pause & game over: pause + gate](issues/00-charting-round.md) — pause button + auto-pause on tab blur; game-over overlay shows score + best score; tap to restart; parental gate to exit.
- [Output shape: 3 specs + 1 plan](issues/00-charting-round.md) — one spec per game (repo convention) + one shared implementation plan across all three games.
- [Tetris gets a plan too](issues/00-charting-round.md) — all three games ship end-to-end as one effort.
- [Physics: per-game hand-rolled](issues/00-charting-round.md) — no shared engine, no new dependencies; each game rolls its own minimal kinematics.
- [Emoji-jump controls: touch buttons](issues/00-charting-round.md) — on-screen left/right buttons (press-and-hold sides of screen) + optional keyboard arrows; no tilt.
- [Angry-emoji structure: level-based + stars](issues/00-charting-round.md) — hand-crafted levels, 1-3 stars per level, best scores saved per level.
- [Emoji-jump difficulty: endless ramp](issues/00-charting-round.md) — score = height climbed, gravity/platform density slowly ramp up; best height saved to localStorage.
- [Emoji-jump depth: full Doodle Jump](issues/00-charting-round.md) — moving + breakable platforms, springs, enemies to dodge, power-ups (jetpack, shield).
- [Angry-emoji physics: destructible towers](issues/00-charting-round.md) — emoji projectiles collide with towers of destructible blocks that collapse under emoji targets.
- [Angry-emoji launch: slingshot drag](issues/00-charting-round.md) — drag emoji back, release to launch, with dotted aim-line trajectory preview.
- [Angry-emoji levels: 20+ with stars](issues/00-charting-round.md) — 20+ hand-crafted levels, 3 stars each based on points (targets destroyed + shots remaining), best stars per level in localStorage.
- [Rendering: emoji + SVG mix](issues/00-charting-round.md) — emoji for characters/targets, SVG/colored blocks for platforms, towers, terrain (Tetris stays all-SVG tetrominoes).

## Not yet specified

- Emoji-jump design details — platform generation rules, enemy & power-up catalog, scoring/best-height specifics, ramp curve (fog of [03-emoji-jump-design](issues/03-emoji-jump-design.md)).
- Angry-emoji design details — star thresholds, shots (ammo) per level, block materials, trajectory preview behavior, level-design conventions for 20+ levels (fog of [04-angry-emoji-design](issues/04-angry-emoji-design.md)).
- Destructible-tower physics feel — how blocks stack, break, and collapse under hand-rolled physics (fog of [05-destructible-towers-prototype](issues/05-destructible-towers-prototype.md)).

## Out of scope

- Hub-wide leaderboard / shared score persistence (best scores are per-game, localStorage only).
- Ghost piece on Medium/Hard and hold piece on Easy/Medium (fixed by the difficulty model decision).
- Keyboard-primary controls (hub is touch-first; keyboard is optional polish).
- Tilt steering for emoji-jump (decided: touch buttons).
- Shared physics engine or third-party physics dependency (decided: per-game hand-rolled).
- The three games' specs — this effort's destination; the 5 already-spec'd games (sequence-memory, emoji-math, spot-the-difference, category-sort, path-builder) are separate efforts.
