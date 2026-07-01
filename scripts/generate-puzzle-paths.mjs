// Pre-generate puzzle piece paths using headbreaker
// Run with: node scripts/generate-puzzle-paths.mjs

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Rounded } = require('headbreaker/src/outline.js');
const Piece = require('headbreaker/src/piece.js');
const { Tab, Slot, None } = require('headbreaker/src/insert.js');
import { writeFileSync } from 'fs';

const outline = new Rounded({
  bezelize: false,
  bezelDepth: 2/5,
  insertDepth: 4/5,
  borderLength: 1/3,
});

function randomEdge(exclude) {
  if (exclude === 'flat') return Math.random() < 0.5 ? 'tab' : 'blank';
  const val = Math.random() < 0.5 ? 'tab' : 'blank';
  return val === exclude ? (val === 'tab' ? 'blank' : 'tab') : val;
}
function invert(e) { return e === 'tab' ? 'blank' : 'tab'; }

function generateAll() {
  const result = {};
  
  for (const key of ['easy','medium','hard']) {
    const cols = key === 'easy' ? 2 : key === 'medium' ? 3 : 4;
    const rows = cols;
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
    shuffled.forEach((pos) => {
      const hbPiece = new Piece();
      const create = (t) => {
        if (t === 'tab') return Object.create(Tab);
        if (t === 'blank') return Object.create(Slot);
        return Object.create(None);
      };
      hbPiece.up = create(pos.edgeTypes.top);
      hbPiece.right = create(pos.edgeTypes.right);
      hbPiece.down = create(pos.edgeTypes.bottom);
      hbPiece.left = create(pos.edgeTypes.left);

      const pts = outline.draw(hbPiece, s, 0);
      
      // Convert points to SVG path
      let path = `M ${pts[0].toFixed(1)},${pts[1].toFixed(1)}`;
      for (let i = 2; i < pts.length; i += 6) {
        if (i + 5 < pts.length) {
          path += ` C ${pts[i].toFixed(1)},${pts[i+1].toFixed(1)}`
               + ` ${pts[i+2].toFixed(1)},${pts[i+3].toFixed(1)}`
               + ` ${pts[i+4].toFixed(1)},${pts[i+5].toFixed(1)}`;
        }
      }
      path += ' Z';
      
      pieces.push({
        id: `${pos.row}-${pos.col}`,
        correctRow: pos.row,
        correctCol: pos.col,
        path,
        placed: false,
        edgeTypes: pos.edgeTypes,
      });
    });

    result[key] = { pieces, rows, cols };
  }
  
  return result;
}

const data = generateAll();
const output = JSON.stringify(data, null, 2);
writeFileSync('src/lib/glossary-puzzle/pregen-pieces.json', output);
console.log('Generated paths for easy/medium/hard');
console.log(`File size: ${(output.length / 1024).toFixed(1)}KB`);
