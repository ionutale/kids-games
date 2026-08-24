/**
 * Angry Emoji 2D — physics engine.
 * Lifted from prototype/angry-emoji-towers (commit 5fc2e89, phys-prototype.html),
 * validated there for: stack stability (0 jitter), no tunneling @1750px/s,
 * material damage thresholds, ~0.1ms/step at 100+ bodies.
 *
 * Axis-aligned boxes only — no rotation. Fixed 4 substeps per step().
 */

export const MATERIALS = {
  wood: { density: 1.0, hp: 60, restitution: 0.05, friction: 0.5 },
  ice: { density: 0.8, hp: 25, restitution: 0.1, friction: 0.05 },
  stone: { density: 1.6, hp: 240, restitution: 0.0, friction: 0.7 },
  bird: { density: 0.12, hp: Infinity, restitution: 0.1, friction: 0.05 },
  birdFire: { density: 0.14, hp: Infinity, restitution: 0.1, friction: 0.05, dmgMul: 3 },
  ball: { density: 0.5, hp: Infinity, restitution: 0.85, friction: 0.1 },
  ground: { density: 0, hp: Infinity, restitution: 0.0, friction: 0.9 },
  targetBasic: { density: 0.6, hp: 30, restitution: 0.05, friction: 0.4 },
  targetTough: { density: 0.8, hp: 90, restitution: 0.05, friction: 0.4 },
  targetBoss: { density: 1.0, hp: 320, restitution: 0.05, friction: 0.4, immuneTo: ['bird', 'ball'] }
};

export const GRAVITY = 980;
export const SUBSTEPS = 4;
export const SLOP = 0.5; // penetration allowed before correction (px)
export const DAMAGE_SPEED_THRESHOLD = 150; // px/s — slower contact never damages

export function createWorld() {
  return { g: GRAVITY, bodies: [], broken: 0, nextId: 1, brokenLog: [] };
}

/**
 * Removes dynamic bodies that escaped the play area (off-screen birds, sunken
 * debris). Static bodies are always kept. Bounds use body centers.
 */
export function cull(world, { maxX, maxY }) {
  const minX = arguments[1]?.minX ?? -Infinity;
  world.bodies = world.bodies.filter((b) => {
    if (b.isStatic) return true;
    if (b.x < minX || b.x > maxX) return false;
    if (b.y > maxY) return false;
    return true;
  });
}

export function addBody(world, { x, y, w, h, type = 'wood', isStatic = false, vx = 0, vy = 0 }) {
  const m = MATERIALS[type];
  const id = world.nextId++;
  const body = {
    id,
    type,
    isStatic,
    w,
    h,
    x,
    y,
    vx,
    vy,
    mass: isStatic ? Infinity : (m.density * (w * h)) / 1600,
    restitution: m.restitution,
    maxHp: m.hp,
    hp: m.hp,
    friction: m.friction,
    dmgMul: m.dmgMul ?? 1,
    immuneTo: m.immuneTo ?? null,
    broken: false
  };
  world.bodies.push(body);
  return body;
}

export function removeBody(world, body) {
  world.bodies = world.bodies.filter((b) => b !== body && b.id !== body.id);
}

export function queryBodies(world, predicate) {
  return world.bodies.filter(predicate);
}

function overlapAABB(a, b) {
  const dx = (a.w + b.w) / 2 - Math.abs(a.x - b.x);
  const dy = (a.h + b.h) / 2 - Math.abs(a.y - b.y);
  if (dx <= 0 || dy <= 0) return null;
  return { x: dx, y: dy, nx: Math.sign(b.x - a.x) || 1, ny: Math.sign(b.y - a.y) || 1 };
}

