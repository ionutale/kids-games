/**
 * Castle — original coloring-page line art for the Paint studio.
 *
 * 390x844 portrait sheet. The castle stands on a flat 620 ground and the
 * little dragon sits beside the right tower, clear of the walls.
 */
export const CASTLE_VIEWBOX = { width: 390, height: 844 };

export const CASTLE_REGIONS = [
  { id: 'sky', d: 'M 0 0 H 390 V 620 H 0 Z' },
  { id: 'sun', d: 'M 70 90 A 38 38 0 1 0 70 166 A 38 38 0 1 0 70 90 Z' },
  {
    id: 'clouds',
    d: 'M 250 120 C 250 100 270 90 290 100 C 305 80 340 85 350 110 C 375 110 385 135 370 150 H 250 C 235 140 238 125 250 120 Z'
  },
  {
    id: 'hill',
    d: 'M 0 620 C 80 632 150 622 220 628 C 290 634 340 620 390 626 V 844 H 0 Z'
  },
  { id: 'wall', d: 'M 90 390 H 300 V 610 H 90 Z' },
  { id: 'towers', d: 'M 50 320 H 120 V 610 H 50 Z M 270 320 H 340 V 610 H 270 Z' },
  {
    id: 'roofs',
    d: 'M 40 330 L 85 250 L 130 330 Z M 260 330 L 305 250 L 350 330 Z M 120 390 L 195 310 L 270 390 Z'
  },
  {
    id: 'gate',
    d: 'M 165 500 C 165 485 180 475 195 475 C 210 475 225 485 225 500 V 610 H 165 Z'
  },
  {
    id: 'windows',
    d: 'M 140 420 H 160 V 450 H 140 Z M 230 420 H 250 V 450 H 230 Z M 85 380 H 100 V 410 H 85 Z M 290 380 H 305 V 410 H 290 Z'
  },
  { id: 'flag', d: 'M 195 250 L 245 270 L 195 290 Z' },
  {
    id: 'dragon',
    d: 'M 270 230 C 288 214 318 218 334 238 C 320 246 305 248 296 256 L 289 280 L 281 256 C 268 250 264 240 270 230 Z'
  }
];

export const CASTLE_LINES = [
  // Brick courses.
  { d: 'M 90 430 H 300' },
  { d: 'M 90 470 H 300' },
  { d: 'M 90 510 H 300' },
  { d: 'M 90 550 H 300' },
  { d: 'M 140 390 V 430' },
  { d: 'M 200 390 V 430' },
  { d: 'M 250 390 V 430' },
  // Tower stones.
  { d: 'M 50 370 H 120' },
  { d: 'M 50 450 H 120' },
  { d: 'M 270 370 H 340' },
  { d: 'M 270 450 H 340' },
  // Roof shingles.
  { d: 'M 60 315 L 85 275 L 110 315' },
  { d: 'M 285 315 L 305 275 L 330 315' },
  // Gate planks and handle.
  { d: 'M 180 500 V 610' },
  { d: 'M 195 540 V 610' },
  { d: 'M 210 500 V 610' },
  { d: 'M 210 560 C 216 564 220 560 218 554' },
  // Window mullions.
  { d: 'M 150 420 V 450' },
  { d: 'M 240 420 V 450' },
  // Flag pole.
  { d: 'M 195 250 V 300' },
  // Dragon wing, face and tail.
  { d: 'M 280 236 C 290 228 302 228 312 234' },
  { d: 'M 300 248 C 306 246 312 248 316 252' },
  { d: 'M 275 260 C 270 268 272 274 278 278' },
  // Cloud bumps.
  { d: 'M 270 130 C 278 120 290 120 298 128' },
  { d: 'M 315 120 C 323 110 336 112 342 122' }
];

export const CASTLE_DOTS = [
  { cx: 306, cy: 242, r: 2.8 },
  { cx: 316, cy: 242, r: 2.8 }
];

export const CASTLE_SMILES = [
  { d: 'M 308 252 C 312 255 317 255 320 251' }
];
