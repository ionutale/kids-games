// Pure layout maths for the Pond Catch. Kept out of the components so the
// stream band and the high-goal firefly grid can be unit-tested.

// The engine spawns x in 6..90% of the pond. The frog and jar docks own the
// bottom corners, so the visible stream is remapped into a narrow central band
// that stays clear of both docks and never clips at the pond edge.
export const ENGINE_X = { min: 6, max: 90 };
export const STREAM_BAND = { min: 42, max: 70 };

export function streamX(engineX) {
  const t = Math.min(1, Math.max(0, (engineX - ENGINE_X.min) / (ENGINE_X.max - ENGINE_X.min)));
  return STREAM_BAND.min + t * (STREAM_BAND.max - STREAM_BAND.min);
}

export const MAX_JAR_DOTS = 20;

export function jarPercent(caught, goal) {
  return Math.min(1, caught / Math.max(1, goal));
}

/**
 * Positions for the fireflies in the jar. Low goals keep the organic scatter;
 * high goals switch to a compact grid and smaller dots so 16–20 fireflies still
 * read as countable instead of clumping into one glow.
 */
export function jarDots(goal) {
  const total = Math.max(0, Math.min(Math.round(goal) || 0, MAX_JAR_DOTS));
  if (total === 0) return [];

  const dense = total > 12;
  if (!dense) {
    return Array.from({ length: total }, (_, i) => ({
      left: 10 + ((i * 47) % 74),
      bottom: 6 + ((i * 31) % 68),
      dense: false
    }));
  }

  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  return Array.from({ length: total }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const baseLeft = cols === 1 ? 50 : 14 + (col * 72) / (cols - 1);
    const jitter = row % 2 === 0 ? -2.5 : 2.5;
    const baseBottom = rows === 1 ? 40 : 8 + (row * 66) / (rows - 1);
    return {
      left: Math.min(88, Math.max(10, baseLeft + jitter)),
      bottom: baseBottom,
      dense: true
    };
  });
}