function resolve(world, a, b, o) {
  const axis = o.x < o.y ? 'x' : 'y';
  const pen = o[axis] - SLOP;
  if (pen > 0) {
    const invA = a.isStatic ? 0 : 1 / a.mass;
    const invB = b.isStatic ? 0 : 1 / b.mass;
    const total = invA + invB || 1;
    const push = pen / total;
    const nDir = axis === 'x' ? o.nx : o.ny;
    if (!a.isStatic) {
      if (axis === 'x') a.x -= nDir * push * invA;
      else a.y -= nDir * push * invA;
    }
    if (!b.isStatic) {
      if (axis === 'x') b.x += nDir * push * invB;
      else b.y += nDir * push * invB;
    }
  }
  const n = axis === 'x' ? { x: o.nx, y: 0 } : { x: 0, y: o.ny };
  const rvx = b.vx - a.vx;
  const rvy = b.vy - a.vy;
  const velAlongNormal = rvx * n.x + rvy * n.y;
  const invA = a.isStatic ? 0 : 1 / a.mass;
  const invB = b.isStatic ? 0 : 1 / b.mass;
  let j = 0;
  if (velAlongNormal < 0) {
    // the bouncy ball keeps its own high restitution regardless of the surface
    const e =
      a.type === 'ball' || b.type === 'ball'
        ? Math.max(a.restitution, b.restitution)
        : Math.min(a.restitution, b.restitution);
    j = -(1 + e) * velAlongNormal / (invA + invB || 1);
    if (!a.isStatic) {
      a.vx -= j * n.x * invA;
      a.vy -= j * n.y * invA;
    }
    if (!b.isStatic) {
      b.vx += j * n.x * invB;
      b.vy += j * n.y * invB;
    }
  }
  // Coulomb friction along the tangent
  const t = { x: -n.y, y: n.x };
  const velAlongTangent = rvx * t.x + rvy * t.y;
  let jt = -velAlongTangent / (invA + invB || 1);
  const maxF = Math.max(a.friction, b.friction) * j;
  jt = Math.max(-maxF, Math.min(maxF, jt));
  if (!a.isStatic) {
    a.vx -= jt * t.x * invA;
    a.vy -= jt * t.y * invA;
  }
  if (!b.isStatic) {
    b.vx += jt * t.x * invB;
    b.vy += jt * t.y * invB;
  }
  // kinetic-energy damage, thresholded so resting contact never damages
  const impactor = invA > invB ? a : b;
  const victim = invA > invB ? b : a;
  const impactSpeed = Math.abs(velAlongNormal);
  if (
    impactSpeed > DAMAGE_SPEED_THRESHOLD &&
    !victim.isStatic &&
    victim.hp !== Infinity &&
    !(victim.immuneTo && victim.immuneTo.includes(impactor.type))
  ) {
    const dmg = impactSpeed * impactSpeed * impactor.mass * 0.001 * (impactor.dmgMul ?? 1);
    victim.hp -= dmg;
    if (victim.hp <= 0 && !victim.broken) {
      victim.broken = true;
      world.broken++;
      if (world.brokenLog) world.brokenLog.push(victim);
    }
  }
}

function collideStep(world) {
  const bs = world.bodies;
  for (let i = 0; i < bs.length; i++) {
    for (let j = i + 1; j < bs.length; j++) {
      const a = bs[i];
      const b = bs[j];
      if (a.broken || b.broken) continue;
      if (a.isStatic && b.isStatic) continue;
      const overlap = overlapAABB(a, b);
      if (!overlap) continue;
      resolve(world, a, b, overlap);
    }
  }
  let removed = false;
  for (const b of bs) {
    if (b.broken) {
      b.removeMe = true;
      removed = true;
    }
  }
  if (removed) world.bodies = bs.filter((b) => !b.removeMe);
}

function integrate(world, h) {
  for (const b of world.bodies) {
    if (b.isStatic || b.broken) continue;
    b.vy += world.g * h;
    b.x += b.vx * h;
    b.y += b.vy * h;
  }
}

export function step(world, dt) {
  const h = dt / SUBSTEPS;
  for (let s = 0; s < SUBSTEPS; s++) {
    integrate(world, h);
    collideStep(world);
  }
}
