# Focus Tap — Design (Brain Trainer 1 of 4)

**Date:** 2026-08-23
**Status:** Approved scope (grill-with-docs session, see collection notes below)
**Collection:** Brain Trainers — sequential batch with Quick Count, Speed Match, What Comes Next

## Concept

Elevate-inspired selective-attention trainer for kids. A **Stream** of emojis floats up the screen; the child catches only the round's **Target** emoji and learns to inhibit taps on **Distractors**. It is Pop's "brainy sibling" — same satisfying popping, but governed by a rule.

Cognitive skill trained: selective attention + impulse control.

## Collection-wide decisions (apply to all 4 trainers)

These were settled once for the whole batch and are restated here because every spec depends on them:

| Decision | Value |
|---|---|
| Hub integration | Flat cards alongside existing games in `src/routes/+page.svelte` |
| Routes | `/games/{id}` landing (LevelBar + Play) · `/games/{id}/play` → redirect to saved level · `/games/{id}/play/[n]` plays round *n* and saves *n* |
| Persistence | Current level only, via shared helper `src/lib/trainers/progress.js` |
| Scoring | None — progress = goal counters; positive-only audio; celebration only at round end |
| Difficulty | Unbounded levels, identical LevelBar component, per-game formulas |
| Emoji content | Shared catalog `src/lib/trainers/emojiSets.js` (categories: animals, food, vehicles, nature, sea, toys) |
| AgeSelector | Ignored in v1 (the unbounded ladder adapts); future enhancement |
| Testing | Vitest unit tests for pure logic + one Playwright happy-path e2e per game |

### Shared module contracts

```js
// src/lib/trainers/progress.js
export function loadLevel(gameId)  // → number ≥ 1, default 1; localStorage key `${camelCase(gameId)}Level`
export function saveLevel(gameId, n)
```

```js
// src/lib/trainers/emojiSets.js
export const CATEGORIES = {
  animals: ['🐶','🐱','🐰','🐻','🦊','🐸','🐵','🐼','🦁','🐮'],
  food:    ['🍎','🍌','🍒','🍇','🍓','🍊','🍉','🍍','🥕','🌽'],
  vehicles:['🚗','🚌','🚒','🚀','✈️','🚂','🚲','🚜','🛵','🚁'],
  nature:  ['🌸','🌻','🌳','🌈','⭐','🌙','☀️','🍀','🌼','🍁'],
  sea:     ['🐠','🐙','🐬','🐳','🦀','🐡','🦑','🐢'],
  toys:    ['🧸','🎈','🎁','⚽','🏀','🎲','🪀','🪁'],
};
// Explicit lookalike pairs (visually confusable — reserved for high Sneaky Tiers):
export const LOOKALIKES = [
  ['🍎','🍏'], ['🐶','🐺'], ['⭐','🌟'], ['🍋','🍐'],
  ['🚗','🚙'], ['🦋','🐝'], ['🌸','🌺'], ['🐭','🐹'],
];
export function pickTarget(pool, rng)                      // uniform pick
export function pickDistractors(target, tier, count, rng)  // tier-aware, excludes target
```

All generators accept an injectable `rng` (seeded PRNG) so vitest assertions are deterministic and Playwright can pin randomness via `?seed=` passed through to the play page.

## Routes

| Route | File | Behavior |
|---|---|---|
| `/games/focus-tap` | `src/routes/games/focus-tap/+page.svelte` | Landing: LevelBar (current level preloaded) + big Play button → `/games/focus-tap/play/{level}` |
| `/games/focus-tap/play` | `src/routes/games/focus-tap/play/+page.js` | `redirect(307, '/games/focus-tap/play/' + loadLevel('focus-tap'))` |
| `/games/focus-tap/play/[n]` | `src/routes/games/focus-tap/play/[n]/+page.svelte` | The round. Clamps *n* to ≥ 1, saves *n* via `saveLevel`, accepts `?seed=` for deterministic tests |

GameShell wraps all three views (back link + SoundToggle).

## Core Loop

1. Round header: target shown big ("Catch 🍎!") + HudPill progress `caught/goal`.
2. Emojis spawn below the viewport and float upward; recycled when they exit the top.
3. Tap a Target → pop animation + satisfying pop sound, counter increments.
4. Tap a Distractor → gentle wobble (CSS, ~300 ms), silent, no penalty, no counter change.
5. Reach goal → Celebration Sequence (WinOverlay + `playWinCheer`) with links:
   **Next Level ▶** (`play/{n+1}`) · **Replay** (`play/{n}`) · **Back** (landing).

Round length is goal-driven (no timer). Implicit target: 30–90 s.

## Level Ladder (unbounded)

`levelConfig(n)` — pure function, unit-tested:

| Parameter | Formula |
|---|---|
| Goal (catches) | `6 + n`, capped at 20 |
| Spawn interval | `max(600, 1800 − 100·n)` ms |
| Float rise time (bottom→top) | `max(4, 9 − 0.25·n)` seconds |
| Max concurrent stream items | 6 (constant; density is controlled by spawn interval) |
| Target frequency | 35% of spawns; forced target if none currently on screen |
| Distractor Sneaky Tier | L1–2 cross-category · L3–5 same-category · L6+ lookalikes |

Per round: 2–4 distinct distractor types drawn from the active tier pool.

## Interaction Rules (positive-only)

- Distractor taps never make sound, never subtract, never end the round.
- Single-touch lock: one pointer active at a time (matches repo drag conventions).
- Spawning pauses on tab blur (`visibilitychange`); intervals cleaned up on destroy.
- Audio: `playPop` (catch), `playWinCheer` (round end). Nothing punitive.

## i18n Keys

`focusTap.title`, `focusTap.catch` ("Catch {emoji}!"), `focusTap.play`, `focusTap.nextLevel`, `focusTap.replay`, `focusTap.back`, `focusTap.progress` — provided in en, it, ro, de, fr, zh following `animalQuizData.js` naming precedent.

## Glossary Terms (added to CONTEXT.md)

**Trainer**, **Target**, **Distractor**, **Catch**, **Stream**, **Sneaky Tier**.

## Testing

- **Vitest unit** (`tests/unit/trainers/focusTap.spec.js`): `levelConfig` boundaries (L1, large-n caps), distractor tier selection (cross-category exclusivity at L1–2; lookalike membership possible only L6+), forced-target rule with stubbed rng.
- **Playwright e2e** (`tests/e2e/focus-tap.spec.js`, seeded): landing renders current level → play → tap a distractor (counter unchanged) → tap targets to goal → WinOverlay visible → Next Level navigates to `n+1`.

## Out of Scope (v1)

AgeSelector adaptation, streak/history persistence, sound themes, landscape-specific layouts.
