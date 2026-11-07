# 02 — Cozy Memory: Peek and Gentle Pace

## What to build

Make the memory game feel as calm as it looks. Show every face briefly before the first tap, let the first tap start play early, shorten the match celebration because the pair now stays on the board, slow the mismatch reveal so it never feels punishing at high levels, and replace the cold sine beeps with softer tones on this page.

## Acceptance criteria

- [ ] All faces peek for 1.2s on levels 1–4 and 0.8s on levels 5–10
- [ ] Taps are locked during the peek; the first tap ends it and flips that card
- [ ] Matched pairs hold for about 0.7s, then settle in place
- [ ] Mismatch delay is `max(800, 1500 − level × 60)` ms
- [ ] Pickup, match, and miss use softer tones; existing sounds for other games are untouched
- [ ] Switching level during a peek or showcase cannot corrupt the new board
- [ ] Reduced motion still ends the peek and leaves the board playable
- [ ] Unit tests pin the pacing values; e2e covers peek, first tap, and rapid taps

## Blocked by

- 01 — Cozy Memory: Scene and Persistent Pairs
