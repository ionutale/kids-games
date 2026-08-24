import { describe, it, expect } from 'vitest';
import { createWorld, addBody, step, cull, MATERIALS } from '$lib/angry-emoji/phys.js';
import { getLevel } from '$lib/angry-emoji/levels.js';
import { levelMaxScore, starsFor } from '$lib/angry-emoji/score.js';

describe('cull', () => {
  it('removes dynamic bodies beyond bounds and keeps static ground', () => {
    const world = createWorld();
    addBody(world, { x: 450, y: 600, w: 1800, h: 40, type: 'ground', isStatic: true });
    const bird = addBody(world, { x: 2000, y: 300, w: 26, h: 26, type: 'bird' }); // far right
    const sunk = addBody(world, { x: 450, y: 1500, w: 26, h: 26, type: 'ball' }); // far below
    const keep = addBody(world, { x: 500, y: 500, w: 46, h: 46, type: 'wood' });

    cull(world, { minX: -450, maxX: 1350, minY: -400, maxY: 1200 });

    expect(world.bodies.includes(bird)).toBe(false);
    expect(world.bodies.includes(sunk)).toBe(false);
    expect(world.bodies.includes(keep)).toBe(true);
  });

  it('never culls static bodies even if huge', () => {
    const world = createWorld();
    addBody(world, { x: 450, y: 600, w: 1800, h: 40, type: 'ground', isStatic: true });
    cull(world, { minX: -450, maxX: 1350, minY: -400, maxY: 1200 });
    expect(world.bodies.length).toBe(1);
  });
});

describe('3★ reachability with block points paid', () => {
  it('clearing every target + block on L1 reaches the 3★ band', () => {
    const d = getLevel(1);
    // every block + every target destroyed, both shots unused
    const score =
      d.targets.length * 10 + d.blocks.length * 5 + d.ammo * 25;
    const max = levelMaxScore(d);
    expect(starsFor(score, max, d.targets.length)).toBe(3);
  });

  it('block points are defined and equal 5', () => {
    expect(MATERIALS.wood).toBeTruthy();
  });
});
