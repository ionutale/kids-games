/**
 * Farm — original coloring-page line art for the Paint studio.
 *
 * 390x844 portrait sheet. The barn, sheep and cow occupy separate columns so
 * no background curve cuts through them; every animal stays above y=620.
 */
export const FARM_VIEWBOX = { width: 390, height: 844 };

export const FARM_REGIONS = [
  { id: 'sky', d: 'M 0 0 H 390 V 620 H 0 Z' },
  { id: 'sun', d: 'M 318 66 A 44 44 0 1 0 318 154 A 44 44 0 1 0 318 66 Z' },
  { id: 'field', d: 'M 0 620 H 390 V 844 H 0 Z' },
  { id: 'barn', d: 'M 30 360 H 170 V 610 H 30 Z' },
  { id: 'roof', d: 'M 10 370 L 100 270 L 190 370 Z' },
  { id: 'door', d: 'M 85 500 H 125 V 610 H 85 Z' },
  {
    id: 'sheep',
    d: 'M 175 520 C 175 495 200 485 218 492 C 230 470 265 472 275 495 C 292 500 295 530 278 545 L 278 595 H 260 V 570 H 210 V 595 H 192 V 555 C 178 550 171 540 175 520 Z'
  },
  {
    id: 'cow',
    d: 'M 290 480 C 290 450 320 440 340 450 C 365 460 375 490 370 520 L 370 590 H 350 V 560 H 315 V 590 H 295 V 550 C 288 540 286 510 290 480 Z M 340 470 C 340 445 360 435 378 445 C 390 452 390 475 378 482 C 360 492 340 485 340 470 Z'
  },
  { id: 'path', d: 'M 80 620 L 62 844 H 138 L 120 620 Z' }
];

export const FARM_LINES = [
  // Barn roof, door and planks.
  { d: 'M 30 370 L 100 285 L 170 370' },
  { d: 'M 105 500 V 610' },
  { d: 'M 85 540 H 125' },
  { d: 'M 40 400 H 160' },
  { d: 'M 40 450 H 160' },
  { d: 'M 40 480 H 160' },
  // Sheep wool.
  { d: 'M 190 525 C 200 515 215 518 217 530' },
  { d: 'M 225 505 C 237 498 250 504 251 516' },
  { d: 'M 240 555 C 250 548 263 552 265 564' },
  // Cow patches.
  { d: 'M 305 490 C 320 482 335 490 337 505 C 323 512 307 506 305 490 Z' },
  { d: 'M 325 545 C 337 538 351 544 353 556 C 341 564 327 558 325 545 Z' },
  // Cow muzzle.
  { d: 'M 352 466 C 358 470 366 470 372 466' },
  // Path stones.
  { d: 'M 88 680 C 96 674 108 676 112 684' },
  { d: 'M 76 750 C 84 744 96 746 100 754' },
  { d: 'M 92 810 C 100 804 112 806 116 814' },
  // Grass.
  { d: 'M 20 700 C 30 680 40 690 38 710' },
  { d: 'M 350 730 C 362 710 372 720 370 740' },
  { d: 'M 200 780 C 210 760 220 770 218 790' }
];

export const FARM_DOTS = [
  { cx: 358, cy: 458, r: 3.2 },
  { cx: 374, cy: 458, r: 3.2 },
  { cx: 200, cy: 530, r: 3 },
  { cx: 230, cy: 530, r: 3 }
];

export const FARM_SMILES = [
  { d: 'M 356 470 C 362 475 370 475 376 469' },
  { d: 'M 205 540 C 211 544 219 544 225 539' }
];
