# Path Builder — Design Spec

## Problem Statement

The app has reaction games, memory games, and logic games — but no **spatial reasoning / planning** game. Path building exercises forward planning, spatial awareness, and problem-solving: essential cognitive skills that most existing games don't address.

## Solution

A grid with a Start emoji (🚩) and a Goal emoji (🏁), scattered obstacles (🧱). Player draws a path from Start to Goal by tapping adjacent cells. The path must connect Start to Goal without crossing obstacles. Each solved puzzle advances to a harder one.

## User Stories

1. As a child, I want to see a grid with a Start, a Goal, and some obstacles, so that I know the puzzle parameters.
2. As a child, I want to build a path by tapping cells one at a time, so that I control the route.
3. As a child, I want to see the path cells highlight as I tap them, so that I can see my route forming.
4. As a child, I want to tap an existing path cell to undo it, so that I can correct mistakes.
5. As a child, I want obstacles to reject taps (gentle shake), so that I learn to go around them.
6. As a child, I want automatic validation when my path reaches the Goal, so that I know I solved it.
7. As a child, I want a celebration when I reach the Goal, so that I feel rewarded.
8. As a child, I want puzzles to get harder (larger grid, more obstacles), so that I stay challenged.
9. As a child, I want a "hint" button that shows the first missing step, so that I don't get stuck.

## Implementation Decisions

### Grid sizes
- Easy (age 2-3): 4×4 grid, 1-2 obstacles
- Medium (age 4): 5×5 grid, 3-5 obstacles
- Hard (age 5+): 6×6 grid, 5-8 obstacles

### Path rules
- Path cells must be adjacent (4-directional, no diagonals)
- Path cannot cross itself
- Path cannot cross obstacles
- Path must start from start position and end at goal position
- Undo: tap any cell on the path → removes it and everything after it

### Puzzle generation
- Procedurally generate puzzles:
  1. Create empty grid
  2. Place Start and Goal at random positions (at least 3 cells apart)
  3. Place N obstacles randomly, ensuring at least one valid path exists
  4. Ensure minimum path length (at least 3 cells)

- Validate: run BFS from Start to Goal, verify path exists despite obstacles

### Levels
- 5 puzzles per level. Each level increases grid size or obstacle count.
- After completing all puzzles in a level → "Level Complete" + next level
- Unlock next level only after clearing previous (optional — or free play)

### Hint system
- Each puzzle has 3 hints available
- Hint highlights the next correct cell on the shortest path (BFS computed)
- Shortest path precomputed during puzzle generation

### Architecture
- `src/lib/path-builder/engine.js` — puzzle generation, path validation, BFS solver, hint computation
- `src/routes/games/path-builder/+page.svelte`
- SSR config: `+page.js`

### Sound
- Path cell placed: tap sound (playTap)  
- Obstacle tap: gentle buzz (playError)
- Path cell removed: reverse tap sound
- Reached Goal: victory jingle (playMatch)
- Level complete: celebration (playWin)

## Testing Decisions

### Behavioral tests (engine)
Prior art: `tests/behavioral/puzzle.test.js` (pure logic functions, grid-based)

- Puzzle generation: valid Start and Goal positions
- Puzzle generation: obstacles don't block all paths (BFS finds a route)
- Puzzle generation: minimum path length guarantee
- Path validation: valid path detected correctly
- Path validation: broken path detected
- Path validation: path crossing obstacles detected
- BFS solver: returns shortest path
- Hint: returns next cell on optimal path
- Grid dimensions map to age/level

### Unit tests
- Puzzle data structure

### E2E tests
- Page loads with grid visible
- Tapping a cell adds it to path
- Path reaches Goal → celebration

## Out of Scope
- Diagonal path connections
- Weighted paths (shortest bonus)
- Enemy/collectible mechanics on path
- Multi-player races
- Undo button (tap-to-undo is sufficient)
- Auto-solve button
