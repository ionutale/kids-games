import { VIRTUAL_W, VIRTUAL_H } from './pieces.js';

export function pieceSvgHtml(piece, imageFile, opts = {}) {
  const { isDragging = false } = opts;
  const clipId = `cp-${piece.id}`;
  const shId = `sh-${piece.id}`;
  return `<svg viewBox="0 0 ${piece.boxW} ${piece.boxH}" style="width:100%;height:100%;overflow:visible" aria-hidden="true">
    <defs>
      <clipPath id="${clipId}">
        <path d="${piece.path}" transform="translate(${piece.padding}, ${piece.padding})" />
      </clipPath>
      <filter id="${shId}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity="0.4" />
      </filter>
    </defs>
    <g filter="${isDragging ? `url(#${shId})` : 'none'}">
      <image href="${imageFile}"
        x="${piece.padding - piece.targetX}" y="${piece.padding - piece.targetY}"
        width="${VIRTUAL_W}" height="${VIRTUAL_H}" preserveAspectRatio="xMidYMid slice"
        clip-path="url(#${clipId})" style="pointer-events:none;touch-action:none" />
      <path d="${piece.path}" transform="translate(${piece.padding}, ${piece.padding})"
        fill="none" stroke="${isDragging ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'}" stroke-width="${isDragging ? 3 : 1.5}"
        style="pointer-events:none;touch-action:none" />
    </g>
  </svg>`;
}

export function boardLinesSvgHtml(pieces) {
  const paths = pieces.map(p =>
    `<path d="${p.path}" transform="translate(${p.targetX}, ${p.targetY})" style="fill:none;stroke:rgba(0,0,0,0.18);stroke-width:1.5;stroke-linejoin:round" />`
  ).join('');
  return `<svg viewBox="0 0 ${VIRTUAL_W} ${VIRTUAL_H}" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" aria-hidden="true">${paths}</svg>`;
}
