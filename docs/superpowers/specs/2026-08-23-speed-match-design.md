# Speed Match — Design (Brain Trainer 3 of 4)

**Date:** 2026-08-23
**Status:** Approved scope (grill-with-docs session)
**Collection:** Brain Trainers — see shared decisions in `2026-08-23-focus-tap-design.md` ("Collection-wide decisions"); they apply verbatim to this game.

## Concept

Elevate-inspired processing-speed trainer. The child races through a **Deck** of **Pair Cards**, each showing two emojis side by side, answering "same or different?" with two fixed buttons. A gentle **Auto-Advance Window** keeps tempo — cards move on silently when time runs out, so there is never a fail state; speed emerges from the shrinking window, not from punishment.

Cognitive skill trained: processing speed, visual comparison, decision-making under gentle time pressure.

## Routes

| Route | File | Behavior |
|---|---|---|
| `/games/speed-match` | `src/routes/games/speed-match/+page.svelte` | Landing: LevelBar + Play |
| `/games/speed-match/play` | `src/routes/games/speed-match/play/+page.js` | Redirect to saved level |
| `/games/speed-match/play/[n]` | `src/routes/games/speed-match/play/[n]/+page.svelte` | The round; saves *n*; accepts `?seed=` |

## Core Loop

1. A Pair Card appears center screen: two large emojis side by side.
2. Below it, two always-visible buttons: **SAME 👯** and **DIFFERENT 🙅**.
3. A subtle window bar drains over the Auto-Advance Window duration (visual tempo cue).
4. Correct answer → satisfying pop sound, card advances immediately, counter increments.
5. Wrong answer → pressed button wobbles silently; the card stays until answered correctly *or* the window expires (then advances silently — never a penalty, never counted).
6. Unanswered window expiry → silent advance, no sound, no penalty.
7. Deck finished → Celebration Sequence (WinOverlay + cheer) with **Next Level ▶ / Replay / Back**.

Round = finish the deck. Goal-driven; no score.

## Level Ladder (unbounded)

`levelConfig(n)` — pure function, unit-tested:

| Parameter | Formula |
|---|---|
| Deck size | `8 + min(n, 12)` cards |
| Auto-Advance Window | `max(1500, 4000 − 100·n)` ms |
| Different-pair trickiness | L1–4 cross-category · L5–7 same-category · L8+ lookalikes |

### Deck composition (per round, seeded rng)

- ~50% same-pairs (two identical emojis) / ~50% different-pairs.
- Never more than 3 consecutive cards with the same correct answer.
- Same-pair emoji drawn from any category; difficulty comes only from the different-pairs.

## Interaction Rules (positive-only)

- Wrong taps: wobble only — silent, non-counting, round cannot be lost.
- Window expiry is invisible to the child beyond the draining bar: no buzz, no shake, no red.
- Single-touch lock on buttons; buttons meet `--touch-min`.
- Audio: `playPop` (correct), `playWinCheer` (deck complete). Nothing punitive.
- Tab blur pauses the current window timer; focus resumes with the full remaining time frozen state preserved (never expires while hidden).

## i18n Keys

`speedMatch.title`, `speedMatch.same`, `speedMatch.different`, `speedMatch.play`, `speedMatch.nextLevel`, `speedMatch.replay`, `speedMatch.back`, `speedMatch.progress` — en/it/ro/de/fr/zh.

## Glossary Terms (added to CONTEXT.md)

**Pair Card**, **Deck**, **Auto-Advance Window**.

## Testing

- **Vitest unit**: `levelConfig` caps (window floor 1500 ms, deck cap); deck constraints (ratio, ≤3 streak of identical answers, lookalike pairs only at L8+); seeded determinism.
- **Playwright e2e** (seeded): landing → play → answer one card correctly via data attributes → wrong button wobbles without advancing → complete deck → win overlay → Next Level link. One long-window seed used so e2e never depends on expiry timing.

## Out of Scope (v1)

Reaction-time stats, swipe input, adaptive windows per child, combo streaks.
