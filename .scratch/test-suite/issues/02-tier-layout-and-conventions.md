# 02 — Tier Layout and Conventions

Type: grilling
Status: open
Blocked by: 01

## Question

How do the four tiers physically live in the repo, and what conventions govern them?

- File layout: `tests/unit/`, `tests/integration/` (new), `tests/behavioral/`, `tests/e2e/` — confirm, and where do shared fixtures/helpers live?
- Vitest config: how is the integration tier configured (environment, setup files, aliases) given the research findings from [01-integration-tooling](01-integration-tooling.md)?
- Naming conventions for test files and `describe`/`test` blocks per tier.
- Worked examples: for one concrete game, what does a unit test, an integration test, a behavioral (scripted) test, and an e2e (journey) test each look like — and how do behavioral vs e2e differ in practice (deterministic script vs. free-form)?
- Package.json scripts: how do `test`, `test:integration`, `test:behavioral`, `test:e2e`, `test:all` split?
- What happens to the existing pure-logic `tests/behavioral/` files that copy game logic — rewrite as unit tests, retire, or migrate to scripted behavioral?

Resolves the fog: concrete tier layout, vitest config, naming, worked behavioral-vs-e2e examples.
