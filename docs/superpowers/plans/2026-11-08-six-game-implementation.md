# Six-Game Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the six winning redesigns in production on `feat/six-games`, with tests, then merge, push and redeploy.

**Architecture:** Each game keeps its route, hub entry, ladder and storage keys. The winner prototype's world and loop are promoted into the production route; the prototype switcher and `?variant=` hook are removed. All source imports use `#lib`, tests use relative imports. New sound uses the shared `createGameSound`; reduced motion uses the `reducedMotion` store/`prefersReducedMotion()`. New copy goes into all six locales and the parity test.

**Tech Stack:** SvelteKit 3.1.1, Svelte 5, Vite 8, Vitest 5, Playwright, `@sveltejs/adapter-static`, PWA 2, Cloudflare Workers static assets.

**Specs:** `docs/superpowers/specs/2026-11-07-*-prd.md` (six PRDs) and the matching `docs/issues/<game>-*.md` tickets.

## Global Constraints

- One game at a time, in order: Path Builder, Pop, Soccer, Focus Tap, Quick Count, Spot the Difference.
- Each game: core → juice/sound → devices/a11y → levels/content, using its four tickets as the acceptance gate.
- Do not merge prototype branches; read them as reference (`git show prototype/<game>:...`) and adapt to `#lib`.
- No `?variant=` or prototype switcher in production. No new runtime dependencies.
- Keep the shared GameShell, LadderBar, LadderActions, hub entry, sound toggle, progress keys and the existing storage keys unchanged.
- All source imports `#lib`; all test imports relative. New copy in en/it/ro/de/fr/zh with the parity test green.
- Every game must pass `pnpm test`, `pnpm check`, `pnpm build`, and its e2e flow before the next game starts.
- `public/` is tracked build output; rebuild only at the final integration step.

## Per-Game Contract

For each game:

1. Read its PRD and tickets; inspect the winner prototype files on `prototype/<game>`.
2. Replace the production route with the winner's world/loop; keep the ladder/hub/progress wiring.
3. Implement all ten levels (or the age-band set for Spot) and the ticket content rules.
4. Add the shared sound palette and reduced-motion handling.
5. Add locale keys for every new string; update the parity test if needed.
6. Update the existing unit/e2e tests and add the ticket's new hooks; keep all existing game tests green.
7. `pnpm test`, `pnpm check`, `pnpm build`; commit.
8. Fresh reviewer on the game diff; fix findings before the next game.

## Task Order

- [ ] **1. Path Builder** — `docs/superpowers/specs/2026-11-07-path-builder-road-prd.md`, tickets 03–06, ADR 0005, `prototype/path-builder` winner A.
- [ ] **2. Pop** — `2026-11-07-pop-gentle-arcade-prd.md`, tickets 01–04, `prototype/pop` winner A.
- [ ] **3. Soccer** — `2026-11-07-soccer-night-penalty-prd.md`, tickets 01–04, `prototype/soccer` winner A, ADR 0001 addendum.
- [ ] **4. Focus Tap** — `2026-11-07-focus-tap-pond-catch-prd.md`, tickets 03–06, `prototype/focus-tap` winner A.
- [ ] **5. Quick Count** — `2026-11-07-quick-count-flash-picnic-prd.md`, tickets 03–06, `prototype/quick-count` winner A.
- [ ] **6. Spot the Difference** — `2026-11-07-spot-the-difference-twin-postcards-prd.md`, tickets 02–05, `prototype/spot-the-difference` winner A.

## Final Integration

- [ ] Full `pnpm test`, `pnpm check`, `pnpm build`, e2e on a fresh port.
- [ ] Visual pass at 390×844 and 320×568 for all six worlds.
- [ ] Rebuild and commit `public/`.
- [ ] Merge `feat/six-games` to `main`, push, redeploy the Cloudflare Worker.
