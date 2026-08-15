# 03 — Coverage Thresholds

Type: grilling
Status: open
Blocked by:

## Question

What are the coverage gates this repo enforces?

- Thresholds per tier or overall: what % for lines / branches / functions / statements — and do unit and integration share one gate (Vitest) or separate?
- What's excluded from coverage: PWA service worker (`public/sw.js`, generated), `scripts/` (puzzle path generation, screenshots), pre-generated data, build output?
- Reporting: @vitest/coverage-v8 config, HTML report, where the gate fails the run.
- Do behavioral/e2e (Playwright) count toward coverage at all — or is coverage a Vitest-tier concern only?
- Realistic targets: what does the CURRENT suite hit (rough estimate from a quick run) vs. the target, so the strategy doc sets achievable numbers?

Resolves the fog: coverage percentage targets and exclusions.
