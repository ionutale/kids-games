/**
 * Deterministic trajectory preview for the slingshot aim line.
 * Integrates with the same constants as the launch (GRAVITY, restitution of
 * the loaded bird) so the dots land within a few px of the real flight.
 * Simulates the ground plane only — structures are intentionally not part
 * of the preview (cheap per-frame during drag, and matches AB's feel).
 */
import { GRAVITY } from './phys.js';

export function computeTrajectory({
  x,
  y,
  vx,
  vy,
  g = GRAVITY,
  groundY,
  halfH,
  restitution = 0.1,
  maxPoints = 70,
  dt = 1 / 30,
  maxX = Infinity
}) {
  const points = [{ x, y }];
  let px = x;
  let py = y;
  let pvx = vx;
  let pvy = vy;
  let firstBounce = null;
  const floorY = groundY - halfH;

  for (let i = 1; i < maxPoints; i++) {
    pvy += g * dt;
    px += pvx * dt;
    py += pvy * dt;

    if (py >= floorY && pvy > 0) {
      py = floorY;
      points.push({ x: px, y: py });
      if (firstBounce === null) firstBounce = i;
      pvy = -pvy * restitution;
      if (Math.abs(pvy) < 40) break; // rebound died — bird is rolling
      continue;
    }

    points.push({ x: px, y: py });
    if (px > maxX || px < -100 || py > groundY + 200) break;
  }

  return { points, firstBounce };
}
