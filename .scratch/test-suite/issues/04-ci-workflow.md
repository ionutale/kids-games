# 04 — CI Workflow

Type: grilling
Status: open
Blocked by:

## Question

What does the GitHub Actions CI look like for this repo?

- Workflow shape: one workflow with jobs for lint/check, unit+integration (Vitest), behavioral (Playwright), e2e (Playwright) — or fewer/more?
- Caching: pnpm store, `node_modules`, Playwright browser cache — what's cached to keep runs fast?
- Browser tiers: e2e already builds + previews (port 4173, `pnpm build && pnpm preview`) — keep that, and how do behavioral tests share the server?
- Retries/flakiness: Playwright retries (currently `retries: process.env.CI ? 2 : 0`), Vitest retry policy, timeout budgets.
- Required status: which jobs gate merges, and do coverage thresholds run as a separate check?
- When does it run: push + PR? Also nightly? Does the hub's Vercel deploy (vercel.json exists) interact with CI?

Resolves the fog: CI workflow shape, jobs, caching, server strategy, retries.
