# Wayfinder Map: Full Test Suite

## Destination

A full four-tier test suite for the entire kids-games repo, delivered as:

- **Test strategy doc** — `docs/superpowers/specs/2026-08-15-test-strategy.md` defining the four tiers, conventions, and when to write which.
- **ADRs** in `docs/adr/` for tooling choices (component testing library, coverage thresholds, CI shape).
- **The suite itself**: game logic extracted from `+page.svelte` components into testable `$lib` modules for all 11 games; a new component-test (integration) tier; deepened unit tests; behavioral tier rewritten as scripted browser interactions; e2e deepened with playthroughs + hub-shell journeys; coverage thresholds enforced; GitHub Actions CI running the whole stack.

## Notes

- Domain: kids-games hub (SvelteKit 5, Svelte 5 runes, touch-first, Vitest 4 + Playwright, PWA via @vite-pwa/sveltekit).
- Skills to consult on tickets: `/grilling` and `/domain-modeling`; research facts via `/research` subagents.
- **Tier model (settled in charting)**: two runners — Vitest carries **unit** (single-function/edge-case) + **integration** (component tests via @testing-library/svelte, jsdom); Playwright carries **behavioral** (scripted deterministic interactions) + **e2e** (free-form user journeys, real browser).
- Current state: 13 unit files (several testing literals/copies, not shipped code), 11 behavioral files (pure-logic simulations, several copying game logic), 12 e2e files (mostly smoke), **no integration tier**, no CI (no `.github/`), no coverage tooling.
- Parallel effort: the [Tetris/Emoji Jump/Angry Emoji map](../tetris/map.md) builds three new games — this effort mandates (via the strategy doc) that those games ship with all four tiers as their definition of done; it does not write their tests itself.
- Update `CONTEXT.md` glossary with testing terms as they resolve (domain-modeling).

## Decisions so far

- [Destination: strategy + full suite](issues/00-charting-round.md) — strategy doc, ADRs, AND the suite built out across the whole repo.
- [Integration tier: component tests](issues/00-charting-round.md) — @testing-library/svelte in Vitest, jsdom; new dependency, the standard Svelte 5 answer.
- [Deepen units: extract + test real modules](issues/00-charting-round.md) — extract component-embedded game logic into `$lib` modules, test the real code, kill the copy pattern.
- [Quality gates: coverage + CI](issues/00-charting-round.md) — @vitest/coverage with thresholds; GitHub Actions workflow on every push/PR.
- [Scope: include hub shell](issues/00-charting-round.md) — i18n locales, settings store, sound toggle, age selector, PWA/service-worker, direct-route navigation.
- [Behavioral tier: browser behavioral](issues/00-charting-round.md) — scripted deterministic Playwright interactions; e2e = free-form user journeys. Pure-logic behavioral files get rewritten as real unit tests or retired.
- [Extraction scope: all 11 games](issues/00-charting-round.md) — ordered by value (memory, puzzle, soccer, pop, splash, stickers, paint, sorting, animal-quiz, tower-defense, glossary-puzzle); tower-defense + glossary-puzzle already test real modules.
- [New games: mandate via convention](issues/00-charting-round.md) — strategy doc mandates four tiers per game as DoD; this effort doesn't couple to the game-building effort.
- [E2E depth: playthroughs + shell](issues/00-charting-round.md) — keep smoke, add full-playthrough journeys plus hub-shell flows.
- [Strategy doc home: spec + ADRs](issues/00-charting-round.md) — `docs/superpowers/specs/2026-08-15-test-strategy.md` + `docs/adr/`.
- [Integration tooling](issues/01-integration-tooling.md) — add `@testing-library/svelte@^5.4.2` + `jsdom@^29` (+ optional jest-dom); `test.projects` config (unit=node, integration=jsdom); mock `$app/navigation` + `$app/stores`; localStorage native in jsdom; AudioContext/fullscreen/vibrate self-guard. Findings: `.scratch/test-suite/research/01-integration-tooling.md` (branch `research/integration-tooling`).

## Not yet specified

- Exact @testing-library/svelte + Svelte 5 runes setup facts (stubbing localStorage / AudioContext / matchMedia, render patterns) — fog of [01-integration-tooling](issues/01-integration-tooling.md).
- Concrete tier-layout, vitest config, naming, and worked behavioral-vs-e2e examples — fog of [02-tier-layout-and-conventions](issues/02-tier-layout-and-conventions.md).
- Coverage percentage targets and exclusions (PWA worker, generated puzzle paths, build output) — fog of [03-coverage-thresholds](issues/03-coverage-thresholds.md).
- CI workflow shape (jobs, caching, build+preview for browser tiers, retries, required status) — fog of [04-ci-workflow](issues/04-ci-workflow.md).
- Extraction pattern and ordering across the 11 games, parity verification, fate of copy tests — fog of [05-logic-extraction-strategy](issues/05-logic-extraction-strategy.md).
- Per-game extraction tasks (graduate from 05 once the pattern is settled).

## Out of scope

- Writing the Tetris / Emoji Jump / Angry Emoji tests directly (the strategy mandates them as DoD; their own effort builds the games).
- Performance/load testing.
- Visual regression testing (pixelmatch exists in devDeps but was not chosen in charting).
- Testing frameworks other than Vitest + Playwright (no Cypress, Jest, etc.).
