// Jigsaw piece generation with interlocking tab/blank edges

function randomEdge(exclude) {
  if (exclude === 'flat') return Math.random() < 0.5 ? 'tab' : 'blank';
  const val = Math.random() < 0.5 ? 'tab' : 'blank';
  return val === exclude ? (val === 'tab' ? 'blank' : 'tab') : val;
}

export function generatePieces(image, difficulty) {
  const { cols, rows } = difficulty;
  const grid = image.grid;
  const cellEmoji = {};
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
      const emoji = grid[r]?.[c] || '❓';
      cellEmoji[`${r}-${c}`] = emoji;
      positions.push({ row: r, col: c, emoji, edges: edges[r][c] });
    }
  }

  // Shuffle positions for the tray
  const shuffled = [...positions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Create piece objects
  shuffled.forEach((pos, index) => {
    pieces.push({
      id: `${pos.row}-${pos.col}`,
      correctRow: pos.row,
      correctCol: pos.col,
      emoji: pos.emoji,
      edges: pos.edges,
      placed: false,
    });
  });

  return { pieces, rows, cols, cellEmoji };
}

function invert(edge) {
  return edge === 'tab' ? 'blank' : 'tab';
}

// Generate SVG path for a puzzle piece
export function piecePath(edges, size, inset = 0.22) {
  const s = size;
  const i = size * inset;
  const half = i / 2;

  const top = edgePath(edges.top, 'top', s, i, half);
  const right = edgePath(edges.right, 'right', s, i, half);
  const bottom = edgePath(edges.bottom, 'bottom', s, i, half);
  const left = edgePath(edges.left, 'left', s, i, half);

  return `M 0,0 ${top} L ${s},0 ${right} L ${s},${s} ${bottom} L 0,${s} ${left} Z`;
}

function edgePath(type, side, s, i, half) {
  if (type === 'flat') {
    if (side === 'top') return `L ${s},0`;
    if (side === 'right') return `L ${s},${s}`;
    if (side === 'bottom') return `L 0,${s}`;
    if (side === 'left') return `L 0,0`;
  }

  const dir = type === 'tab' ? 1 : -1;

  // Control points for a smooth tab/blank curve
  const cp1 = i * 0.3;
  const cp2 = i * 0.7;

  switch (side) {
    case 'top': {
      const mid = s / 2;
      return `L ${mid - half},0 C ${mid - half},${cp1 * dir} ${mid - i},{${cp1 * dir}} ${mid - i},{${i * dir}}
              C ${mid - i},{${cp2 * dir}} ${mid - i * 0.7},{${i * dir}} ${mid - i * 0.3},{${i * dir}}
              C ${mid},{${i * dir * 1.15}} ${mid + i * 0.3},{${i * dir}} ${mid + i * 0.3},{${i * dir}}
              C ${mid + i * 0.7},{${i * dir}} ${mid + i},{${cp2 * dir}} ${mid + i},{${i * dir}}
              C ${mid + i},{${cp1 * dir}} ${mid + half},{${cp1 * dir}} ${mid + half},0
              L ${s},0`;
    }
    case 'right': {
      const mid = s / 2;
      return `L ${s},${mid - half} C ${s - cp1 * dir},${mid - half} ${s - i * dir},${mid - i} ${s - i * dir},${mid - i}
              C ${s - i * dir},${mid - i * 0.7} ${s - i * dir},${mid - i * 0.3} ${s - i * dir},${mid}
              C ${s - i * dir * 1.15},${mid + i * 0.3} ${s - i * dir},${mid + i * 0.3} ${s - i * dir},${mid + i * 0.3}
              C ${s - i * dir},${mid + i * 0.7} ${s - i * dir},${mid + i} ${s - cp1 * dir},${mid + half}
              L ${s},${mid + half} L ${s},${s}`;
    }
    case 'bottom': {
      const mid = s / 2;
      return `L ${mid + half},${s} C ${mid + half},${s - cp1 * dir} ${mid + i},{${s - cp1 * dir}} ${mid + i},{${s - i * dir}}
              C ${mid + i},{${s - i * dir * 0.7}} ${mid + i * 0.7},{${s - i * dir}} ${mid + i * 0.3},{${s - i * dir}}
              C ${mid},{${s - i * dir * 1.15}} ${mid - i * 0.3},{${s - i * dir}} ${mid - i * 0.3},{${s - i * dir}}
              C ${mid - i * 0.7},{${s - i * dir}} ${mid - i},{${s - cp2 * dir}} ${mid - i},{${s - i * dir}}
              C ${mid - i},{${s - cp1 * dir}} ${mid - half},{${s - cp1 * dir}} ${mid - half},${s}
              L 0,${s}`;
    }
    case 'left': {
      const mid = s / 2;
      return `L 0,${mid + half} C ${cp1 * dir},${mid + half} ${i * dir},${mid + i} ${i * dir},${mid + i}
              C ${i * dir},${mid + i * 0.7} ${i * dir},${mid + i * 0.3} ${i * dir},${mid}
              C ${i * dir * 1.15},${mid - i * 0.3} ${i * dir},${mid - i * 0.3} ${i * dir},${mid - i * 0.3}
              C ${i * dir},${mid - i * 0.7} ${i * dir},${mid - i} ${cp1 * dir},${mid - half}
              L 0,${mid - half}`;
    }
    default: return '';
  }
}
