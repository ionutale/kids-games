# Italian Grammar Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Italian Grammar game (`/games/grammar`) with 10 progressive levels, two exercise types, tests and docs.

**Architecture:** Data module (`src/lib/grammar/italian.js`) + engine component (`GrammarGame.svelte`) + thin routes following the trainer pattern (reactive level, Next Level ▶, saved progress). Content Italian, UI localized.

**Tech Stack:** SvelteKit (Svelte 5 runes), Vitest, Playwright, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-20-italian-grammar-design.md`

## Global Constraints

- `pnpm` only; `pnpm test`, `pnpm check`, `pnpm exec playwright test`.
- Exercise shape `{ type, prompt, options, answer, emoji? }`; 3 unique options; valid answer.
- Silent wrong (shake only), `playMatch` + green pop on correct, WinOverlay at round end.
- No Level Bar; Next Level ▶ / Replay / Back; progress key `grammar`.
- Commit after each task; push at the end.

---

### Task 1: Data module + unit tests

**Files:** Create `src/lib/grammar/italian.js`, `tests/unit/grammar.test.js`.

- [ ] Write `tests/unit/grammar.test.js` (levels present, ≥6 exercises each, shape checks,
      `roundGoal` growth/cap, `exercisesFor` clamp) — run to see it fail (module missing).
- [ ] Author all ten levels (L1 volere, L2 -are, L3 -ere/-ire, L4 determinativi,
      L5 indeterminativi+plurale, L6 preposizioni, L7 imperativi, L8 picture, L9 picture
      simili, L10 misto) with varied answer indices.
- [ ] `pnpm test tests/unit/grammar.test.js` → pass; then `pnpm test` → all pass.
- [ ] Commit: `feat(grammar): Italian grammar data — 10 progressive levels + integrity tests`.

### Task 2: Engine + TrainerLanding music prop

**Files:** Create `src/lib/components/GrammarGame.svelte`; modify `TrainerLanding.svelte`.

- [ ] `TrainerLanding` gains `music = true`; grammar passes `false` (no theme asset).
- [ ] `GrammarGame.svelte`: props `{ level, seed }`; reactive round reset on level/seed change
      (`$effect` + `untrack`); renders prompt card (text with `___` or emoji + localized
      "Which sentence fits?"), 3 option buttons with `data-testid`
      (`correct-opt` / `wrong-opt-N`), progress `data-testid="grammar-progress"`,
      WinOverlay with Next Level ▶ (fanfare) / Replay (`?seed=`) / Back.
- [ ] `pnpm check` → 0 errors; commit:
      `feat(grammar): GrammarGame engine + TrainerLanding music opt-out`.

### Task 3: Routes, hub tile, i18n

**Files:** Create `src/routes/games/grammar/+page.svelte`, `play/+page.js`, `play/[n]/+page.js`,
`play/[n]/+page.svelte`; modify `src/routes/+page.svelte`, `src/lib/stores/locale.js`.

- [ ] Landing: TrainerLanding `showLevels={false}` `music={false}`, hero `🇮🇹 ✏️ 📖`, accent.
- [ ] `play/+page.js` redirect to saved level; `play/[n]/+page.js` saves level + seed.
- [ ] `play/[n]/+page.svelte`: `<GrammarGame level={data.level} seed={data.seed} />`.
- [ ] Hub tile `{ id: 'grammar', icon: '🇮🇹', key: 'grammar', accent: '#86EFAC' }`.
- [ ] Locale keys `grammar`, `grammarTagline`, `whichSentence` ×6 locales.
- [ ] `pnpm check`; commit: `feat(grammar): routes, hub tile and six-locale UI keys`.

### Task 4: E2E

**Files:** Create `tests/e2e/grammar.test.js`.

- [ ] Tests: landing without Level Bar; L1 card + 3 options; wrong shakes + no advance;
      correct advances; win → overlay; Next Level → fresh L2 (overlay hidden, 1/6);
      Replay restarts L2.
- [ ] Run file → 6 pass; commit: `test(grammar): e2e — feedback, win, Next Level, Replay`.

### Task 5: Docs + full verification + push

- [ ] CONTEXT.md: "Italian Grammar Game" glossary section (Exercise, Prompt, Option, Level).
- [ ] `pnpm test`, `pnpm check`, full `pnpm exec playwright test` (pre-existing flaky
      spot-the-difference may retry).
- [ ] Commit + `git push origin main`.
