# Spot the Difference — Design Spec

## Problem Statement

The app has matching and memory games but no visual scanning / attention-to-detail game. "Spot the Difference" exercises sustained attention, visual discrimination, and comparison skills.

## Solution

Two identical-looking emoji grids shown side-by-side (or one after another). Most cells match, but a few differ. Player taps the cells that are different. Each puzzle has a set number of differences to find.

## User Stories

1. As a child, I want to see two emoji grids, so that I can compare them to find differences.
2. As a child, I want to tap on a cell I think is different, so that it gets marked as found.
3. As a child, I want a visual highlight when I tap correctly, so that I know I found one.
4. As a child, I want a gentle "try again" when I tap a matching cell, so that I keep looking.
5. As a child, I want all differences found → celebration, so that I feel accomplished.
6. As a child, I want the grid size and number of differences to match my ability, so that the challenge is right.
7. As a child, I want a new puzzle after each completed one, so that I can keep playing.

## Implementation Decisions

### Grid
- Easy (age 2-3): 3×3 grid, 1-2 differences
- Medium (age 4): 4×4 grid, 3 differences
- Hard (age 5+): 5×5 grid, 4-5 differences

### Layout
- Two grids side-by-side (landscape) or stacked (portrait) on mobile
- On phones: stacked layout with grids above each other
- Label: "Left" and "Right" or just visual

### Difference generation
- Start with a base grid of random emojis
- Clone it, randomly replace N cells with a different emoji
- Ensure replaced cells don't accidentally create accidental differences (same emoji appears elsewhere)
- Track difference positions for validation

### Emoji pool
- Mix of categories: animals, food, nature, objects (8-12 different emojis per puzzle)

### Game flow
1. Show two grids (identical at first glance)
2. Player taps a cell on either grid
3. If cell is a difference position → both marked with a highlight ring (green)
4. If cell is not a difference → brief shake + no mark
5. Find all differences → celebration + "Next Puzzle" button
6. No game over — endless puzzles. Home button to exit.

### Scoring
- Differences found / total per puzzle
- Running total of puzzles solved
- No high score (puzzles are independent)

### Architecture
Single file: `src/routes/games/spot-the-difference/+page.svelte`
SSR config: `+page.js`

### Sound
- Correct find: pop/ding (playTap)
- Wrong tap: gentle buzz (playError)
- Puzzle complete: ascending chime (playMatch)

## Testing Decisions

### Behavioral tests
- Difference generation produces exactly N differences
- Validation: correct cell is recognized as different
- Validation: matching cell is not marked as different
- Grid size maps to age setting

### E2E tests
- Page loads with two grids visible
- Tapping a difference marks it
- All differences found triggers celebration

## Out of Scope
- Timer-based rounds
- Multiplayer / competitive
- Increasing difficulty within a session (constant per age)
- Animations of emojis (static grids only)
