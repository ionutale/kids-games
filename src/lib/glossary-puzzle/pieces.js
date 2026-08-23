import headbreaker from 'headbreaker';

const { Rounded } = headbreaker.Outline;
const { Tab, Slot, None, Piece, vector } = headbreaker;

export const VIRTUAL_W = 800;
export const VIRTUAL_H = 600;

const outline = new Rounded({
  bezelize: false,
  bezelDepth: 2 / 5,
  insertDepth: 4 / 5,
  borderLength: 1 / 3,
});

function toInsert(type) {
  if (type === 'tab') return Tab;
  if (type === 'blank') return Slot;
  return None;
}

function edgesToHbPiece(edges) {
  return new Piece({
    up: toInsert(edges.top),
    right: toInsert(edges.right),
    down: toInsert(edges.bottom),
    left: toInsert(edges.left),
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
  const sizeVec = typeof size === 'number' ? size : vector(size.x, size.y);
  const pts = outline.draw(hbPiece, sizeVec, 0);
  return pointsToSvgPath(pts);
}

function randomEdge(exclude) {
  if (exclude === 'flat') return Math.random() < 0.5 ? 'tab' : 'blank';
  return exclude === 'tab' ? 'blank' : 'tab';
}

function invert(e) {
  return e === 'tab' ? 'blank' : 'tab';
}

export function generatePieces(config) {
  const { cols, rows, snapRadius } = config;
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

  const s = { x: VIRTUAL_W / cols, y: VIRTUAL_H / rows };
  const protrusion = Math.min(s.x, s.y) * (1 - 2 * (1 / 3)) * (4 / 5);
  const padding = Math.ceil(protrusion * 1.2) + 5;

  shuffled.forEach((pos) => {
    const path = piecePath(pos.edgeTypes, s);

    pieces.push({
      id: `${pos.row}-${pos.col}`,
      correctRow: pos.row,
      correctCol: pos.col,
      w: s.x,
      h: s.y,
      path,
      edges: pos.edgeTypes,
      padding,
      boxW: s.x + padding * 2,
      boxH: s.y + padding * 2,
      targetX: pos.col * s.x,
      targetY: pos.row * s.y,
      placed: false,
    });
  });

  return { pieces, rows, cols, snapRadius };
}

export const TRAY_CAPACITY = 4;

export function computeVisibleTray(queueIds, placedIds, draggingId = null, capacity = TRAY_CAPACITY) {
  const placedSet = placedIds instanceof Set ? placedIds : new Set(placedIds);
  return queueIds.filter(id => !placedSet.has(id) && id !== draggingId).slice(0, capacity);
}
