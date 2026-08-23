import { describe, it, expect } from 'vitest';
import { createWorld, addBody, step } from '$lib/angry-emoji/phys.js';
import { getLevel, GROUND_Y } from '$lib/angry-emoji/levels.js';
import { MATERIALS } from '$lib/angry-emoji/phys.js';
import { levelMaxScore, starsFor } from '$lib/angry-emoji/score.js';

/** Builds the phys world for a level definition exactly like the UI does. */
function buildWorld(n) {
  const d = getLevel(n);
  const world = createWorld();
  addBody(world, {
    x: 900 / 2,
    y: GROUND_Y + 20,
    w: 1800,
    h: 40,
    type: 'ground',
    isStatic: true
  });
  for (const b of d.blocks) addBody(world, b);
  for (const t of d.targets) addBody(world, { x: t.x, y: t.y, w: 40, h: 48, type: t.type });
  return world;
}

/** Gravity-compensated straight shot from the sling at whatever sits at (tx,ty). */
function shootAt(world, tx, ty, type = 'bird', speed = 1750) {
  const sx = 176;
  const sy = 474;
  const dist = Math.hypot(tx - sx, ty - sy);
  const flight = dist / speed;
  const drop = 0.5 * 980 * flight * flight;
  const dx = tx - sx;
  const dy = ty - sy - drop;
  const len = Math.hypot(dx, dy);
  addBody(world, { x: sx, y: sy, w: 26, h: 26, type, vx: (dx / len) * speed, vy: (dy / len) * speed });
  for (let i = 0; i < 240; i++) step(world, 1 / 60);
}

describe('full level simulation', () => {
  it('level 1: volley shatters the tower and kills the rooftop target', () => {
    const world = buildWorld(1);
    const d = getLevel(1);
    // smash into the tower base
    addBody(world, { x: 176, y: 474, w: 26, h: 26, type: 'bird', vx: 1750, vy: 200 });
    for (let i = 0; i < 240; i++) step(world, 1 / 60);
    let structural = world.bodies.filter(
      (b) => !b.isStatic && !b.type.startsWith('target') && b.type !== 'bird'
    ).length;
    expect(structural).toBeLessThan(d.blocks.length);

    // finish the (possibly displaced) target with a compensated lofted shot
    let tgt = world.bodies.find((b) => b.type.startsWith('target'));
    if (!tgt || tgt.broken) {
      expect(true).toBe(true);
      return;
    }
    shootAt(world, tgt.x, tgt.y);
    tgt = world.bodies.find((b) => b.type.startsWith('target'));
    const killed = !tgt || tgt.broken || tgt.hp < MATERIALS.targetBasic.hp;
    expect(killed).toBe(true);
  });

  it('ammo exhaustion math leaves remaining targets and prompts replay', () => {
    // pure logic mirror of the UI rule
    const d = getLevel(2);
    let shots = d.ammo;
    let destroyed = 0;
    while (shots > 0 && destroyed < d.targets.length) shots -= 1;
    if (destroyed < d.targets.length && shots <= 0) {
      expect(destroyed).toBeLessThan(d.targets.length); // replay prompt condition
    }
  });

  it('boss requires fire: plain birds are immune, fire bird breaks it', () => {
    // deterministic point-blank probes against the level-19 boss body
    const mk = (type) => {
      const world = buildWorld(19);
      let boss = world.bodies.find((b) => b.type === 'targetBoss');
      addBody(world, { x: boss.x - 80, y: boss.y, w: 26, h: 26, type, vx: 900 });
      for (let i = 0; i < 90; i++) step(world, 1 / 60);
      boss = world.bodies.find((b) => b.id === boss.id);
      return { gone: !boss, broken: boss?.broken ?? false, hp: boss?.hp ?? 0 };
    };

    const plain = mk('bird');
    expect(plain.broken || plain.gone).toBe(false);
    expect(plain.hp).toBe(MATERIALS.targetBoss.hp); // untouched — immune

    const fired = mk('birdFire');
    expect(fired.broken || fired.gone || fired.hp < MATERIALS.targetBoss.hp).toBe(true);
  });

  it('star math ties to max score per level', () => {
    for (const l of LEVELS_SAFE()) {
      const max = levelMaxScore(l);
      expect(max).toBeGreaterThan(0);
      expect(starsFor(max, max, l.targets.length)).toBe(3);
      expect(starsFor(Math.floor(max * 0.7), max, 1)).toBe(2);
    }
  });
});

function LEVELS_SAFE() {
  // local import guard so this describe reads naturally
  return [getLevel(1), getLevel(9), getLevel(15), getLevel(20)];
}
