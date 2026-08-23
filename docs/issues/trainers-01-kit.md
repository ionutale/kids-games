# 01 — Brain Trainers: Shared Kit (progress + emoji catalog)

**Spec:** [Brain Trainers collection-wide decisions](../superpowers/specs/2026-08-23-focus-tap-design.md)

## What to build

The shared foundation all four brain trainers import:

1. **`src/lib/trainers/progress.js`** — `loadLevel(gameId)` / `saveLevel(gameId, n)`; localStorage key `${camelCase(gameId)}Level`, default level 1, clamps n ≥ 1.
2. **`src/lib/trainers/emojiSets.js`** — categorized emoji sets (animals, food, vehicles, nature, sea, toys), an explicit `LOOKALIKES` table of visually confusable pairs, plus tier-aware pickers: `pickTarget(pool, rng)` and `pickDistractors(target, tier, count, rng)` where tier means cross-category / same-category / lookalikes.
3. A seeded PRNG factory (`makeRng(seed)`) co-located here so every generator in the collection is deterministic under test.

No UI, no routes — this slice is verifiable purely through unit tests, which is what makes it independently grabbable.

## Acceptance criteria

- [ ] `loadLevel` returns saved value, defaults to 1 when absent, clamps garbage/negative input
- [ ] `saveLevel` persists and round-trips; SSR-safe (no localStorage access on server)
- [ ] Catalog exposes all six categories with ≥ 8 emojis each; no duplicates across lookalike table and category pools that would break tier logic
- [ ] `pickDistractors` never includes the target; respects tier exclusivity (cross-category excludes target's category; lookalike tier draws only from the target's lookalike partner set)
- [ ] Same seed ⇒ same picks for every generator; different seeds diverge
- [ ] Vitest unit tests cover all of the above

## Blocked by

None — can start immediately
