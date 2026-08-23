# 01 — Sequence Memory: Core Game Loop

## What to build

The full game loop for Sequence Memory: 4 emoji pads in a 2×2 grid. Player presses "Start" → a sequence of emoji flashes → player repeats by tapping → correct: next round +1 step → wrong: second chance → second wrong: game over.

Files:
- `src/routes/games/sequence-memory/+page.svelte`
- `src/routes/games/sequence-memory/+page.js`

State machine: idle → playing → listening → correct → wrong → gameOver

## Acceptance criteria

- [ ] 4 emoji pads render in a 2×2 grid with distinct colors
- [ ] "Start" button visible on idle state
- [ ] Pressing Start plays a 2-step sequence (pads highlight with animation + tone)
- [ ] After sequence plays, pads become tappable
- [ ] Tapping in correct order advances to next round (+1 step)
- [ ] Wrong tap shows "try again" feedback and replays sequence slower
- [ ] Second wrong tap triggers game over
- [ ] Round number displayed during play
- [ ] Game over shows round reached and replay button
- [ ] High score saved to localStorage

## Blocked by

None — can start immediately
