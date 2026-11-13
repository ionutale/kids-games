/**
 * Vehicles — original coloring-page line art for the Paint studio.
 *
 * 390x844 portrait sheet. The bus, truck and car sit in separate rows and
 * columns; every vehicle stays above y=620.
 */
export const VEHICLES_VIEWBOX = { width: 390, height: 844 };

export const VEHICLES_REGIONS = [
  { id: 'sky', d: 'M 0 0 H 390 V 560 H 0 Z' },
  { id: 'sun', d: 'M 330 52 A 38 38 0 1 0 330 128 A 38 38 0 1 0 330 52 Z' },
  {
    id: 'clouds',
    d: 'M 40 110 C 40 92 58 82 76 90 C 88 70 118 74 126 96 C 148 96 158 118 146 132 H 40 C 28 124 30 114 40 110 Z'
  },
  { id: 'grass', d: 'M 0 540 H 390 V 620 H 0 Z' },
  { id: 'road', d: 'M 0 600 H 390 V 844 H 0 Z' },
  {
    id: 'truck',
    d: 'M 225 340 C 225 320 240 310 260 310 H 330 C 350 310 365 320 365 340 V 450 H 225 Z'
  },
  {
    id: 'bus',
    d: 'M 30 380 C 30 360 45 350 65 350 H 185 C 205 350 220 360 220 380 V 600 H 30 Z'
  },
  {
    id: 'car',
    d: 'M 235 480 C 235 460 250 450 270 450 H 330 C 350 450 365 460 365 480 V 600 H 235 Z'
  },
  {
    id: 'crosswalk',
    d: 'M 40 690 H 90 V 712 H 40 Z M 110 690 H 160 V 712 H 110 Z M 180 690 H 230 V 712 H 180 Z M 250 690 H 300 V 712 H 250 Z M 320 690 H 370 V 712 H 320 Z'
  }
];

export const VEHICLES_LINES = [
  // Bus windows, door and wheels.
  { d: 'M 45 380 H 95 V 440 H 45 Z' },
  { d: 'M 105 380 H 155 V 440 H 105 Z' },
  { d: 'M 165 380 H 205 V 440 H 165 Z' },
  { d: 'M 145 450 V 600' },
  { d: 'M 55 545 A 24 24 0 1 0 103 545 A 24 24 0 1 0 55 545 Z' },
  { d: 'M 150 545 A 24 24 0 1 0 198 545 A 24 24 0 1 0 150 545 Z' },
  // Truck cab, windows and wheels.
  { d: 'M 240 340 H 350 V 450' },
  { d: 'M 245 360 H 290 V 410 H 245 Z' },
  { d: 'M 300 360 H 350 V 410 H 300 Z' },
  { d: 'M 250 500 A 22 22 0 1 0 294 500 A 22 22 0 1 0 250 500 Z' },
  { d: 'M 310 500 A 22 22 0 1 0 354 500 A 22 22 0 1 0 310 500 Z' },
  // Car windows, door and wheels.
  { d: 'M 248 480 H 290 V 525 H 248 Z' },
  { d: 'M 304 480 H 352 V 525 H 304 Z' },
  { d: 'M 298 525 V 600' },
  { d: 'M 258 570 A 20 20 0 1 0 298 570 A 20 20 0 1 0 258 570 Z' },
  { d: 'M 316 570 A 20 20 0 1 0 356 570 A 20 20 0 1 0 316 570 Z' },
  // Road dashes and grass.
  { d: 'M 30 780 H 120' },
  { d: 'M 160 780 H 250' },
  { d: 'M 290 780 H 380' },
  { d: 'M 20 585 C 40 570 60 572 78 585' },
  { d: 'M 330 585 C 350 570 370 572 385 585' }
];

export const VEHICLES_DOTS = [
  { cx: 76, cy: 470, r: 3.2 },
  { cx: 192, cy: 470, r: 3.2 },
  { cx: 345, cy: 355, r: 3 }
];

export const VEHICLES_SMILES = [
  { d: 'M 70 505 C 78 511 90 511 98 505' }
];
