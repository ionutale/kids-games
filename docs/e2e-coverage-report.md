# E2E Coverage Report

Per-game e2e coverage matrix (2026-08-24 audit). Legend: ✅ covered · ⚠️ partial · ❌ missing.
"Touch input" = at least one spec drives the game via touch-originated pointer events
(shared helper `tests/e2e/helpers/touch.js` or CDP touchscreen), not mouse-only.

## Matrix

| Game | Core loop | Persist/reload | Pause/blur | Locale | Touch input | Spec size |
|---|---|---|---|---|---|---|
| angry-emoji | ✅ | ✅ stars | ✅ pause | ✅ IT (regressions) | ✅ | 6 |
| animal-quiz | ✅ | ❌ | ❌ | ❌ | ⚠️ taps via click() | 4 |
| category-sort | ✅ | ❌ (by design) | ❌ | ✅ labels | ✅ | 6 |
| emoji-jump | ✅ | ✅ best | ✅ pause | ❌ | ✅ touch drag | 4 |
| emoji-math | ✅ | ✅ streak | ❌ | ✅ age-typed | ⚠️ | 4 |
| focus-tap | ✅ | ✅ level | ✅ blur | ✅ IT (regressions) | ✅ touch | 4 |
| glossary-puzzle | ✅ | ✅ progress | ❌ | ❌ | ⚠️ mouse-drag e2e | 9 |
| memory | ✅ | ✅ level | ❌ | ❌ | ⚠️ | 5 |
| paint | ✅ | ❌ | ❌ | ❌ | ✅ touch stroke | 7 |
| path-builder | ✅ | ✅ level | ❌ | ❌ | ✅ | 3 |
| pop | ✅ | ❌ | ❌ | ❌ | ⚠️ | 7 |
| puzzle | ✅ | ✅ progress | ❌ | ❌ | ⚠️ mouse | 7 |
| quick-count | ✅ | ✅ level | ✅ blur | ❌ | ⚠️ | 4 |
| sequence-memory | ✅ | ❌ best | ✅ pause | ❌ | ⚠️ | 3 |
| soccer | ✅ | ❌ | ❌ | ❌ | ✅ touch kick | 9 |
| sorting | ⚠️ 2 specs | ❌ | ❌ | ❌ | ⚠️ | 2 |
| speed-match | ✅ | ✅ level | ✅ blur | ❌ | ✅ touch | 4 |
| splash | ✅ | ❌ | ❌ | ❌ | ✅ touch tap/drag | 7 |
| spot-the-difference | ✅ | ❌ | ❌ | ❌ | ⚠️ | 4 |
| stickers | ✅ | ❌ | ❌ | ❌ | ✅ touch drag | 6 |
| tetris | ✅ | ✅ best/diff | ✅ pause | ❌ | ⚠️ | 4 |
| tower-defense | ✅ | ❌ | ❌ | ❌ | ✅ touch place | 8 |
| what-comes-next | ✅ | ✅ level | ❌ | ❌ | ⚠️ | 4 |

**Cross-cutting**: navigation sweep (G1) · locale switching (G3) · sound-toggle persistence (G4) · landscape smokes (G5) — see below.

## Inventories

- **24/24 games** have an e2e file (+ `navigation`, `regressions`)
- ~160 e2e tests total; unit 28 files + behavioral 13 files
- Input style: legacy games migrated to Pointer Events (Phase A) and their specs now cover touch; remaining ⚠️ = tap games exercised via `click()` (mouse protocol) — acceptable for tap-only UIs, flagged for review when touch specs are mandated repo-wide
- Persistence gaps: animal-quiz, paint, pop, sequence-memory, soccer, sorting, splash, stickers, tower-defense (most are mastery/scoreless by design — see game specs; sequence-memory best-score IS a gap worth closing, done in G2)

## Gap-fill backlog (executed with this report)

| ID | Task | Status |
|---|---|---|
| G1 | navigation sweep: hub → every game → back | ✅ |
| G2 | sequence-memory +1 (best persists, seeded) — sorting already covered by its own play-1..10 spec (incl. replay) | ✅ |
| G3 | locale-switch spec (EN ↔ IT labels on hub) | ✅ |
| G4 | sound-toggle persistence spec | ✅ |
| G5 | landscape overflow smokes: tetris, emoji-jump | ✅ |

## How to use this file

When adding a game: add its row. When a spec is extended, update the cell. The
goal is at least ✅ in the Core loop column + ⚠️-or-better input for every game;
persistence only where the spec defines persisted state.