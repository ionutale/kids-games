# Sequence Memory (Emoji Simon) — Design Spec

## Problem Statement

The app has matching games (Memory), quiz games (Animal Quiz), and reaction games (Pop) — but no game that tests **working memory** (holding and reproducing a sequence). Sequence memory is one of the most well-studied cognitive skills and is easy to gamify for kids.

## Solution

A Simon Says-style game with 4 emoji pads arranged in a 2×2 grid. A sequence of emoji flashes plays automatically. The player must repeat the sequence by tapping the pads in the correct order. Each round adds one more step to the sequence. The game continues until the player makes a mistake.

## User Stories

1. As a child, I want to see 4 colorful emoji pads, so that I know where to tap.
2. As a child, I want to watch a sequence play back with highlight animations and sounds, so that I can learn the pattern.
3. As a child, I want to tap the pads in the same order as the sequence, so that I can advance to the next round.
4. As a child, I want the sequence to grow by one step each round, so that the challenge increases gradually.
5. As a child, I want to see my current round/score, so that I know how well I'm doing.
6. As a child, I want to hear a distinct tone per pad, so that audio reinforces visual memory.
7. As a child, I want a celebratory feedback when I complete a long sequence, so that I feel proud.
8. As a child, I want to see the sequence replay one more time if I tap the wrong pad (second chance), so that I can learn from mistakes.
9. As a child, I want a clear "game over" screen showing my score and a replay button, so that I can try again.

## Implementation Decisions

### Board
- 4 emoji pads in a 2×2 grid, centered on screen
- Each pad is a large rounded rectangle with an emoji character
- Pads use distinct background colors for visual differentiation (red, green, blue, yellow — like classic Simon but softer/ kid-friendly)
- When a pad is "played" in the sequence, it brightens/glows and plays its tone

### Emoji Set
- 4 emojis: 🐱 Cat, 🐶 Dog, 🐸 Frog, 🐼 Panda (animal faces — familiar to young kids)
- Or alternatively: 🔴🔵🟢🟡 (colored shapes) — simpler visual distinction
- Choice: Animal faces — more engaging for kids

### Sequence & Difficulty
- Round 1: 2-step sequence
- Each round adds 1 step
- Speed: pads highlight for 600ms, with 300ms gap between steps
- After round 8 (10-step sequence), speed increases: highlight drops to 400ms
- After round 12, speed drops to 300ms
- Maximum difficulty: 20-step sequences at 250ms per step

### Game Flow
1. **Show sequence**: Pads highlight one at a time in sequence order
2. **Player input**: Pads glow dimly to indicate "waiting for input." Player taps pads. Correct taps advance. Incorrect tap → brief wrong animation → sequence replays at half speed (second chance)
3. **Second chance**: If player makes a second mistake on the same round → game over
4. **Advance**: After correct full replay → short celebration → next round (longer sequence)

### States
- `idle` — initial, "Start" button visible
- `playing` — sequence is highlighting automatically, player must wait
- `listening` — sequence done, player can tap
- `correct` — player completed the sequence correctly
- `wrong` — player made a mistake
- `gameOver` — final score screen

### Scoring
- Score = round number (1 point per step in the current sequence)
- High score saved to localStorage

### Sound
- 4 unique tones (one per pad), rising in pitch
- Correct sequence completion: ascending chime
- Wrong tap: descending buzz
- Game over: short jingle

### Architecture
Single file: `src/routes/games/sequence-memory/+page.svelte`
SSR config: `+page.js` with prerender=false, ssr=false

No complex engine needed — pure component state with Svelte 5 runes.

### Difficulty adaptation
- Age 2-3: start with 2-step sequences, speed stays at 700ms
- Age 4-5: standard difficulty curve
- Age 5+: starts at 3-step, faster speed from round 6

## Testing Decisions

### Behavioral tests
Import game logic and test:
- Sequence generation produces correct length
- Player input validation (correct/wrong detection)
- Score calculation
- Speed scaling at different rounds
- Age-based starting parameters

Prior art: `tests/behavioral/memory.test.js` (tests matching logic, flipped cards, locked state)

### Unit tests
- Pad data: 4 pads with emoji, color, tone

### E2E tests
- Page loads, 4 pads visible
- Tap triggers game start
- Game over screen appears after wrong input

## Out of Scope
- No multi-player
- No sequence editor
- No haptic feedback
- No adjustable speed settings (automatic progression)
- No custom emoji sets

## Further Notes
- The game should feel forgiving: kids WILL tap wrong. The second-chance mechanic prevents frustration.
- No punitive sounds — wrong input gets a gentle "try again" tone, not a harsh error.
