/**
 * 20 hand-crafted level definitions — 4 tiers × 5 levels.
 * World space: 900×620, ground surface at y=580, slingshot at x≈150.
 *
 * Shapes: cubes (46×46), horizontal planks (92×23), vertical columns (23×92).
 * Thin shapes get thickness-scaled HP: hpScale = min(w,h)/46 (planks/columns
 * are ~half as tough as a cube of the same material — thin breaks easy).
 *
 * Tier rules:
 *  T1 (1–5):  wood only, gentle shelters, 1–2 targets
 *  T2 (6–10): ice joins the palette
 *  T3 (11–15): stone appears, tough targets, exactly one TNT crate
 *  T4 (16–20): multi-tower compounds, patrolling blocks, two TNT crates,
 *              shielded boss crowns the keep on 18–20
 */

export const WORLD_W = 900;
export const WORLD_H = 620;
export const GROUND_Y = 580;
export const SLING = { x: 150, y: 500 };

/** All helpers take (x, restY): x is the center, restY the surface it stands on. */
function cube(x, restY, type) {
  return { x, y: restY - 23, w: 46, h: 46, type };
}
function plank(x, restY, type) {
  return { x, y: restY - 11.5, w: 92, h: 23, type };
}
function col(x, restY, type) {
  return { x, y: restY - 46, w: 23, h: 92, type };
}
function tntAt(x, restY) {
  return { x, y: restY - 23, w: 46, h: 46, type: 'tnt' };
}
function patrolAt(x, type, amp, speed, phase) {
  return { x, y: GROUND_Y - 23, w: 46, h: 46, type, patrol: { amp, speed, phase } };
}
function target(x, restY, type) {
  return { x, y: restY - 24, type };
}

function tierOf(n) {
  return Math.min(4, Math.floor((n - 1) / 5) + 1);
}

const G = GROUND_Y;

