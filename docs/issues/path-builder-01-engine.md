# 01 — Path Builder: Puzzle Engine

## What to build

Pure-function puzzle generator and path validation engine. Generates grids with Start, Goal, and obstacles such that at least one valid path exists. Provides BFS solver for hint computation and path validation.

File: `src/lib/path-builder/engine.js`

## Acceptance criteria

- [ ] `generatePuzzle(gridSize, obstacleCount)` returns a grid with Start, Goal, obstacles
- [ ] Generated puzzle always has at least one valid path (BFS-verified)
- [ ] Start and Goal are at least 3 cells apart
- [ ] `isValidPath(grid, path)` returns true for valid path
- [ ] `isValidPath()` returns false for path crossing obstacles
- [ ] `isValidPath()` returns false for broken path (gaps)
- [ ] `isValidPath()` returns false for path with diagonals
- [ ] `findShortestPath(grid)` returns optimal cell sequence via BFS
- [ ] `getHint(grid, currentPath)` returns next cell on shortest path
- [ ] Grid sizes: 4×4 to 6×6 depending on level
- [ ] All behavioral tests pass

## Blocked by

None — can start immediately
