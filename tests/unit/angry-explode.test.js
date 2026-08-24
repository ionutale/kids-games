import { describe, it, expect } from 'vitest';
import {
  createWorld,
  addBody,
  step,
  explode,
  MATERIALS,
  HEAVY_IMPACT_THRESHOLD
} from '$lib/angry-emoji/phys.js';

const GROUND = { x: 450, y: 600, w: 1800, h: 40, type: 'ground', isStatic: true };

function blastWorld() {
  const world = createWorld();
  addBody(world, GROUND);
  return world;
}

describe('TNT material', () => {
  it('exists with low HP and a display color', () => {
    expect(MATERIALS.tnt).toBeTruthy();
    expect(MATERIALS.tnt.hp).toBeLessThan(30);
    expect(typeof MATERIALS.tnt.color).toBe('string');
  });
});

describe('explode', () => {
  it('breaks weak bodies inside the radius and spares those outside', () => {
    const world = blastWorld();
    const near = addBody(world, { x: 545, y: 557, w: 46, h: 46, type: 'wood' }); // ~95px from blast
    const far = addBody(world, { x: 850, y: 557, w: 46, h: 46, type: 'wood' }); // well outside
    explode(world, { x: 450, y: 550, radius: 130, maxDamage: 320 });
    expect(near.broken).toBe(true);
    expect(far.broken).toBe(false);
    expect(far.hp).toBe(MATERIALS.wood.hp); // untouched
  });

  it('damage falls off with distance', () => {
    const world = blastWorld();
    const close = addBody(world, { x: 470, y: 400, w: 46, h: 46, type: 'stone' }); // d≈22
    const edge = addBody(world, { x: 530, y: 400, w: 46, h: 46, type: 'stone' }); // d≈82
    explode(world, { x: 450, y: 400, radius: 130, maxDamage: 320 });
    expect(close.hp).toBeLessThan(edge.hp);
  });

  it('shatters stone point-blank but not at the rim', () => {
    const world = blastWorld();
    const centerStone = addBody(world, { x: 460, y: 300, w: 46, h: 46, type: 'stone' }); // d≈11
    const rimStone = addBody(world, { x: 520, y: 340, w: 46, h: 46, type: 'stone' }); // d≈89
    explode(world, { x: 450, y: 300, radius: 130, maxDamage: 320 });
    expect(centerStone.broken).toBe(true);
    expect(rimStone.broken).toBe(false);
  });

  it('pushes dynamic bodies away from the blast center', () => {
    const world = blastWorld();
    const left = addBody(world, { x: 380, y: 500, w: 46, h: 46, type: 'wood' });
    const right = addBody(world, { x: 520, y: 500, w: 46, h: 46, type: 'wood' });
    explode(world, { x: 450, y: 500, radius: 130, maxDamage: 320 });
    expect(left.vx).toBeLessThan(0); // shoved left
    expect(right.vx).toBeGreaterThan(0); // shoved right
  });

  it('damages the shielded boss — blasts bypass bird/ball immunity', () => {
    const world = blastWorld();
    const boss = addBody(world, { x: 500, y: 500, w: 40, h: 48, type: 'targetBoss' });
    explode(world, { x: 470, y: 500, radius: 130, maxDamage: 320 });
    expect(boss.hp).toBeLessThan(MATERIALS.targetBoss.hp);
    expect(boss.broken).toBe(false); // hurt, not vaporized at this range
  });

  it('a broken TNT crate detonates automatically during step and breaks adjacent wood', () => {
    const world = blastWorld();
    const tnt = addBody(world, { x: 520, y: 557, w: 46, h: 46, type: 'tnt' });
    const wood = addBody(world, { x: 585, y: 557, w: 46, h: 46, type: 'wood' }); // adjacent
    addBody(world, { x: 150, y: 520, w: 26, h: 26, type: 'bird', vx: 1750, vy: 20 });
    for (let i = 0; i < 90; i++) step(world, 1 / 60);
    const tntGone = tnt.broken || !world.bodies.includes(tnt);
    const woodGone = wood.broken || !world.bodies.includes(wood);
    expect(tntGone).toBe(true);
    expect(woodGone).toBe(true);
  });
});

describe('impact log (heavy thuds)', () => {
  it('logs heavy impacts that do NOT break the victim', () => {
    const world = blastWorld();
    // plain bird vs stone wall: ~155 dmg < 240 hp → survives, impact is heavy
    addBody(world, { x: 500, y: 500, w: 12, h: 120, type: 'stone' });
    addBody(world, { x: 150, y: 480, w: 26, h: 26, type: 'bird', vx: 1750, vy: -50 });
    for (let i = 0; i < 20; i++) step(world, 1 / 60);
    expect(world.impactLog.length).toBeGreaterThanOrEqual(1);
  });

  it('never logs gentle contact', () => {
    const world = blastWorld();
    addBody(world, { x: 450, y: 558, w: 46, h: 46, type: 'wood' });
    addBody(world, { x: 380, y: 545, w: 26, h: 26, type: 'bird', vx: 100 });
    for (let i = 0; i < 10; i++) step(world, 1 / 60);
    expect(world.impactLog.length).toBe(0);
  });

  it('does not log impacts that break the victim (break sound plays instead)', () => {
    const world = blastWorld();
    addBody(world, { x: 500, y: 550, w: 46, h: 46, type: 'ice' });
    addBody(world, { x: 150, y: 520, w: 26, h: 26, type: 'bird', vx: 1750 });
    for (let i = 0; i < 20; i++) step(world, 1 / 60);
    expect(world.impactLog.length).toBe(0);
  });

  it('threshold sits above the damage threshold', () => {
    expect(HEAVY_IMPACT_THRESHOLD).toBeGreaterThan(150);
  });
});
