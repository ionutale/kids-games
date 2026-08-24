import { describe, it, expect } from 'vitest';
import { createWorld, addBody, step, MATERIALS } from '$lib/angry-emoji/phys.js';

describe('patrol bodies', () => {
  it('glides horizontally around its anchor without falling', () => {
    const world = createWorld();
    addBody(world, { x: 450, y: 600, w: 1800, h: 40, type: 'ground', isStatic: true });
    const p = addBody(world, {
      x: 450,
      y: 557,
      w: 46,
      h: 46,
      type: 'wood',
      patrol: { amp: 35, speed: 2, phase: 0 }
    });
    const y0 = p.y;
    let minX = Infinity;
    let maxX = -Infinity;
    for (let i = 0; i < 600; i++) {
      // ~10s — several full cycles at speed 2 rad/s
      step(world, 1 / 60);
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
    }
    expect(maxX - minX).toBeGreaterThan(40); // actually moves
    expect(Math.abs(p.x - 450)).toBeLessThan(45); // stays near its anchor
    expect(p.y).toBe(y0); // gravity does not apply
  });

  it('still takes kinetic damage like any dynamic block', () => {
    const world = createWorld();
    addBody(world, { x: 450, y: 600, w: 1800, h: 40, type: 'ground', isStatic: true });
    const p = addBody(world, {
      x: 450,
      y: 557,
      w: 46,
      h: 46,
      type: 'ice',
      patrol: { amp: 30, speed: 2 }
    });
    addBody(world, { x: 150, y: 520, w: 26, h: 26, type: 'bird', vx: 1750, vy: 50 });
    for (let i = 0; i < 60; i++) step(world, 1 / 60);
    expect(p.broken || !world.bodies.includes(p) || p.hp < MATERIALS.ice.hp).toBe(true);
  });

  it('bodies without patrol keep normal gravity behavior', () => {
    const world = createWorld();
    addBody(world, { x: 450, y: 600, w: 1800, h: 40, type: 'ground', isStatic: true });
    const b = addBody(world, { x: 450, y: 100, w: 46, h: 46, type: 'wood' });
    for (let i = 0; i < 120; i++) step(world, 1 / 60);
    expect(b.y).toBeGreaterThan(400); // fell onto the ground
  });
});
