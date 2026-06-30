export const MAP_W = 12;
export const MAP_H = 12;
export const T = { EMPTY: 0, GOLD: 1, TREE: 2, WATER: 3, TOWN_HALL: 4, BARRACKS: 5, FARM: 6, TOWER: 7, LUMBER: 8, MINE: 9 };

export function createMap() {
  const grid = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(T.EMPTY));

  for (let r = 3; r <= 8; r++) grid[r][6] = T.WATER;

  const goldSpots = [[2,2],[3,10],[9,2],[8,9]];
  goldSpots.forEach(([r,c]) => {
    if (r < MAP_H && c < MAP_W) grid[r][c] = T.GOLD;
    if (r+1 < MAP_H && c+1 < MAP_W) grid[r+1][c+1] = T.GOLD;
  });

  for (let i = 0; i < 18; i++) {
    let r = Math.floor(Math.random() * MAP_H);
    let c = Math.floor(Math.random() * MAP_W);
    if (grid[r][c] === T.EMPTY) grid[r][c] = T.TREE;
  }

  return grid;
}

export function bfs(grid, startR, startC, endR, endC) {
  const rows = grid.length, cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
  const queue = [[startR, startC]];
  visited[startR][startC] = true;

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    if (r === endR && c === endC) {
      const path = [];
      let cur = [endR, endC];
      while (cur) {
        path.push(cur);
        cur = prev[cur[0]]?.[cur[1]] || null;
      }
      return path.reverse();
    }
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        const cell = grid[nr][nc];
        if (cell === T.EMPTY || (cell >= 10 && cell < 20)) {
          visited[nr][nc] = true;
          prev[nr][nc] = [r, c];
          queue.push([nr, nc]);
        }
      }
    }
  }
  return null;
}
