import { makeRng } from '../trainers/rng.js';

export function levelSpec(level) {
  const n = Math.max(1, level);
  const size = Math.min(4 + Math.floor((n - 1) / 5), 6);
  const obstacles = Math.min(1 + Math.floor((n - 1) / 2), 8);
  return { size, obstacles };
}

export function neighbors(pos, size) {
  const { r, c } = pos;
  const out = [];
  if (r > 0) out.push({ r: r - 1, c });
  if (r < size - 1) out.push({ r: r + 1, c });
  if (c > 0) out.push({ r, c: c - 1 });
  if (c < size - 1) out.push({ r, c: c + 1 });
  return out;
}

function key(p) {
  return p.r * 100 + p.c;
}

/** Shortest path (BFS) from start to goal avoiding obstacles. Returns array of cells or null. */
export function bfs(grid, start, goal) {
  const size = grid.length;
  const prev = new Map();
  const seen = new Set([key(start)]);
  let queue = [start];
  while (queue.length > 0) {
    const cur = queue.shift();
    if (cur.r === goal.r && cur.c === goal.c) {
      const path = [];
      let k = key(cur);
      while (k !== key(start)) {
        path.unshift({ r: Math.floor(k / 100), c: k % 100 });
        k = prev.get(k);
      }
      path.unshift(start);
      return path;
    }
    for (const nb of neighbors(cur, size)) {
      const k = key(nb);
      if (seen.has(k)) continue;
      seen.add(k);
      if (grid[nb.r][nb.c] === 'obstacle') continue;
      prev.set(k, key(cur));
      queue.push(nb);
    }
  }
  return null;
}

/**
 * Generates a puzzle with a guaranteed valid path of at least `minPath` length
 * (default 3 moves). Retries with fresh obstacle layouts until valid.
 */
export function generatePuzzle(level, seed = Date.now()) {
  const { size, obstacles } = levelSpec(level);
  const rng = makeRng(seed);

  for (let attempt = 0; attempt < 200; attempt++) {
    const grid = Array.from({ length: size }, () => Array(size).fill('empty'));

    // random distinct start/goal at least 3 manhattan moves apart
    const start = { r: Math.floor(rng() * size), c: Math.floor(rng() * size) };
    let goal = { ...start };
    let guard = 0;
    while ((Math.abs(goal.r - start.r) + Math.abs(goal.c - start.c)) < 3 && guard++ < 50) {
      goal = { r: Math.floor(rng() * size), c: Math.floor(rng() * size) };
    }
    if (Math.abs(goal.r - start.r) + Math.abs(goal.c - start.c) < 3) continue;

    // scatter obstacles on empty non-start/non-goal cells
    let placed = 0;
    guard = 0;
    while (placed < obstacles && guard++ < 200) {
      const r = Math.floor(rng() * size);
      const c = Math.floor(rng() * size);
      if (grid[r][c] !== 'empty') continue;
      if ((r === start.r && c === start.c) || (r === goal.r && c === goal.c)) continue;
      grid[r][c] = 'obstacle';
      placed++;
    }

    const solution = bfs(grid, start, goal);
    if (!solution || solution.length - 1 < 3) continue;

    return { level, size, grid, start, goal, solution };
  }
  // deterministic fallback: open grid corner-to-corner (always solvable)
  const grid = Array.from({ length: size }, () => Array(size).fill('empty'));
  const start = { r: 0, c: 0 };
  const goal = { r: size - 1, c: size - 1 };
  return { level, size, grid, start, goal, solution: bfs(grid, start, goal) };
}

/**
 * Validates the player's path: starts at Start, each step 4-adjacent to the last,
 * never crosses obstacles. Reaching the Goal completes the puzzle.
 * Returns 'ok' | 'complete' | 'invalid'.
 */
export function validatePath(puzzle, path) {
  const { start, goal, grid } = puzzle;
  if (path.length === 0 || path[0].r !== start.r || path[0].c !== start.c) return 'invalid';
  for (let i = 0; i < path.length; i++) {
    const cell = path[i];
    if (cell.r < 0 || cell.c < 0 || cell.r >= grid.length || cell.c >= grid.length) return 'invalid';
    if (grid[cell.r][cell.c] === 'obstacle') return 'invalid';
    if (i > 0) {
      const dr = Math.abs(cell.r - path[i - 1].r);
      const dc = Math.abs(cell.c - path[i - 1].c);
      if (dr + dc !== 1) return 'invalid';
    }
    if (cell.r === goal.r && cell.c === goal.c) {
      return i === path.length - 1 ? 'complete' : 'complete';
    }
  }
  return 'ok';
}

/** Next optimal cell from the player's current path tip toward the Goal (hint). */
export function hintCell(puzzle, path) {
  const tip = path.length > 0 ? path[path.length - 1] : puzzle.start;
  const route = bfs(
    puzzle.grid,
    { r: tip.r, c: tip.c },
    { r: puzzle.goal.r, c: puzzle.goal.c }
  );
  if (!route || route.length < 2) return null;
  return route[1];
}
