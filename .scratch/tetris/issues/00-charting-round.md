# 00 — Charting Round

Type: grilling
Status: resolved
Blocked by:

## Question

What is the destination of this effort, who is the player, and what is the scope of "with score"?

## Answer

Settled in the charting grilling session (Round 1: destination, player fit, score scope; Round 2: controls, rendering, difficulty model, board geometry, pause/game over):

- **Destination**: a design spec at `docs/superpowers/specs/2026-08-15-tetris-design.md`, matching the repo's spec → issues pipeline.
- **Player fit**: difficulty levels (Easy/Medium/Hard) like the puzzle game.
- **Score scope**: classic line scoring (100/300/500/800 × level) + level speed-up + best score persisted to localStorage. No hub-wide leaderboard.
- **Controls**: on-screen buttons (move L/R, rotate, soft drop, hard drop) + swipe-drag to move, tap = rotate; keyboard optional.
- **Rendering**: colorful SVG tetrominoes in a kids palette.
- **Difficulty model**: drop speed + lines-per-level differ per difficulty; Easy gets a ghost piece; Hard adds a hold piece; score unaffected.
- **Board**: standard 10×20, 7 tetrominoes.
- **Pause & game over**: pause button + auto-pause on tab blur; game-over overlay shows score + best score; tap to restart; parental gate to exit.
