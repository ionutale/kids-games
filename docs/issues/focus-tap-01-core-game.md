# 02 — Focus Tap: Core Game Loop

**Spec:** [2026-08-23-focus-tap-design.md](../superpowers/specs/2026-08-23-focus-tap-design.md)

## What to build

The complete Focus Tap trainer end-to-end: a Stream of emojis floats up the screen; the child catches only the round's Target and inhibits taps on Distractors.

- Three routes: landing (`/games/focus-tap`, LevelBar + Play), `/play` redirect to saved level, `/play/[n]` round (clamps n ≥ 1, saves n, accepts `?seed=`).
- Round: header shows target big ("Catch 🍎!") + progress pill; `levelConfig(n)` drives goal (`6 + n` cap 20), spawn interval (`max(600, 1800 − 100·n)` ms), rise time (`max(4, 9 − 0.25·n)` s), max 6 concurrent items; 35% target spawns with forced target when none on screen.
- Sneaky Tiers: L1–2 cross-category distractors, L3–5 same-category, L6+ lookalikes.
- Catch → pop animation + pop sound + counter. Distractor tap → silent wobble only.
- Goal reached → WinOverlay celebration with Next Level ▶ / Replay / Back links.
- Hub card in `src/routes/+page.svelte`; i18n keys in en/it/ro/de/fr/zh.
- Spawning pauses on tab blur; intervals cleaned up on destroy; single-touch lock.

## Acceptance criteria

- [x] Landing shows current saved level on LevelBar; Play opens `/play/{level}`
- [x] `/play` without level redirects to the saved level
- [x] Playing round *n* persists *n* as current level (visible after reload)
- [x] Stream density and rise speed follow `levelConfig` at L1, L5, L15 (unit-tested boundaries incl. caps)
- [x] Tapping a distractor wobbles it silently and never changes the counter
- [x] Tapping targets to goal triggers WinOverlay; Next Level ▶ navigates to n+1 and starts a fresh round
- [x] Distractor tier matches level band (unit-tested with seeded rng)
- [x] Tab blur stops spawning; no leaked intervals after navigation
- [x] Vitest unit tests for formulas/tiers + one seeded Playwright happy-path e2e

## Blocked by

- [trainers-01-kit](trainers-01-kit.md)
