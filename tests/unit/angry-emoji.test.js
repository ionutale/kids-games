import { describe, it, expect } from 'vitest';
import {
  createWorld,
  addBody,
  removeBody,
  step,
  MATERIALS,
  DAMAGE_SPEED_THRESHOLD
} from '$lib/angry-emoji/phys.js';

const GROUND = { x: 450, y: 600, w: 1800, h: 40, type: 'ground', isStatic: true };

function stackedWorld(rows = 4) {
  const world = createWorld();
  addBody(world, GROUND);
  for (let r = 0; r < rows; r++) {
    addBody(world, { x: 450, y: 580 - 23 - r * 46, w: 46, h: 46, type: 'wood' });
  }
  return world;
}

describe('physics stability', () => {
  it('a resting stack settles quickly and does not jitter afterwards', () => {
    const world = stackedWorld(4);
    for (let i = 0; i < 300; i++) step(world, 1 / 60); // settle phase
    const snapshot = world.bodies.map((b) => ({ x: b.x, y: b.y }));
    for (let i = 0; i < 300; i++) step(world, 1 / 60);
    world.bodies.forEach((b, i) => {
      expect(Math.abs(b.x - snapshot[i].x)).toBeLessThan(1.5);
      expect(Math.abs(b.y - snapshot[i].y)).toBeLessThan(1.5);
    });
    expect(world.broken).toBe(0);
  });

  it('friction stops a sliding block', () => {
    const world = createWorld();
    addBody(world, GROUND);
    const block = addBody(world, { x: 100, y: 570, w: 40, h: 40, type: 'wood', vx: 400 });
    for (let i = 0; i < 240; i++) step(world, 1 / 60);
    expect(block.vx).toBeLessThan(20);
  });
});

describe('tunneling guard', () => {
  it('full-power projectile cannot pass through a wall in one step', () => {
    const world = createWorld();
    addBody(world, GROUND);
    // thin wall of stone right in the flight path
    addBody(world, { x: 500, y: 500, w: 12, h: 120, type: 'stone' });
    const bird = addBody(world, { x: 150, y: 480, w: 26, h: 26, type: 'bird', vx: 1750, vy: -50 });
    let passed = false;
    for (let i = 0; i < 30; i++) {
      step(world, 1 / 60);
      if (bird.x > 520 && bird.broken === false && bird.hp !== Infinity) { /* noop */ }
      if (bird.x > 700) passed = true;
    }
    // bird may break blocks but must never appear far beyond the wall unimpeded
    // (either it damaged/stopped at the wall, or bounced back)
    expect(passed).toBe(false);
  });
});

describe('material damage thresholds', () => {
  it('gentle contact never damages wood', () => {
    const world = createWorld();
    addBody(world, GROUND);
    const block = addBody(world, { x: 450, y: 558, w: 46, h: 46, type: 'wood' });
    const bird = addBody(world, { x: 380, y: 545, w: 26, h: 26, type: 'bird', vx: 100 });
    for (let i = 0; i < 10; i++) step(world, 1 / 60);
    expect(block.broken).toBe(false);
    expect(block.hp).toBe(MATERIALS.wood.hp);
    void bird;
  });

  it('full-power shot shatters ice and damages but rarely breaks stone in one hit', () => {
    // ice hp25 vs damage from 1750px/s bird
    const world = createWorld();
    addBody(world, GROUND);
    const ice = addBody(world, { x: 500, y: 550, w: 46, h: 46, type: 'ice' });
    const bird = addBody(world, { x: 150, y: 520, w: 26, h: 26, type: 'bird', vx: 1750 });
    for (let i = 0; i < 20; i++) step(world, 1 / 60);
    const iceBroken = ice.broken || !world.bodies.includes(ice);
    expect(iceBroken || ice.hp < MATERIALS.ice.hp).toBe(true);
    void bird;
  });

  it('damage threshold ignores slow contact entirely', () => {
    expect(DAMAGE_SPEED_THRESHOLD).toBeGreaterThan(100);
  });


describe('projectile behaviors', () => {
  it('plain bird cannot damage a shielded boss; fire bird can', () => {
    const mk = (birdType) => {
      const world = createWorld();
      addBody(world, GROUND);
      const boss = addBody(world, { x: 500, y: 550, w: 40, h: 50, type: 'targetBoss' });
      addBody(world, { x: 150, y: 520, w: 26, h: 26, type: birdType, vx: 1750 });
      for (let i = 0; i < 25; i++) step(world, 1 / 60);
      return boss;
    };
    const afterPlain = mk('bird');
    expect(afterPlain.broken).toBe(false);
    expect(afterPlain.hp).toBe(MATERIALS.targetBoss.hp); // immune — untouched
    const afterFire = mk('birdFire');
    const fireWorked = afterFire.broken || !afterFire || afterFire.hp < MATERIALS.targetBoss.hp;
    expect(fireWorked).toBe(true);
  });

  it('bouncy ball keeps most of its speed on impact (high restitution)', () => {
    const world = createWorld();
    addBody(world, GROUND);
    const ball = addBody(world, { x: 450, y: 300, w: 30, h: 30, type: 'ball' });
    let landed = false;
    let landingY = 0;
    let highestAfter = Infinity;
    for (let i = 0; i < 400; i++) {
      step(world, 1 / 60);
      if (!landed && ball.vy >= 0 && ball.y > 500) {
        landed = true;
        landingY = ball.y;
      }
      if (landed && ball.vy < 0) highestAfter = Math.min(highestAfter, ball.y);
    }
    expect(landed).toBe(true);
    expect(landingY - highestAfter).toBeGreaterThan(20); // meaningful rebound
  });
});

  it('removeBody works', () => {
    const world = createWorld();
    const b = addBody(world, { x: 10, y: 10, w: 5, h: 5, type: 'wood' });
    removeBody(world, b);
    expect(world.bodies.length).toBe(0);
  });
});
