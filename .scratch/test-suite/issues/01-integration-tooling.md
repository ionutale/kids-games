# 01 — Integration Tooling

Type: research
Status: resolved
Blocked by:

## Question

What exactly does a @testing-library/svelte component-test (integration) tier look like in THIS repo (SvelteKit 5, Svelte 5 runes, Vitest 4, Vite 8)?

- @testing-library/svelte: current version, Svelte 5 runes compatibility, render() patterns for components using `$state` / `$derived` / `$props`.
- Vitest jsdom environment: config for the integration tier (separate project in vite.config.js? per-file `// @vitest-environment jsdom`?).
- What must be stubbed/faked in jsdom for this repo's components: localStorage (settings store), AudioContext/WebAudio (audioManager), `matchMedia`, `requestFullscreen` (hub auto-fullscreen), `navigator` APIs.
- How the SvelteKit-specific bits behave in plain Vitest (no `$app/` — stores, navigation): what breaks when components import `$app/*`, and the standard mitigation.
- Existing patterns: does the repo's Vitest setup already load `$lib` aliases, and would tests/integration/ need setup files?

Write findings to a markdown file under `.scratch/test-suite/research/` citing primary sources (official docs, changelogs).

Resolves the fog: exact @testing-library/svelte + Svelte 5 runes setup facts.

## Answer

Findings (primary sources + empirical probes in this repo): `.scratch/test-suite/research/01-integration-tooling.md` (205 lines, on branch `research/integration-tooling`).

Bottom line:
- **Add**: `@testing-library/svelte@^5.4.2`, `jsdom@^29` (v30 needs Node ≥ 22.22; repo has Node 26 — pin `^29` if CI runs Node 20), optional `@testing-library/jest-dom@^7.0.1`.
- **Config**: `test.projects` in vite.config.js — `unit` project (node env, `tests/unit/**` + `tests/behavioral/**`) and `integration` project (jsdom, `tests/integration/**`, setup file). Per-file `// @vitest-environment jsdom` can't scope setupFiles, so projects win. `svelteTesting()` plugin adds auto-cleanup + `browser` condition.
- **Stubs**: always mock `$app/navigation` (goto) and `$app/stores` (page URL — layout throws otherwise); localStorage is native in jsdom (just reset); AudioContext/fullscreen/vibrate/matchMedia all self-guard in repo code — no stubs needed.
- **Risks**: `test.projects` replaces path-filtered scripts (revisit `"test": "vitest run tests/unit tests/behavioral"`); jsdom browser-condition means `goto()` runs broken browser code unless mocked — always mock `$app/navigation`.
