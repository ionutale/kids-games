/**
 * Space — original coloring-page line art for the Paint studio.
 *
 * 390x844 portrait sheet: a moon, a ringed planet, a rocket, stars and an
 * astronaut. Every character stays above y=620, clear of the age-2 dock.
 */
export const SPACE_VIEWBOX = { width: 390, height: 844 };

export const SPACE_REGIONS = [
  { id: 'space', d: 'M 0 0 H 390 V 844 H 0 Z' },
  {
    id: 'stars',
    d: 'M 58 280 L 66 300 L 88 308 L 66 316 L 58 338 L 50 316 L 28 308 L 50 300 Z M 312 330 L 319 347 L 338 354 L 319 361 L 312 380 L 305 361 L 286 354 L 305 347 Z M 92 420 L 99 437 L 118 444 L 99 451 L 92 470 L 85 451 L 66 444 L 85 437 Z M 300 500 L 306 515 L 324 521 L 306 527 L 300 544 L 294 527 L 276 521 L 294 515 Z'
  },
  { id: 'moon', d: 'M 80 60 A 48 48 0 1 0 80 156 A 48 48 0 1 0 80 60 Z' },
  { id: 'planet', d: 'M 300 130 A 58 58 0 1 0 300 246 A 58 58 0 1 0 300 130 Z' },
  {
    id: 'rocket',
    d: 'M 195 285 C 160 315 150 365 150 430 V 520 H 240 V 430 C 240 365 230 315 195 285 Z'
  },
  { id: 'rocket-window', d: 'M 195 355 A 24 24 0 1 0 195 403 A 24 24 0 1 0 195 355 Z' },
  { id: 'fins', d: 'M 150 460 L 110 540 L 150 520 Z M 240 460 L 280 540 L 240 520 Z' },
  { id: 'flame', d: 'M 165 520 L 195 615 L 225 520 Z' },
  {
    id: 'astronaut',
    d: 'M 60 500 C 60 470 85 455 108 465 C 130 475 138 500 132 525 L 132 600 H 112 V 565 H 90 V 600 H 70 V 545 C 60 535 56 518 60 500 Z M 78 470 A 28 28 0 1 0 134 470 A 28 28 0 1 0 78 470 Z'
  },
  {
    id: 'comet',
    d: 'M 300 420 C 330 400 360 410 378 430 C 350 440 320 438 300 420 Z'
  }
];

export const SPACE_LINES = [
  // Moon craters.
  { d: 'M 55 95 C 62 88 74 90 76 100 C 68 108 56 104 55 95 Z' },
  { d: 'M 92 70 C 97 65 106 66 108 74 C 102 80 92 78 92 70 Z' },
  // Planet ring and craters.
  { d: 'M 220 188 C 260 166 340 166 380 188' },
  { d: 'M 220 210 C 260 232 340 232 380 210' },
  { d: 'M 278 130 C 286 122 298 124 300 134 C 292 142 280 140 278 130 Z' },
  { d: 'M 330 180 C 338 172 350 174 352 184 C 344 192 332 190 330 180 Z' },
  // Rocket panels and window highlight.
  { d: 'M 165 430 V 510' },
  { d: 'M 225 430 V 510' },
  { d: 'M 182 365 C 186 360 192 359 196 362' },
  // Flame inner.
  { d: 'M 182 525 L 195 580 L 208 525' },
  // Astronaut visor and backpack.
  { d: 'M 88 455 C 96 446 112 446 120 455' },
  { d: 'M 60 520 H 70' },
  // Comet tail.
  { d: 'M 296 426 C 276 430 260 438 250 448' },
  { d: 'M 306 436 C 292 442 280 450 274 458' },
  // Star twinkles.
  { d: 'M 58 292 V 324' },
  { d: 'M 42 308 H 74' }
];

export const SPACE_DOTS = [
  { cx: 92, cy: 458, r: 3.2 },
  { cx: 116, cy: 458, r: 3.2 },
  { cx: 188, cy: 370, r: 3 },
  { cx: 202, cy: 370, r: 3 }
];

export const SPACE_SMILES = [
  { d: 'M 96 468 C 101 472 108 472 113 467' },
  { d: 'M 188 382 C 193 386 200 386 204 381' }
];
