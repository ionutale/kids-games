export const MAPS = [
  {
    id: 1, name: 'Simple S', grid: 6, startCoins: 100, lives: 10,
    layout: [
      ['spawn','path', null,  null,  null, null],
      [null,   'path', null,  null,  null, null],
      [null,   'path','path','path', null, null],
      [null,   null,   null, 'path', null, null],
      [null,   null,   null, 'path', null, null],
      [null,   null,   null, 'end',   null, null],
    ],
  },
  {
    id: 2, name: 'L-Turn', grid: 7, startCoins: 120, lives: 10,
    layout: [
      ['spawn','path', null,  null,  null,  null,  null],
      [null,  'path', null,  null,  null,  null,  null],
      [null,  'path','path','path','path', 'path', null],
      [null,   null,   null,  null,  null,  'path', null],
      [null,   null,   null,  null,  null,  'path', null],
      [null,   null,   null,  null,  null,  'path', null],
      [null,   null,   null,  null,  null,  'end',   null],
    ],
  },
  {
    id: 3, name: 'Zigzag', grid: 8, startCoins: 140, lives: 10,
    layout: [
      ['spawn','path', null,  null,  null,  null,  null, null],
      [null,  'path', null,  null,  null,  null,  null, null],
      [null,  'path','path','path', null,  null,  null, null],
      [null,   null,   null, 'path', null,  null,  null, null],
      [null,   null,   null, 'path','path','path', null, null],
      [null,   null,   null,  null,  null, 'path', null, null],
      [null,   null,   null,  null,  null, 'path','path', null],
      [null,   null,   null,  null,  null,  null,  'end',  null],
    ],
  },
  {
    id: 4, name: 'Double Back', grid: 9, startCoins: 160, lives: 10,
    layout: [
      ['spawn','path','path','path', null,  null,  null,  null, null],
      [null,   null,   null, 'path', null,  null,  null,  null, null],
      [null,   null,   null, 'path','path','path', null,  null, null],
      [null,   null,   null,  null,  null, 'path', null,  null, null],
      [null,   null,   null,  null,  null, 'path','path','path',null],
      [null,   null,   null,  null,  null,  null,  null, 'path',null],
      [null,   null,   null,  null,  null,  null,  null, 'path',null],
      [null,   null,   null,  null,  null,  null,  null, 'path',null],
      [null,   null,   null,  null,  null,  null,  null, 'end',  null],
    ],
  },
  {
    id: 5, name: 'Maze', grid: 10, startCoins: 180, lives: 10,
    layout: [
      ['spawn','path', null,  null,  null,  null,  null,  null,  null, null],
      [null,  'path', null,  null,  null,  null,  null,  null,  null, null],
      [null,  'path','path','path', null,  null,  null,  null,  null, null],
      [null,   null,   null, 'path', null,  null,  null,  null,  null, null],
      [null,   null,   null, 'path','path','path','path', null,  null, null],
      [null,   null,   null,  null,  null,  null, 'path', null,  null, null],
      [null,   null,   null,  null,  null,  null, 'path','path','path',null],
      [null,   null,   null,  null,  null,  null,  null,  null, 'path',null],
      [null,   null,   null,  null,  null,  null,  null,  null, 'path',null],
      [null,   null,   null,  null,  null,  null,  null,  null, 'end',  null],
    ],
  },
];

export function getTowerSpots(layout) {
  const spots = [];
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      if (layout[r][c] === 'tower') spots.push({ row: r, col: c, tower: null });
    }
  }
  return spots;
}

export function getPathCells(layout) {
  const cells = [];
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[r].length; c++) {
      const v = layout[r][c];
      if (v === 'path' || v === 'spawn' || v === 'end') {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}
