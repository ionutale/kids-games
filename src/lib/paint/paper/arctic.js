/**
 * Arctic — original coloring-page line art for the Paint studio.
 *
 * 390x844 portrait sheet. The animals stand on a flat ice shelf so no mountain
 * silhouette cuts through them; all characters stay above y=620.
 */
export const ARCTIC_VIEWBOX = { width: 390, height: 844 };

export const ARCTIC_REGIONS = [
  { id: 'sky', d: 'M 0 0 H 390 V 610 H 0 Z' },
  {
    id: 'aurora',
    d: 'M 0 80 C 70 30 140 120 210 70 C 280 20 330 110 390 60 V 200 C 320 240 280 160 210 210 C 140 260 70 170 0 220 Z'
  },
  { id: 'ice-shelf', d: 'M 0 610 H 390 V 646 H 0 Z' },
  { id: 'snow', d: 'M 0 640 H 390 V 844 H 0 Z' },
  {
    id: 'polar-bear',
    d: 'M 225 470 C 225 440 260 425 290 435 C 320 445 330 470 325 500 L 325 605 H 300 V 565 H 255 V 605 H 235 V 535 C 225 525 220 495 225 470 Z M 305 445 A 32 32 0 1 0 369 445 A 32 32 0 1 0 305 445 Z'
  },
  {
    id: 'penguin',
    d: 'M 75 470 C 75 440 105 425 130 435 C 155 445 160 475 155 505 L 155 605 H 135 V 575 H 100 V 605 H 80 V 520 C 72 505 70 485 75 470 Z'
  },
  {
    id: 'seal',
    d: 'M 160 550 C 160 525 190 515 215 525 C 240 535 245 560 235 580 C 225 600 185 605 170 590 Z'
  },
  {
    id: 'fish',
    d: 'M 340 540 C 350 525 370 525 380 540 C 390 555 370 565 355 560 L 340 570 L 345 555 Z'
  },
  {
    id: 'snowflakes',
    d: 'M 60 250 L 66 266 L 82 272 L 66 278 L 60 294 L 54 278 L 38 272 L 54 266 Z M 320 290 L 326 306 L 342 312 L 326 318 L 320 334 L 314 318 L 298 312 L 314 306 Z M 35 420 L 40 433 L 53 438 L 40 443 L 35 456 L 30 443 L 17 438 L 30 433 Z'
  }
];

export const ARCTIC_LINES = [
  // Aurora streaks.
  { d: 'M 20 110 C 90 70 140 150 210 100 C 280 50 330 130 380 90' },
  { d: 'M 30 160 C 100 120 150 200 220 150 C 290 100 340 180 385 140' },
  // Bear face, paws and back.
  { d: 'M 332 460 C 338 466 344 466 350 460' },
  { d: 'M 240 585 C 250 578 262 580 268 588' },
  { d: 'M 270 445 C 280 430 300 426 315 434' },
  // Penguin belly, wing and beak.
  { d: 'M 92 480 C 104 470 120 474 128 488 L 128 575 H 100' },
  { d: 'M 150 500 C 160 512 158 532 148 544' },
  { d: 'M 136 458 L 150 464 L 136 470' },
  // Seal whiskers and flipper.
  { d: 'M 225 550 C 234 546 243 548 247 554' },
  { d: 'M 180 560 C 190 552 200 552 208 558' },
  // Fish fin.
  { d: 'M 362 536 C 368 530 376 530 380 536' },
  // Ice-shelf cracks and snow drifts.
  { d: 'M 40 626 L 80 620 L 110 628' },
  { d: 'M 250 624 L 290 630 L 330 622' },
  { d: 'M 20 700 C 70 688 120 692 170 704' },
  { d: 'M 230 760 C 280 748 330 750 380 762' },
  // Snowflake arms.
  { d: 'M 60 250 V 294' },
  { d: 'M 38 272 H 82' },
  { d: 'M 320 290 V 334' },
  { d: 'M 298 312 H 342' }
];

export const ARCTIC_DOTS = [
  { cx: 330, cy: 450, r: 3.2 },
  { cx: 350, cy: 450, r: 3.2 },
  { cx: 112, cy: 462, r: 3 },
  { cx: 130, cy: 462, r: 3 },
  { cx: 200, cy: 542, r: 3 },
  { cx: 362, cy: 540, r: 2.6 }
];

export const ARCTIC_SMILES = [
  { d: 'M 332 466 C 338 470 346 470 351 465' },
  { d: 'M 198 552 C 204 556 210 556 215 551' }
];
