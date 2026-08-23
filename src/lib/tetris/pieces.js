export const SHAPES = {
  I: { cells: [[1, 1, 1, 1]], color: '#4FC3F7' },
  O: { cells: [[1, 1], [1, 1]], color: '#FFD54F' },
  T: { cells: [[0, 1, 0], [1, 1, 1]], color: '#BA68C8' },
  S: { cells: [[0, 1, 1], [1, 1, 0]], color: '#81C784' },
  Z: { cells: [[1, 1, 0], [0, 1, 1]], color: '#E57373' },
  J: { cells: [[1, 0, 0], [1, 1, 1]], color: '#64B5F6' },
  L: { cells: [[0, 0, 1], [1, 1, 1]], color: '#FFB74D' }
};

export const TYPES = Object.keys(SHAPES);

export function spawn(type, x = 3, y = 0) {
  const def = SHAPES[type];
  return { type, cells: def.cells.map((r) => [...r]), color: def.color, x, y };
}

export function rotateCW(cells) {
  const rows = cells.length;
  const cols = cells[0].length;
  const out = [];
  for (let c = 0; c < cols; c++) {
    out.push([]);
    for (let r = rows - 1; r >= 0; r--) out[c].push(cells[r][c]);
  }
  return out;
}

export function rotateCCW(cells) {
  const rows = cells.length;
  const cols = cells[0].length;
  const out = [];
  for (let r = 0; r < cols; r++) {
    out.push([]);
    for (let c = 0; c < rows; c++) {
      out[r].push(cells[c][cols - 1 - r]);
    }
  }
  return out;
}

export function randomType(rng = Math.random) {
  return TYPES[Math.floor(rng() * TYPES.length) % TYPES.length];
}
