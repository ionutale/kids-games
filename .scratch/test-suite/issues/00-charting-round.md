# 00 — Charting Round

Type: grilling
Status: resolved
Blocked by:

## Question

What does "full suite of tests: unit, integration, e2e, behaviour — for the entire repo" deliver, and what do the tiers mean?

## Answer

Settled in the charting grilling session (Round 1: destination, integration tier, deepening units, quality gates, cross-cutting scope; Round 2: behavioral tier, extraction scope, new-games interplay, e2e depth, strategy doc home):

- **Destination**: test strategy doc + ADRs + the suite built out across the whole repo — extraction to `$lib`, new integration tier, coverage thresholds, CI.
- **Integration tier**: component tests with @testing-library/svelte in Vitest (jsdom).
- **Deepen units**: extract game logic from `+page.svelte` into `$lib` modules; test real modules; kill the copy/literal pattern.
- **Quality gates**: @vitest/coverage thresholds + GitHub Actions CI on every push/PR.
- **Cross-cutting scope**: hub shell included (i18n, settings, sound toggle, age selector, PWA, navigation).
- **Behavioral tier**: browser behavioral — scripted deterministic Playwright interactions; e2e = free-form user journeys. Pure-logic `tests/behavioral/` files rewritten as real unit tests or retired.
- **Extraction scope**: all 11 games, ordered by value.
- **New games**: mandated via convention (four tiers per game = DoD), not written by this effort.
- **E2E depth**: playthroughs + hub-shell journeys on top of existing smoke tests.
- **Strategy doc home**: `docs/superpowers/specs/2026-08-15-test-strategy.md` + ADRs in `docs/adr/`.
