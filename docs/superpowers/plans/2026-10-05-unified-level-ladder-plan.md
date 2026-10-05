# Unified Level Ladder — Implementation Plan

Approved design: one shared ladder pattern for all level-based games.
**Contract:** 10 levels → saved per game → win = Replay / Next Level ▶ / Back →
level 10 done = 🎓 Mastery. Landings show a LadderBar (progress + free pick, no locks).

## Phases

- [x] **P1 — Module** `src/lib/ladder/`
  - `progress.js`: `MAX_LEVEL=10`, `loadLevel`/`saveLevel` (camelCase keys, clamp 1–10),
    `loadMastered`/`saveMastered`, legacy-key migration (`memory-unlocked-level`, `path-builder-level`)
  - `LadderBar.svelte`: replaces LevelBar + LevelDots; `hrefFor` links or `onchange` buttons;
    done steps < current; 🎓 on step 10 when mastered; **no lock machinery**
  - `LadderActions.svelte`: shared win actions (Next ▶ hidden at 10 → 🎓, Replay, Back);
    default navigation `/games/{id}/play/{n}`; optional `onnext`/`onreplay` callbacks;
    saves mastery when rendered at level 10
  - Unit tests
- [x] **P2 — Trainers + grammar** (unit green; e2e pending browser install)
  - Clamp all `play/[n]` loaders at 10 (grammar already does)
  - Win overlays → `LadderActions`; landing `TrainerLanding` → `LadderBar` always on
    (remove dead `showLevels`/`maxUnlocked`)
  - Quick win: remove focus-tap duplicate `saveLevel`
- [x] **P3 — Adopt/convert**: memory (kill LevelDots, landing + LadderBar), path-builder,
  glossary-puzzle (clamp 10, honest bar, keep resume save), soccer/pop/puzzle/sorting
  (persist level, Next Level ▶, consistent bar placement)
  - Quick win: soccer dead `goalSize` — wire it or delete it
- [x] **P4 — category-sort** gets the ladder (round = level: items 6→10, bins 2→4);
  align bespoke overlays (sequence-memory, spot-the-difference, emoji-math) onto WinOverlay
- [x] **P5 — Home page**: group headers (Creative/Puzzles/Arcade/Quizzes/Brain),
  per-tile progress (`Lv n/10`, 🎓 mastered), fix duplicate `puzzle` label

## Rules

- Each phase ships green: `pnpm test` (vitest) must pass after every phase.
- E2E (`pnpm test:e2e`) run at least after P2 and P5.
- Trainers' formulas already plateau via Math.min/max — only route clamping is needed.

## Deviations (deliberate)

- memory keeps its single-page layout: the LadderBar docks at the bottom of the game instead of adding a landing tap before play (toddler-first).
- emoji-math's milestone stays a transient, non-blocking confetti burst — a tap-gated WinOverlay would interrupt the endless drill every 10 correct answers.
- E2E browsers are not installed in this environment; e2e selectors were updated for the new contract but not yet executed. Run: `pnpm exec playwright install chromium` then `pnpm exec playwright test`.

## Verification so far

- `pnpm test` (vitest unit + behavioral): 38 files / 288 tests passing.
- `pnpm check` (svelte-check): 0 errors, only pre-existing warnings.