function buildLevel(n) {
  const tier = tierOf(n);
  const ammo = tier === 4 ? 3 : tier >= 2 ? 2 : n === 1 ? 1 : 2;
  const blocks = [];
  const targets = [];

  if (n === 1) {
    // Little house: plank roof on two columns, target sheltered inside.
    blocks.push(col(610, G, 'wood'), col(676, G, 'wood'), plank(643, 488, 'wood'));
    targets.push(target(643, G, 'targetBasic'));
  } else if (n === 2) {
    // Pyramid: three-two-one cube steps, target balanced on the apex.
    blocks.push(
      cube(565, G, 'wood'), cube(611, G, 'wood'), cube(657, G, 'wood'),
      cube(588, 534, 'wood'), cube(634, 534, 'wood'),
      cube(611, 488, 'wood')
    );
    targets.push(target(611, 442, 'targetBasic'));
  } else if (n === 3) {
    // The bridge: two capped pillars, target in the open between them.
    blocks.push(
      cube(520, G, 'wood'), cube(520, 534, 'wood'), plank(520, 488, 'wood'),
      cube(720, G, 'wood'), cube(720, 534, 'wood'), plank(720, 488, 'wood')
    );
    targets.push(target(620, G, 'targetBasic'));
  } else if (n === 4) {
    // Two-storey house: collapse either floor onto the tenant below.
    blocks.push(
      col(590, G, 'wood'), col(680, G, 'wood'), plank(635, 488, 'wood'),
      col(612, 465, 'wood'), col(658, 465, 'wood'), plank(635, 373, 'wood')
    );
    targets.push(target(635, G, 'targetBasic'));
  } else if (n === 5) {
    // Tower + hut: a tall stack and a wide hut next door.
    blocks.push(
      cube(560, G, 'wood'), cube(560, 534, 'wood'), cube(560, 488, 'wood'), cube(560, 442, 'wood'),
      col(695, G, 'wood'), col(765, G, 'wood'), plank(730, 488, 'wood')
    );
    targets.push(target(560, 396, 'targetBasic'), target(730, G, 'targetBasic'));
  } else if (n === 6) {
    // Wood vs ice: classic tower beside an icy hut.
    blocks.push(
      cube(480, G, 'wood'), cube(480, 534, 'wood'), cube(480, 488, 'wood'),
      col(700, G, 'ice'), col(770, G, 'ice'), plank(735, 488, 'ice')
    );
    targets.push(target(480, 442, 'targetBasic'), target(735, G, 'targetBasic'));
  } else if (n === 7) {
    // Ice shield: jagged ice wall up front, wooden tower and its target behind.
    blocks.push(
      cube(460, G, 'ice'), col(506, G, 'ice'), cube(552, G, 'ice'), col(598, G, 'ice'), cube(644, G, 'ice'),
      cube(780, G, 'wood'), cube(780, 534, 'wood'), cube(780, 488, 'wood')
    );
    targets.push(target(690, G, 'targetBasic'), target(780, 442, 'targetBasic'));
  } else if (n === 8) {
    // Ice pavilion: three column legs with capped heads carrying a twin-plank roof.
    blocks.push(
      col(560, G, 'ice'), col(660, G, 'ice'), col(760, G, 'ice'),
      cube(560, 488, 'ice'), cube(660, 488, 'ice'), cube(760, 488, 'ice'),
      plank(610, 442, 'ice'), plank(710, 442, 'ice')
    );
    targets.push(target(610, G, 'targetBasic'), target(660, 419, 'targetBasic'));
  } else if (n === 9) {
    // Mixed duplex: wooden ground floor, icy penthouse.
    blocks.push(
      col(590, G, 'wood'), col(680, G, 'wood'), plank(635, 488, 'wood'),
      col(612, 465, 'ice'), col(658, 465, 'ice'), plank(635, 373, 'ice')
    );
    targets.push(target(635, G, 'targetBasic'), target(635, 350, 'targetBasic'));
  } else if (n === 10) {
    // The wall: uneven ice barricade shielding a ground target; tower behind.
    blocks.push(
      cube(460, G, 'ice'), col(506, G, 'ice'), cube(552, G, 'ice'), col(598, G, 'ice'), cube(644, G, 'ice'),
      cube(780, G, 'wood'), cube(780, 534, 'wood'), cube(780, 488, 'wood')
    );
    targets.push(target(690, G, 'targetBasic'), target(780, 442, 'targetBasic'));
  } else if (n === 11) {
    // Bunker run: stone bunker left, TNT mid-field, tall wood tower right.
    // The tower stands close enough to the flight corridor that a mid-air
    // fire-bird detonation always catches something in its blast.
    blocks.push(
      col(480, G, 'stone'), col(560, G, 'stone'), plank(520, 488, 'stone'),
      col(520, 465, 'ice'), // fragile spire on the bunker lid — aerial blasts shatter it
      tntAt(640, G),
      cube(700, G, 'wood'), cube(700, 534, 'wood'), cube(700, 488, 'wood'), cube(700, 442, 'wood')
    );
    targets.push(target(520, G, 'targetBasic'), target(700, 396, 'targetTough'));
  } else if (n === 12) {
    // Stone table: a slab roof on stone legs; tough crumbs underneath and on top.
    blocks.push(
      col(560, G, 'stone'), col(640, G, 'stone'), plank(600, 488, 'stone'),
      tntAt(700, G)
    );
    targets.push(target(600, G, 'targetTough'), target(600, 465, 'targetTough'));
  } else if (n === 13) {
    // Gate crasher: stone gate, wood attic, TNT stacked on top like a cherry.
    blocks.push(
      col(560, G, 'stone'), col(640, G, 'stone'), plank(600, 488, 'stone'),
      cube(600, 465, 'wood'), tntAt(600, 419),
      cube(760, G, 'wood'), cube(760, 534, 'wood'), cube(760, 488, 'wood')
    );
    targets.push(target(600, G, 'targetTough'), target(760, 442, 'targetTough'));
  } else if (n === 14) {
    // Stone base tower: stone shoes, wood legs, tough hat.
    blocks.push(
      cube(577, G, 'stone'), cube(623, G, 'stone'),
      cube(600, 534, 'wood'), cube(600, 488, 'wood'), cube(600, 442, 'wood'),
      tntAt(700, G)
    );
    targets.push(target(480, G, 'targetBasic'), target(600, 396, 'targetTough'));
  } else if (n === 15) {
    // Fortress: outer stone walls, wooden keep inside, TNT keystone.
    blocks.push(
      col(460, G, 'stone'), col(760, G, 'stone'), plank(460, 488, 'stone'), plank(760, 488, 'stone'),
      col(580, G, 'wood'), col(660, G, 'wood'), plank(620, 488, 'wood'),
      tntAt(620, 465)
    );
    targets.push(target(620, G, 'targetTough'), target(710, G, 'targetTough'));
  } else if (n === 16) {
    // Patrol corridor: three towers guarded by a gliding block and twin TNT.
    blocks.push(
      cube(520, G, 'stone'), cube(520, 534, 'stone'), cube(520, 488, 'stone'), cube(520, 442, 'stone'),
      col(715, G, 'wood'), col(805, G, 'wood'), plank(760, 488, 'wood'),
      cube(850, G, 'ice'), cube(850, 534, 'ice'), cube(850, 488, 'ice'),
      tntAt(620, G), tntAt(672, G),
      patrolAt(400, 'wood', 35, 2, 0.9)
    );
    targets.push(target(520, 396, 'targetTough'), target(760, G, 'targetTough'), target(850, 442, 'targetBasic'));
  } else if (n === 17) {
    // Bridges: stone mesa with a wooden deck stacked on top, towers flanking.
    blocks.push(
      cube(550, G, 'stone'), cube(650, G, 'stone'), plank(600, 534, 'stone'),
      col(577, 511, 'wood'), col(623, 511, 'wood'), plank(600, 419, 'wood'),
      cube(420, G, 'ice'), cube(420, 534, 'ice'),
      cube(780, G, 'wood'), cube(780, 534, 'wood'), cube(780, 488, 'wood'),
      tntAt(600, G), tntAt(480, G),
      patrolAt(320, 'wood', 35, 2, 1.4)
    );
    targets.push(target(420, 488, 'targetBasic'), target(600, 396, 'targetTough'), target(780, 442, 'targetTough'));
  } else if (n === 18) {
    // Boss keep: two-storey wooden keep, the 👿 crowned on its roof.
    blocks.push(
      col(600, G, 'wood'), col(700, G, 'wood'), plank(650, 488, 'wood'),
      col(627, 465, 'wood'), col(673, 465, 'wood'), plank(650, 373, 'wood'),
      cube(450, G, 'stone'), cube(450, 534, 'stone'), cube(450, 488, 'stone'),
      cube(850, G, 'ice'), cube(850, 534, 'ice'),
      tntAt(560, G), tntAt(760, G),
      patrolAt(340, 'wood', 30, 2, 2.1)
    );
    targets.push(target(450, 442, 'targetTough'), target(650, 350, 'targetBoss'), target(850, 488, 'targetBasic'));
  } else if (n === 19) {
    // Twin gliders: boss castle center, two patrol blocks sweeping the field.
    blocks.push(
      cube(620, G, 'stone'), cube(668, G, 'stone'),
      col(621, 534, 'wood'), col(667, 534, 'wood'), plank(644, 442, 'stone'),
      cube(450, G, 'wood'), cube(450, 534, 'wood'), cube(450, 488, 'wood'),
      col(795, G, 'ice'), col(865, G, 'ice'), plank(830, 488, 'ice'),
      tntAt(540, G), tntAt(740, G),
      patrolAt(280, 'wood', 30, 2, 0.7),
      patrolAt(380, 'ice', 16, 2.4, 1.9)
    );
    targets.push(target(450, 442, 'targetTough'), target(644, 419, 'targetBoss'), target(830, G, 'targetBasic'));
  } else {
    // Grand finale: spire, grand two-material keep, hut, gliders and TNT everywhere.
    blocks.push(
      cube(400, G, 'stone'), cube(400, 534, 'stone'), cube(400, 488, 'stone'),
      col(600, G, 'stone'), col(680, G, 'stone'), plank(640, 488, 'stone'),
      col(623, 465, 'wood'), col(657, 465, 'wood'), plank(640, 373, 'wood'),
      col(800, G, 'wood'), col(865, G, 'wood'), plank(832.5, 488, 'wood'),
      tntAt(555, G), tntAt(740, G),
      patrolAt(300, 'wood', 26, 2, 0.9),
      patrolAt(478, 'ice', 14, 2.4, 1.7)
    );
    targets.push(target(400, 442, 'targetTough'), target(640, 350, 'targetBoss'), target(832.5, G, 'targetBasic'));
  }

  // thin shapes are flimsier — scale HP by thickness relative to a 46 cube
  for (const b of blocks) b.hpScale = Math.min(b.w, b.h) / 46;

  return { level: n, tier, ammo, blocks, targets };
}

export const LEVELS = Array.from({ length: 20 }, (_, i) => buildLevel(i + 1));

export function getLevel(n) {
  return LEVELS[Math.max(0, Math.min(19, n - 1))];
}
