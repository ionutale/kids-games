/**
 * Robot — original coloring-page line art for the Paint studio.
 *
 * 390x844 portrait sheet: a workshop with a big friendly robot, a workbench,
 * gears and a window. The robot stays above y=620, clear of the dock.
 */
export const ROBOT_VIEWBOX = { width: 390, height: 844 };

export const ROBOT_REGIONS = [
  { id: 'wall', d: 'M 0 0 H 390 V 844 H 0 Z' },
  { id: 'floor', d: 'M 0 640 H 390 V 844 H 0 Z' },
  { id: 'window', d: 'M 40 80 H 170 V 240 H 40 Z' },
  {
    id: 'gear',
    d: 'M 300 220 A 38 38 0 1 0 376 220 A 38 38 0 1 0 300 220 Z M 52 250 A 27 27 0 1 0 106 250 A 27 27 0 1 0 52 250 Z'
  },
  {
    id: 'antenna',
    d: 'M 195 250 H 215 V 280 H 195 Z M 180 190 A 20 20 0 1 0 220 190 A 20 20 0 1 0 180 190 Z'
  },
  {
    id: 'robot-head',
    d: 'M 145 280 H 265 V 380 H 145 Z'
  },
  {
    id: 'arms',
    d: 'M 100 400 H 130 V 520 H 100 Z M 280 400 H 310 V 520 H 280 Z'
  },
  {
    id: 'robot-body',
    d: 'M 130 380 H 280 V 620 H 130 Z'
  },
  {
    id: 'screen',
    d: 'M 155 410 H 255 V 500 H 155 Z'
  },
  {
    id: 'workbench',
    d: 'M 30 540 H 120 V 620 H 30 Z'
  },
  {
    id: 'lamp',
    d: 'M 320 320 H 360 V 360 H 320 Z M 335 360 H 345 V 420 H 335 Z'
  }
];

export const ROBOT_LINES = [
  // Window frame and sky.
  { d: 'M 105 80 V 240' },
  { d: 'M 40 160 H 170' },
  { d: 'M 60 110 C 70 100 84 102 92 112' },
  // Gear teeth.
  { d: 'M 338 182 V 168 M 338 272 V 258 M 300 220 H 286 M 390 220 H 376' },
  { d: 'M 79 223 V 213 M 79 287 V 277 M 52 250 H 42 M 116 250 H 106' },
  // Antenna and head.
  { d: 'M 205 250 V 280' },
  { d: 'M 165 310 H 245' },
  { d: 'M 165 345 H 245' },
  // Robot body panel and bolts.
  { d: 'M 150 530 H 260 V 600 H 150 Z' },
  { d: 'M 145 395 H 155' },
  { d: 'M 255 395 H 265' },
  { d: 'M 145 605 H 155' },
  { d: 'M 255 605 H 265' },
  // Arms joints.
  { d: 'M 100 450 H 130' },
  { d: 'M 280 450 H 310' },
  // Screen buttons.
  { d: 'M 170 470 H 190' },
  { d: 'M 200 470 H 220' },
  { d: 'M 230 470 H 250' },
  // Workbench tools.
  { d: 'M 45 580 H 105' },
  { d: 'M 60 560 L 80 580 L 70 590' },
  { d: 'M 90 555 V 590' },
  // Lamp light.
  { d: 'M 335 380 L 320 420' },
  { d: 'M 345 380 L 360 420' },
  // Floor tiles.
  { d: 'M 0 700 H 390' },
  { d: 'M 80 700 V 844' },
  { d: 'M 200 700 V 844' },
  { d: 'M 310 700 V 844' }
];

export const ROBOT_DOTS = [
  { cx: 180, cy: 330, r: 5 },
  { cx: 230, cy: 330, r: 5 },
  { cx: 205, cy: 355, r: 3 }
];

export const ROBOT_SMILES = [
  { d: 'M 185 350 C 195 360 215 360 225 350' }
];
