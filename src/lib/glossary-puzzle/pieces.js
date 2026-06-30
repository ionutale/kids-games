// Jigsaw piece generation with interlocking tab/blank edges
// Edge path algorithm adapted from jigsaw-puzzle npm package

function randomEdge(exclude) {
  if (exclude === 'flat') return Math.random() < 0.5 ? 'tab' : 'blank';
  const val = Math.random() < 0.5 ? 'tab' : 'blank';
  return val === exclude ? (val === 'tab' ? 'blank' : 'tab') : val;
}

export function generatePieces(image, difficulty) {
  const { cols, rows } = difficulty;
  const pieces = [];

  // Build edge assignments ensuring adjacent pieces match
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

  // Create shuffled list of positions
  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({ row: r, col: c, edges: edges[r][c] });
    }
  }

  // Shuffle positions for the tray
  const shuffled = [...positions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Create piece objects
  shuffled.forEach((pos) => {
    pieces.push({
      id: `${pos.row}-${pos.col}`,
      correctRow: pos.row,
      correctCol: pos.col,
      edges: pos.edges,
      placed: false,
    });
  });

  return { pieces, rows, cols };
}

function invert(edge) {
  return edge === 'tab' ? 'blank' : 'tab';
}

// Generate SVG path for a puzzle piece
// Uses 6 cubic bezier segments to create the traditional tab/blank jigsaw shape
// Based on the jigsaw-puzzle npm package algorithm
export function piecePath(edges, s) {
  const top = edgePath(edges.top, s, 1);
  const right = edgePath(edges.right, s, 2);
  const bottom = edgePath(edges.bottom, s, 3);
  const left = edgePath(edges.left, s, 4);
  return `M 0,0 ${top} L ${s},0 ${right} L ${s},${s} ${bottom} L 0,${s} ${left} Z`;
}

function edgePath(type, s, side) {
  if (type === 'flat') {
    switch (side) {
      case 1: return `L ${s},0`;
      case 2: return `L ${s},${s}`;
      case 3: return `L 0,${s}`;
      case 4: return `L 0,0`;
    }
  }

  const isTab = type === 'tab';
  const k = 0.5522847498; // circle approx constant

  // For tab: positive depth = outward, negative = inward
  // We use bezier curves to draw a smooth knob centered on the edge
  const mid = s / 2;
  const neckW = s * 0.088;
  const bR = s * 0.121;
  const nD = s * 0.066;
  const tD = nD + bR;

  switch (side) {
    case 1: {
      // Top edge: left to right
      const sign = isTab ? -1 : 1;
      const y1 = sign * nD;
      const y2 = sign * tD;
      return `L ${mid - neckW},0
        L ${mid - neckW},${y1}
        C ${mid - neckW},${y1 + sign * bR * (1 - k)}
          ${mid - bR * k},${y2}
          ${mid},${y2}
        C ${mid + bR * k},${y2}
          ${mid + neckW},${y1 + sign * bR * (1 - k)}
          ${mid + neckW},${y1}
        L ${mid + neckW},0
        L ${s},0`;
    }
    case 2: {
      // Right edge: top to bottom
      const sign = isTab ? 1 : -1;
      const x1 = s + sign * nD;
      const x2 = s + sign * tD;
      return `L ${s},${mid - neckW}
        L ${x1},${mid - neckW}
        C ${x1 + sign * bR * (1 - k)},${mid - neckW}
          ${x2},${mid - bR * k}
          ${x2},${mid}
        C ${x2},${mid + bR * k}
          ${x1 + sign * bR * (1 - k)},${mid + neckW}
          ${x1},${mid + neckW}
        L ${s},${mid + neckW}
        L ${s},${s}`;
    }
    case 3: {
      // Bottom edge: right to left
      const sign = isTab ? 1 : -1;
      const y1 = s + sign * nD;
      const y2 = s + sign * tD;
      return `L ${mid + neckW},${s}
        L ${mid + neckW},${y1}
        C ${mid + neckW},${y1 + sign * bR * (1 - k)}
          ${mid + bR * k},${y2}
          ${mid},${y2}
        C ${mid - bR * k},${y2}
          ${mid - neckW},${y1 + sign * bR * (1 - k)}
          ${mid - neckW},${y1}
        L ${mid - neckW},${s}
        L 0,${s}`;
    }
    case 4: {
      // Left edge: bottom to top
      const sign = isTab ? -1 : 1;
      const x1 = sign * nD;
      const x2 = sign * tD;
      return `L 0,${mid + neckW}
        L ${x1},${mid + neckW}
        C ${x1 + sign * bR * (1 - k)},${mid + neckW}
          ${x2},${mid + bR * k}
          ${x2},${mid}
        C ${x2},${mid - bR * k}
          ${x1 + sign * bR * (1 - k)},${mid - neckW}
          ${x1},${mid - neckW}
        L 0,${mid - neckW}`;
    }
    default: return '';
  }
}
