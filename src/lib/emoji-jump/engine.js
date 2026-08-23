import { makeRng } from '../trainers/rng.js';

export const GRAVITY = 980; // px/s²
export const JUMP_V = 500; // px/s upward impulse → ~127px jump height
export const MOVE_SPEED = 240; // px/s steering
export const SPRING_BOUNCE = 2.5; // × normal jump
export const SPRING_RATE = 0.05;
export const POWERUP_RATE = 0.03;
export const BAND_START = 0;
export const BAND_MID = 150; // meters
export const BAND_DEEP = 400;
export const ENEMY_FIRST_M = 200;
export const ENEMY_SPACING_M = 60;
export const PX_PER_M = 10;
export const PLATFORM_W = 64;
export const PLATFORM_H = 14;
export const JETPACK_V = 900;
export const JETPACK_S = 5;

const WORLD_W = 390;
const MAX_DX = 150; // hard horizontal-reach bound between consecutive platforms

function bandFor(heightM) {
  if (heightM < BAND_MID) return 'start';
  if (heightM < BAND_DEEP) return 'mid';
  return 'deep';
}

/**
 * Next platform above `prev`. Guarantees reachability:
 * vertical gap ∈ [GAP_MIN, GAP_MAX] × jump height, and when the gap is large the
 * horizontal drift is clamped so the climb stays physically possible.
 */
export function nextPlatform(prev, rng = Math.random()) {
  const r = typeof rng === 'function' ? rng : makeRng(rng);
  const jumpH = (JUMP_V * JUMP_V) / (2 * GRAVITY);
  const gapMin = 1.5 * jumpH;
  const gapMax = 3.5 * jumpH;
  const gap = gapMin + r() * (gapMax - gapMin);

  // reachability: drift budget shrinks as the gap grows past 2×jump height
  let dxBudget = MAX_DX;
  if (gap > 2 * jumpH) {
    dxBudget = Math.max(40, MAX_DX * (1 - (gap / gapMax) * 0.75));
  }
  let x = prev.x + (r() * 2 - 1) * dxBudget;
  x = Math.max(8, Math.min(WORLD_W - PLATFORM_W - 8, x));

  const heightM = prev.heightM + gap / PX_PER_M;
  const band = bandFor(heightM);

  let type = 'static';
  const roll = r();
  if (band === 'mid') {
    type = roll < 0.7 ? 'static' : roll < 0.85 ? 'moving' : 'breakable';
  } else if (band === 'deep') {
    type = roll < 0.6 ? 'static' : roll < 0.8 ? 'moving' : 'breakable';
  }

  const plat = {
    id: prev.id + 1,
    x,
    y: prev.y - gap,
    w: PLATFORM_W,
    h: PLATFORM_H,
    type,
    heightM,
    vx: type === 'moving' ? (r() < 0.5 ? -60 : 60) : 0,
    broken: false,
    spring: false,
    powerup: null,
    enemy: null
  };

  if (!plat.broken && r() < SPRING_RATE) plat.spring = true;
  else if (!plat.broken && r() < POWERUP_RATE) {
    plat.powerup = r() < 0.5 ? 'jetpack' : 'shield';
  }

  // enemies appear above ENEMY_FIRST_M, roughly one per ENEMY_SPACING_M climbed,
  // riding non-breakable platforms in the deep band
  if (
    band === 'deep' &&
    plat.type !== 'breakable' &&
    !plat.spring &&
    heightM > ENEMY_FIRST_M &&
    Math.floor(heightM / ENEMY_SPACING_M) > Math.floor(prev.heightM / ENEMY_SPACING_M) &&
    r() < 0.6
  ) {
    plat.enemy = { x: plat.x, dir: r() < 0.5 ? -1 : 1 };
  }

  return plat;
}

/** Builds the initial ladder of platforms up to `count`, bottom-up. */
export function generateLadder(count, seed = Date.now()) {
  const r = makeRng(seed);
  const ladder = [];
  let prev = { id: 0, x: (WORLD_W - PLATFORM_W) / 2, y: 0, heightM: 0 };
  for (let i = 0; i < count; i++) {
    prev = nextPlatform(prev, r);
    ladder.push(prev);
  }
  return ladder;
}

export function jumpVelocity(isSpring) {
  return -JUMP_V * (isSpring ? SPRING_BOUNCE : 1);
}

/**
 * Advances the player one fixed step.
 * state: { x, y, vx, vy, shield, jetpackMs }
 * platforms: ladder array; input: -1 | 0 | 1
 * Returns events: { bounced, sprung, broke, powered, hitEnemy, died, maxHeightM }
 */
export function step(state, platforms, input, dt, opts = {}) {
  const events = {
    bounced: false,
    sprung: false,
    broke: false,
    powered: null,
    hitEnemy: false,
    died: false
  };
  const s = { ...state };

  // steering
  if (input !== 0) s.x += input * MOVE_SPEED * dt;
  s.x = Math.max(0, Math.min(opts.worldW ?? WORLD_W, s.x));

  // jetpack overrides gravity
  if (s.jetpackMs > 0) {
    s.vy = -JETPACK_V;
    s.jetpackMs -= dt * 1000;
  } else {
    s.vy += GRAVITY * dt;
  }
  s.y += s.vy * dt;

  // land only when falling
  if (s.vy > 0) {
    for (const p of platforms) {
      if (p.broken) continue;
      const overX =
        s.x + 16 > p.x - 6 && s.x + 16 < p.x + p.w + 6; // player center-ish overlap
      const crossing = s.y + 24 >= p.y && s.y + 24 <= p.y + p.h + Math.abs(s.vy) * dt;
      if (overX && crossing) {
        if (p.type === 'breakable') {
          p.broken = true;
          events.broke = true;
          s.vy = jumpVelocity(false); // one bounce, then it's gone
          events.bounced = true;
        } else {
          if (p.spring) {
            s.vy = jumpVelocity(true);
            events.sprung = true;
          } else {
            s.vy = jumpVelocity(false);
            events.bounced = true;
          }
        }
        break;
      }
    }
  }

  // power-up pickup
  for (const p of platforms) {
    if (!p.powerup) continue;
    const puX = p.x + p.w / 2;
    const puY = p.y - 26;
    if (Math.abs(s.x + 16 - puX) < 26 && Math.abs(s.y + 12 - puY) < 26) {
      events.powered = p.powerup;
      if (p.powerup === 'jetpack') {
        s.jetpackMs = JETPACK_S * 1000;
      } else {
        s.shield = true;
      }
      p.powerup = null;
    }
  }

  // enemies
  for (const p of platforms) {
    if (!p.enemy) continue;
    p.enemy.x += p.enemy.dir * 40 * dt;
    if (p.enemy.x < p.x || p.enemy.x + 22 > p.x + p.w) p.enemy.dir *= -1;
    if (Math.abs(s.x + 16 - (p.enemy.x + 11)) < 20 && Math.abs(s.y + 12 - (p.y - 12)) < 20) {
      if (s.shield) {
        s.shield = false;
        p.enemy = null;
        events.hitEnemy = false;
        events.shieldUsed = true;
      } else {
        events.hitEnemy = true;
        events.died = true;
      }
    }
  }

  if (opts.deathY != null && s.y > opts.deathY) events.died = true;

  return { state: s, events };
}

export function scoreFor(maxHeightM, springsHit) {
  return Math.floor(maxHeightM) + 50 * springsHit;
}
