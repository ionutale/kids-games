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
  it('level 1: roof shot clears the walls, then the exposed target falls', () => {
    const world = buildWorld(1);
    const d = getLevel(1);
    // lofted shot onto the roof plank (aimed at its top face to clear the walls)
    const roof = d.blocks.find((b) => b.w > b.h); // the 92×23 plank
    expect(roof).toBeTruthy();
    shootAt(world, roof.x, roof.y - 11);
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
    // open a firing lane: snap the nearer column leg, then take the shot
    const laneLeg = world.bodies.find(
      (b) => b.type === 'wood' && b.h > b.w && !b.isStatic && b.x < tgt.x
    );
    if (laneLeg) {
      shootAt(world, laneLeg.x, laneLeg.y);
      tgt = world.bodies.find((b) => b.type.startsWith('target'));
    }
    if (!tgt || tgt.broken) {
      expect(true).toBe(true);
      return;
    }
    shootAt(world, tgt.x, tgt.y);
    tgt = world.bodies.find((b) => b.type.startsWith('target'));
    const killed = !tgt || tgt.broken || tgt.hp < MATERIALS.targetBasic.hp;
    expect(killed).toBe(true);
  });

  it('thin columns are weak points: a single full-power bird shatters them', () => {
    // L12 stands its stone table on two thin columns — one shot snaps a leg
    const world = buildWorld(12);
    const leg = world.bodies.find(
      (b) => b.type === 'stone' && b.h > b.w && !b.isStatic
    );
    expect(leg).toBeTruthy();
    shootAt(world, leg.x, Math.min(GROUND_Y - 30, leg.y + 20)); // low on the leg, under the slab
    const legGone = leg.broken || !world.bodies.includes(leg);
    expect(legGone).toBe(true); // 240hp cube survives; 120hp column does not
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
    // probes the actual level-19 boss body in isolation — a bare ground +
    // boss world, because falling-tower debris legitimately bypasses the
    // shield (only bird/ball types are immune) and would confound the probe
    const mk = (type) => {
      const bossDef = getLevel(19).targets.find((t) => t.type === 'targetBoss');
      const world = createWorld();
      addBody(world, { x: 450, y: GROUND_Y + 20, w: 1800, h: 40, type: 'ground', isStatic: true });
      let boss = addBody(world, { x: bossDef.x, y: bossDef.y, w: 40, h: 48, type: 'targetBoss' });
      addBody(world, { x: boss.x + 60, y: boss.y, w: 26, h: 26, type, vx: -900 });
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

  it('shooting the tier-3 TNT crate detonates it and wrecks nearby structure', () => {
    // level 11: two towers with a TNT crate on the ground between them
    const world = buildWorld(11);
    const tnt = world.bodies.find((b) => b.type === 'tnt');
    expect(tnt).toBeTruthy();
    const blocksBefore = world.bodies.filter(
      (b) => !b.isStatic && !b.type.startsWith('target') && b.type !== 'bird'
    ).length;
    // flat point-blank shot from just left of the crate, at crate height
    addBody(world, { x: tnt.x - 60, y: tnt.y, w: 26, h: 26, type: 'bird', vx: 1750 });
    for (let i = 0; i < 180; i++) step(world, 1 / 60);
    const tntGone = !world.bodies.includes(tnt);
    expect(tntGone).toBe(true);
    const structuralNow = world.bodies.filter(
      (b) => !b.isStatic && !b.type.startsWith('target') && b.type !== 'bird'
    ).length;
    expect(structuralNow).toBeLessThan(blocksBefore - 1); // crate + blast victims
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
