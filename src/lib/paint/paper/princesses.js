/**
 * Princesses — original coloring-page line art for the Paint studio.
 *
 * 390x844 portrait sheet. Carriage, princess and unicorn have their own
 * columns and stand on a flat 620 ground; every character stays above it.
 */
export const PRINCESSES_VIEWBOX = { width: 390, height: 844 };

export const PRINCESSES_REGIONS = [
  { id: 'sky', d: 'M 0 0 H 390 V 620 H 0 Z' },
  { id: 'sun', d: 'M 60 62 A 38 38 0 1 0 60 138 A 38 38 0 1 0 60 62 Z' },
  {
    id: 'rainbow',
    d: 'M 0 420 C 0 260 120 160 260 160 C 360 160 390 220 390 280 V 340 C 390 260 330 220 260 220 C 150 220 60 300 60 420 Z'
  },
  {
    id: 'clouds',
    d: 'M 270 120 C 270 100 288 90 306 100 C 320 80 352 86 360 110 C 380 112 388 136 374 150 H 270 C 256 142 258 128 270 120 Z'
  },
  { id: 'hill', d: 'M 0 620 H 390 V 844 H 0 Z' },
  {
    id: 'carriage',
    d: 'M 20 470 C 20 440 50 425 80 435 L 100 460 L 130 460 L 150 435 C 180 440 195 465 190 495 L 190 600 H 20 Z'
  },
  {
    id: 'princess',
    d: 'M 200 380 C 200 350 230 335 255 345 C 275 353 280 378 272 400 L 272 600 H 252 V 560 H 232 V 600 H 212 V 440 C 202 425 196 400 200 380 Z M 225 330 A 26 26 0 1 0 277 330 A 26 26 0 1 0 225 330 Z'
  },
  {
    id: 'crown',
    d: 'M 205 280 L 220 255 L 232 280 L 245 250 L 258 280 L 272 255 L 285 285 L 205 285 Z'
  },
  {
    id: 'unicorn',
    d: 'M 285 430 C 285 405 315 395 340 405 C 360 413 370 435 365 460 L 365 600 H 345 V 565 H 315 V 600 H 295 V 470 C 285 460 282 445 285 430 Z M 330 400 A 30 30 0 1 0 390 400 A 30 30 0 1 0 330 400 Z'
  },
  {
    id: 'flowers',
    d: 'M 34 590 C 34 574 48 566 60 574 C 70 580 70 596 60 602 L 60 620 H 48 V 602 C 38 600 32 596 34 590 Z M 340 590 C 340 574 354 566 366 574 C 376 580 376 596 366 602 L 366 620 H 354 V 602 C 344 600 338 596 340 590 Z'
  }
];

export const PRINCESSES_LINES = [
  // Rainbow inner arcs.
  { d: 'M 30 420 C 30 280 130 190 260 190' },
  { d: 'M 60 420 C 60 300 150 220 260 220' },
  // Carriage door and wheels.
  { d: 'M 70 470 V 540' },
  { d: 'M 95 470 H 125' },
  { d: 'M 40 545 A 24 24 0 1 0 88 545 A 24 24 0 1 0 40 545 Z' },
  { d: 'M 120 545 A 24 24 0 1 0 168 545 A 24 24 0 1 0 120 545 Z' },
  { d: 'M 40 545 L 64 545 M 64 545 L 64 521' },
  { d: 'M 120 545 L 144 545 M 144 545 L 144 521' },
  // Princess face, dress and sleeve.
  { d: 'M 235 340 C 243 334 255 334 263 340' },
  { d: 'M 227 430 C 240 418 256 420 266 434' },
  { d: 'M 240 470 C 248 500 246 540 240 580' },
  // Crown jewels.
  { d: 'M 232 268 L 245 262 L 258 268' },
  // Unicorn horn, mane and face.
  { d: 'M 352 370 L 362 340 L 370 370' },
  { d: 'M 330 410 C 320 430 318 460 326 485' },
  { d: 'M 360 452 C 366 456 370 462 368 468' },
  // Cloud bumps.
  { d: 'M 288 128 C 296 120 306 120 314 126' },
  { d: 'M 330 118 C 338 110 350 112 356 120' },
  // Flowers and grass.
  { d: 'M 46 578 C 52 582 58 582 62 577' },
  { d: 'M 352 578 C 358 582 364 582 368 577' },
  { d: 'M 280 650 C 290 630 300 640 298 660' }
];

export const PRINCESSES_DOTS = [
  { cx: 240, cy: 348, r: 3 },
  { cx: 258, cy: 348, r: 3 },
  { cx: 358, cy: 440, r: 3.2 }
];

export const PRINCESSES_SMILES = [
  { d: 'M 242 358 C 247 362 254 362 259 357' },
  { d: 'M 356 460 C 362 464 368 464 372 459' }
];
