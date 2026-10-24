const YOUNG_BUDGET = Object.freeze({
  cap: 20,
  perBurst: 2,
  intervalMs: 180,
  lifetimeMs: 1800,
  minDistancePx: 8,
  sizeMin: 20,
  sizeMax: 50
});

const STANDARD_BUDGET = Object.freeze({
  cap: 40,
  perBurst: 3,
  intervalMs: 100,
  lifetimeMs: 1300,
  minDistancePx: 8,
  sizeMin: 20,
  sizeMax: 40
});

export function getSplashBudget(ageLevel) {
  return ageLevel <= 2 ? YOUNG_BUDGET : STANDARD_BUDGET;
}

export function shouldSpawn({ now, lastSpawnAt, x, y, lastX, lastY, intervalMs, minDistancePx }) {
  if (lastSpawnAt === -Infinity) return true;
  if (now - lastSpawnAt < intervalMs) return false;
  return Math.hypot(x - lastX, y - lastY) >= minDistancePx;
}

export function appendWithCap(current, incoming, cap) {
  const next = [...current, ...incoming];
  const limit = Math.max(cap, 0);
  return next.length <= limit ? next : next.slice(next.length - limit);
}

export function filterExpired(particles, now) {
  return particles.filter((particle) => particle.expiresAt > now);
}

export function estimatedLive({ perBurst, intervalMs, lifetimeMs }) {
  return (perBurst / intervalMs) * lifetimeMs;
}
