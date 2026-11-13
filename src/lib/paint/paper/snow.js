/**
 * Snow — original coloring-page line art for the Paint studio.
 *
 * 390x844 portrait sheet. House, pines, snowman and sled occupy separate
 * columns; every character stays above y=620.
 */
export const SNOW_VIEWBOX = { width: 390, height: 844 };

export const SNOW_REGIONS = [
  { id: 'sky', d: 'M 0 0 H 390 V 610 H 0 Z' },
  { id: 'moon', d: 'M 310 58 A 42 42 0 1 0 310 142 A 42 42 0 1 0 310 58 Z' },
  { id: 'snow', d: 'M 0 610 H 390 V 844 H 0 Z' },
  { id: 'house', d: 'M 20 420 H 140 V 610 H 20 Z' },
  { id: 'roof', d: 'M 5 430 L 80 350 L 155 430 Z' },
  { id: 'door', d: 'M 60 520 H 100 V 610 H 60 Z' },
  {
    id: 'snowman',
    d: 'M 225 430 C 225 410 245 400 265 400 C 285 400 305 410 305 430 C 305 450 285 460 265 460 C 245 460 225 450 225 430 Z M 235 460 C 235 435 250 425 265 425 C 280 425 295 435 295 460 C 295 490 280 505 265 505 C 250 505 235 490 235 460 Z M 243 505 C 243 480 253 470 265 470 C 277 470 287 480 287 505 C 287 540 277 560 265 560 C 253 560 243 540 243 505 Z'
  },
  {
    id: 'pines',
    d: 'M 160 470 L 185 400 L 210 470 Z M 158 500 L 185 430 L 212 500 Z M 310 430 L 330 380 L 350 430 Z'
  },
  {
    id: 'sled',
    d: 'M 315 560 C 315 540 335 530 355 535 L 380 560 L 380 590 H 325 C 317 582 313 570 315 560 Z'
  },
  {
    id: 'snowflakes',
    d: 'M 60 250 L 66 266 L 82 272 L 66 278 L 60 294 L 54 278 L 38 272 L 54 266 Z M 320 200 L 326 216 L 342 222 L 326 228 L 320 244 L 314 228 L 298 222 L 314 216 Z M 35 420 L 40 433 L 53 438 L 40 443 L 35 456 L 30 443 L 17 438 L 30 433 Z'
  }
];

export const SNOW_LINES = [
  // Moon craters.
  { d: 'M 292 88 C 298 82 308 84 310 92 C 304 98 294 96 292 88 Z' },
  { d: 'M 322 112 C 327 108 335 109 337 116 C 332 121 324 120 322 112 Z' },
  // House planks, window and chimney.
  { d: 'M 35 470 H 125' },
  { d: 'M 35 510 H 60' },
  { d: 'M 110 470 H 125' },
  { d: 'M 35 560 H 60' },
  { d: 'M 105 470 H 130 V 510 H 105 Z' },
  { d: 'M 115 350 V 390' },
  // Roof snow and door.
  { d: 'M 20 420 C 40 410 60 416 75 405 C 95 392 120 404 140 420' },
  { d: 'M 60 555 H 100' },
  // Snowman face, scarf and buttons.
  { d: 'M 253 435 C 259 440 269 440 275 435' },
  { d: 'M 243 470 C 257 480 275 480 289 470' },
  { d: 'M 265 490 V 500' },
  { d: 'M 265 520 V 530' },
  // Sled runners.
  { d: 'M 317 585 H 378' },
  { d: 'M 335 555 L 355 585' },
  // Pine trunks.
  { d: 'M 185 500 V 530' },
  { d: 'M 330 430 V 460' },
  // Snow drifts.
  { d: 'M 20 700 C 70 688 120 692 170 704' },
  { d: 'M 230 760 C 280 748 330 750 380 762' }
];

export const SNOW_DOTS = [
  { cx: 255, cy: 430, r: 3 },
  { cx: 275, cy: 430, r: 3 },
  { cx: 265, cy: 500, r: 2.8 },
  { cx: 265, cy: 530, r: 2.8 }
];

export const SNOW_SMILES = [
  { d: 'M 255 444 C 260 448 270 448 275 443' }
];
