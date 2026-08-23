# 03 — Quick Count: Core Game Loop

**Spec:** [2026-08-23-quick-count-design.md](../superpowers/specs/2026-08-23-quick-count-design.md)

## What to build

The complete Quick Count trainer end-to-end: a scattered Glimpse Set flashes briefly, then the child answers "how many?" from three Answer Pills.

- Three routes (landing + `/play` redirect + `/play/[n]` with `?seed=`) per the Trainer Routes contract.
- `levelConfig(n)`: round goal `5 + min(n, 10)`; flash duration `max(800, 3000 − 150·n)` ms; count range `1 … min(4 + n, 20)`; single category per round rotating each round.
- Flash panel: emojis on a jittered grid — no overlaps, no clipping; positions from seeded rng.
- Answer Pills: correct ± 1/2 distractors, unique, clamped to `[0, min(4+n, 20)+2]`, shuffled.
- Correct → pop sound + advance; wrong pill → silent wobble, prompt stays until correct.
- Get Ready beat (~600 ms) before each flash; tab blur during flash restarts that prompt's flash on focus return.
- Goal reached → WinOverlay celebration with Next Level ▶ / Replay / Back; hub card; i18n keys in six languages.

## Acceptance criteria

- [ ] Landing/redirect/persistence behave per the shared route contract
- [ ] Flash duration and count range follow formulas at L1/L5/L15 with caps verified by unit tests
- [ ] Glimpse Sets never overlap and stay inside the panel across many seeds (property-style unit test)
- [ ] Exactly 3 unique pills; correct answer always present; clamping rule holds at extremes
- [ ] Wrong pill wobbles silently and does not advance or penalize
- [ ] Tab blur mid-flash restarts that flash; the prompt is never counted as answered
- [ ] Reaching goal triggers WinOverlay; Next Level ▶ starts round n+1 fresh
- [ ] Vitest unit tests + one seeded Playwright happy-path e2e

## Blocked by

- [trainers-01-kit](trainers-01-kit.md)
