# Tetris — Design Spec

## Problem Statement

The hub has tapping, sorting, and memory games — but no game that tests **spatial planning under gentle time pressure** with a persistent score. Tetris is the canonical falling-block puzzle: instantly understood, endlessly replayable, and its line-clearing + level progression naturally rewards score chasing. With difficulty levels it serves both young beginners and older kids.

## Solution

A touch-first Tetris on a standard 10×20 board with 7 SVG tetrominoes. Pieces fall at a difficulty-dependent speed, the player moves/rotates them with on-screen buttons and swipe-drag, and clears lines to score. Difficulty (Easy/Medium/Hard) tunes drop speed and helper features; the classic 100/300/500/800 × level scoring plus soft/hard drop bonuses feeds a best-score persisted in localStorage.

## User Stories

1. As a child, I want to see a 10×20 board with colorful pieces, so that I can understand where to place them.
2. As a child, I want to move pieces left/right with big buttons or swipe, so that I can steer them without precision taps.
3. As a child, I want to rotate pieces with dedicated CW/CCW buttons, so that I can orient them.
4. As a child, I want to drop a piece quickly when I've decided, so that the game moves at my pace.
5. As a child, I want cleared lines to disappear and score points, so that I feel rewarded.
6. As a child, I want a ghost piece on Easy showing where the piece will land, so that placing is forgiving.
7. As a child, I want to pause the game and have it pause itself when I leave the tab, so that I never lose progress to distraction.
8. As a child, I want a hint button that shows the best spot for the current piece, so that I can get unstuck.
9. As a child, I want my best score remembered, so that I can beat my own record.
10. As a child, I want a gentle game-over screen with my score and a tap-to-restart, so that trying again is effortless.

## Implementation Decisions

### Board & Pieces
- Standard 10 columns × 20 rows, 7 tetrominoes (I, O, T, S, Z, J, L)
- Pieces rendered as **SVG tetrominoes** in a kids palette (crisp at any scale, matching the puzzle game's SVG craftsmanship)
- Fixed orientation convention: pieces are always upright — no rotation surprises beyond CW/CCW

### Difficulty Levels
| Parameter | Easy | Medium | Hard |
|---|---|---|---|
| Drop interval @ level 1 | 1000ms | 700ms | 450ms |
| Speed-up per level | ~8% faster | ~8% faster | ~8% faster |
| Speed floor | 100ms | 100ms | 100ms |
| Lines per level | 10 | 10 | 10 |
| Ghost piece | ✅ | ❌ | ❌ |
| Hold piece | ❌ | ❌ | ✅ |
| Scoring multiplier | none | none | none |

Difficulty affects **speed and features only** — score is never multiplied by difficulty.

### Controls (touch-first)
- On-screen buttons: move left, move right, rotate CW, rotate CCW, soft drop (hold to descend), hard drop
- Swipe-drag on the board moves the piece left/right (single-touch lock — resting palms ignored)
- Tap on a piece = rotate CW
- Keyboard optional: ←/→ move, ↑ rotate CW, Z rotate CCW, ↓ soft drop, Space hard drop
- Buttons are large, thumb-reachable, and non-overlapping with the board

### Scoring
- Line clears (classic guideline): single 100, double 300, triple 500, Tetris 800 — each × current level
- Soft drop: +1 point per cell dropped
- Hard drop: +2 points per cell dropped
- No combo, no back-to-back bonuses in v1 (kids first)
- Best score persisted per difficulty in localStorage (reusing the puzzle's Progress State pattern): `tetris-best-easy|medium|hard`

### Game Flow
1. **Start**: game begins immediately on load (difficulty last-selected from settings)
2. **Playing**: pieces fall at the drop interval; player moves/rotates/drops
3. **Level up**: every 10 cleared lines — brief full-board flash + sound, game continues immediately (non-modal, <1.5s)
4. **New best score**: short confetti burst (reuse `Confetti.svelte`) when the best is beaten
5. **Game over**: stack touches the top — overlay shows score + best score, tap to restart (fresh start)
6. **Exit**: parental gate (3 taps within 3s) — matches the puzzle's convention

### Pause
- Pause button on screen; **auto-pause on tab blur** (visibilitychange)
- Paused overlay: resume / restart

### Help — Hint Button
- No auto-nudge; a hint button highlights the best spot for the current piece (ghost-cell flash + subtle outline)
- Available at all difficulties, no cooldown — proactive help a kid can choose

### Sound (positive-only, WebAudio tones via `$lib/sounds/audioManager.js`)
| Event | Sound |
|---|---|
| Piece lock | Soft tap |
| Line clear | Ascending chime (pitch rises with combo) |
| Tetris (4-line) clear | Bigger fanfare |
| Level up | Bright two-note |
| New best score | Fanfare |
| Failed drop / game over | Silence (no punitive sounds) |

### Architecture
- Logic module: `src/lib/tetris/engine.js` — pure functions (spawn, rotate, gravity step, line detection, scoring) exported for unit testing
- `src/lib/tetris/pieces.js` — 7 tetromino shapes + SVG path generation
- UI: `src/routes/games/tetris/+page.svelte` (Svelte 5 runes), `+page.js` with prerender=false, ssr=false (matches hub convention)
- State: pure component state with runes, fed by engine functions
- Game loop: `requestAnimationFrame` with accumulated drop time

### States
- `playing` — pieces fall, input active
- `paused` — overlay, no gravity, no input
- `gameOver` — final score + best score, tap to restart

## Testing Decisions

### Unit tests (`tests/unit/tetris.test.js`)
- Piece spawn/shapes: 7 tetrominoes, correct dimensions
- Rotation: CW/CCW on all 7 pieces, wall-kick behavior
- Gravity: step applies drop interval correctly per difficulty
- Line detection: single/double/triple/Tetris counts
- Scoring: 100/300/500/800 × level, soft/hard drop points
- Speed curve: interval shrinks ~8%/level, floors at 100ms

### Behavioral tests (`tests/behavioral/tetris.test.js`)
- Full round simulation: spawn → move → rotate → drop → lock → line clear → score
- Difficulty matrix: E/M/H produce correct intervals, ghost/hold availability
- Game over triggers at stack-top contact

### E2E tests (`tests/e2e/tetris.test.js`)
- Board and buttons load
- Hard drop places a piece
- Line clear scores (scripted piece placement)
- Pause/resume works
- Game-over overlay appears and restarts

## Out of Scope

- No hold piece except on Hard (difficulty model decision)
- No ghost piece on Medium/Hard
- No combo/back-to-back scoring bonuses
- No in-progress resume — fresh start every game, only best score persists
- No hub-wide leaderboard
- No keyboard-primary support (optional polish only)
- No tutorial mode (hint button covers the need)
