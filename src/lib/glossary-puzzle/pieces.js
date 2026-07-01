import headbreaker from 'headbreaker';

const { Rounded } = headbreaker.Outline;
const { Tab, Slot, None, Piece } = headbreaker;

const outline = new Rounded({
  bezelize: false,
  bezelDepth: 2 / 5,
  insertDepth: 4 / 5,
  borderLength: 1 / 3,
});

function createInsert(type) {
  if (type === 'tab') return Object.create(Tab);
  if (type === 'blank') return Object.create(Slot);
  return Object.create(None);
}

function edgesToHbPiece(edges) {
  return new Piece({
    up: createInsert(edges.top),
    right: createInsert(edges.right),
    down: createInsert(edges.bottom),
    left: createInsert(edges.left),
  });
}

function pointsToSvgPath(pts) {
  let path = `M ${pts[0].toFixed(1)},${pts[1].toFixed(1)}`;
  for (let i = 2; i < pts.length; i += 6) {
    if (i + 5 < pts.length) {
      path += ` C ${pts[i].toFixed(1)},${pts[i + 1].toFixed(1)}`
           + ` ${pts[i + 2].toFixed(1)},${pts[i + 3].toFixed(1)}`
           + ` ${pts[i + 4].toFixed(1)},${pts[i + 5].toFixed(1)}`;
    }
  }
  return path + ' Z';
}

export function piecePath(edges, size = 100) {
  const hbPiece = edgesToHbPiece(edges);
  const pts = outline.draw(hbPiece, size, 0);
  return pointsToSvgPath(pts);
}

function randomEdge(exclude) {
  if (exclude === 'flat') return Math.random() < 0.5 ? 'tab' : 'blank';
  const val = Math.random() < 0.5 ? 'tab' : 'blank';
  return val === exclude ? (val === 'tab' ? 'blank' : 'tab') : val;
}

function invert(e) {
  return e === 'tab' ? 'blank' : 'tab';
}

export function generatePieces(image, difficulty) {
  const { cols, rows } = difficulty;
  const pieces = [];

  const edges = [];
  for (let r = 0; r < rows; r++) {
    edges[r] = [];
    for (let c = 0; c < cols; c++) {
      const top = r === 0 ? 'flat' : invert(edges[r - 1][c].bottom);
      const left = c === 0 ? 'flat' : invert(edges[r][c - 1].right);
      const right = c === cols - 1 ? 'flat' : randomEdge(left);
      const bottom = r === rows - 1 ? 'flat' : randomEdge(top);
      edges[r][c] = { top, right, bottom, left };
    }
  }

  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({ row: r, col: c, edgeTypes: edges[r][c] });
    }
  }

  const shuffled = [...positions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const s = 100;
  const padding = 32;

  shuffled.forEach((pos) => {
    const path = piecePath(pos.edgeTypes, s);

    pieces.push({
      id: `${pos.row}-${pos.col}`,
      correctRow: pos.row,
      correctCol: pos.col,
      w: s,
      h: s,
      path,
      edges: pos.edgeTypes,
      padding,
      boxW: s + padding * 2,
      boxH: s + padding * 2,
      targetX: pos.col * s,
      targetY: pos.row * s,
      placed: false,
    });
  });

  return { pieces, rows, cols };
}
