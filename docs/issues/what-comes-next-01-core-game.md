# 05 — What Comes Next: Core Game Loop

**Spec:** [2026-08-23-what-comes-next-design.md](../superpowers/specs/2026-08-23-what-comes-next-design.md)

## What to build

The complete What Comes Next trainer end-to-end: complete a Prompt Strip whose emojis follow a repeating Pattern Unit, choosing the ❓ slot's answer from 3 options.

- Three routes (landing + `/play` redirect + `/play/[n]` with `?seed=`) per the shared contract.
- Pattern Arc generator (`patternTier(n)` + unit builder): L1–2 AB; L3–4 AAB/ABB/AABB; L5–6 ABC/AABC/ABCC; L7+ growing blocks `[A×k][B]` (k = 1, 2, 3 …) where the answer is always the first element of the next block.
- Prompt rules: strip shows ≥ 2 full unit repetitions before the slot (≥ 3 complete blocks in growing tier); one emoji per symbol within a prompt; slot answer deterministic from the unit.
- Discrimination axis: distractors from different categories at L1–5; same-category / lookalikes at L6+.
- Round goal: solve `4 + min(n, 6)` prompts; correct → pop sound + ❓ fills with chosen emoji (~500 ms beat); wrong → silent wobble, prompt stays until correct.
- WinOverlay celebration with Next Level ▶ / Replay / Back; hub card; i18n keys in six languages.

## Acceptance criteria

- [x] Landing/redirect/persistence behave per the shared route contract
- [x] `patternTier` maps levels to bands correctly at boundaries (L1/L3/L5/L7/L30) — unit-tested
- [x] Every generated prompt is internally consistent: visible prefix matches its unit and the marked correct option continues it (property test over levels 1–30, seeded)
- [x] Growing-tier strips expand blocks correctly and always ask for a deterministic next element
- [x] Exactly 3 shuffled options; distractor category rules respected per level band
- [x] Wrong tap wobbles silently; no advance, no penalty
- [x] Reaching goal triggers WinOverlay; Next Level ▶ starts round n+1 fresh
- [x] Vitest unit tests + one seeded Playwright happy-path e2e

## Blocked by

- [trainers-01-kit](trainers-01-kit.md)
