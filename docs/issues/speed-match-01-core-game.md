# 04 — Speed Match: Core Game Loop

**Spec:** [2026-08-23-speed-match-design.md](../superpowers/specs/2026-08-23-speed-match-design.md)

## What to build

The complete Speed Match trainer end-to-end: race a Deck of Pair Cards judging "same or different?" against a gently shrinking Auto-Advance Window — tempo without punishment.

- Three routes (landing + `/play` redirect + `/play/[n]` with `?seed=`) per the shared contract.
- `levelConfig(n)`: deck size `8 + min(n, 12)`; Auto-Advance Window `max(1500, 4000 − 100·n)` ms; different-pair trickiness bands (L1–4 cross-category, L5–7 same-category, L8+ lookalikes).
- Deck generation: ~50% same-pairs / ~50% different-pairs; never more than 3 consecutive cards with the same correct answer.
- Card view: two large emojis side by side; below, always-visible SAME 👯 / DIFFERENT 🙅 buttons (`--touch-min`); subtle draining window bar as the tempo cue.
- Correct → pop sound + immediate advance. Wrong → button wobbles silently, card stays until answered correctly or the window expires. Expiry → silent advance, no penalty, no punitive cue ever.
- Tab blur freezes the remaining window time (never expires while hidden).
- Deck finished → WinOverlay celebration with Next Level ▶ / Replay / Back; hub card; i18n keys in six languages.

## Acceptance criteria

- [ ] Landing/redirect/persistence behave per the shared route contract
- [ ] Deck constraints hold across seeds at multiple levels (ratio, ≤3 answer streak, lookalikes only at L8+) — unit-tested
- [ ] Window duration follows formula with 1500 ms floor; drain bar visually tracks it
- [ ] Wrong tap wobbles silently and never advances the deck by itself
- [ ] Window expiry advances silently — no sound, no shake, no counter change
- [ ] Correct answers advance immediately and increment progress toward deck completion
- [ ] Hidden tab never expires a window; remaining time resumes intact on focus
- [ ] Finishing the deck triggers WinOverlay; Next Level ▶ starts round n+1 fresh
- [ ] Vitest unit tests + seeded Playwright happy-path e2e using a long-window seed (never timing-dependent)

## Blocked by

- [trainers-01-kit](trainers-01-kit.md)
