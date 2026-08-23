# Quick Count — Design (Brain Trainer 2 of 4)

**Date:** 2026-08-23
**Status:** Approved scope (grill-with-docs session)
**Collection:** Brain Trainers — see shared decisions in `2026-08-23-focus-tap-design.md` ("Collection-wide decisions"); they apply verbatim to this game.

## Concept

Elevate-inspired estimation/subitizing trainer. A scattered group of emojis **flashes** briefly on a panel, then the child answers "how many?" by tapping one of three **Answer Pills**. Trains rapid quantity perception — the foundation of counting and number sense.

Cognitive skill trained: subitizing, estimation, number recognition.

## Routes

| Route | File | Behavior |
|---|---|---|
| `/games/quick-count` | `src/routes/games/quick-count/+page.svelte` | Landing: LevelBar + Play |
| `/games/quick-count/play` | `src/routes/games/quick-count/play/+page.js` | Redirect to saved level |
| `/games/quick-count/play/[n]` | `src/routes/games/quick-count/play/[n]/+page.svelte` | The round; saves *n*; accepts `?seed=` |

## Core Loop

1. Prompt card appears: "How many?" with a **Get Ready** beat (~600 ms).
2. A set of emojis flashes inside a centered rounded panel for the level's flash duration, then vanishes.
3. Three Answer Pills appear below (shuffled): the correct count + 2 near-miss distractors.
4. Correct pill → satisfying pop sound, counter increments, next prompt after ~400 ms.
5. Wrong pill → silent wobble; prompt stays until correct choice is made (no fail state).
6. After `goal` correct answers → Celebration Sequence (WinOverlay + cheer) with **Next Level ▶ / Replay / Back**.

## Level Ladder (unbounded)

`levelConfig(n)` — pure function, unit-tested. Two difficulty axes scale simultaneously:

| Parameter | Formula |
|---|---|
| Round goal (correct answers) | `5 + min(n, 10)` |
| Flash duration | `max(800, 3000 − 150·n)` ms |
| Count range | `1 … min(4 + n, 20)` |
| Emoji pool | Single category per round (rotates each round), drawn from shared catalog |

### Distractor generation (per prompt)

- Distractor values: correct ±1 or ±2 (mirrors Emoji Math's *Distractor* concept), unique, clamped to `[0, min(4 + n, 20) + 2]` so no pill ever shows a count above the level's reachable maximum + 2.
- Pills rendered big and tappable (`--touch-min` respected).

### Flash layout

Emojis are placed on a jittered grid inside the flash panel — no overlaps, no clipping; positions from seeded rng.

## Interaction Rules (positive-only)

- Wrong answer: wobble only — no sound, no subtract, round cannot be lost.
- One prompt visible at a time; no timer pressure during answering (the flash itself is the only time element).
- Audio: `playPop` (correct), `playWinCheer` (round end). Nothing punitive.
- Tab blur during flash → restart that prompt's flash when focus returns (never counts as answered).

## i18n Keys

`quickCount.title`, `quickCount.howMany`, `quickCount.getReady`, `quickCount.play`, `quickCount.nextLevel`, `quickCount.replay`, `quickCount.back`, `quickCount.progress` — en/it/ro/de/fr/zh.

## Glossary Terms (added to CONTEXT.md)

**Flash**, **Answer Pill**, **Glimpse Set** (the flashed emoji group).

## Testing

- **Vitest unit**: `levelConfig` caps (flash floor 800 ms, count cap 20); distractor uniqueness/clamping; jittered layout has no overlapping cells; deterministic prompts with seeded rng.
- **Playwright e2e** (seeded): landing → play → one full prompt cycle (flash elapses → pills render → tap correct pill via data attribute) → progress advances → win overlay at goal → Next Level link.

## Out of Scope (v1)

Typed numeric input, comparison-only mode, adaptive pacing, history stats.
