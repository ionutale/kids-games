// Pop level ladder.
//
// `fallSec` is the bubble's CSS animation duration, so LOWER is FASTER:
// it must shrink as levels rise. (The old inline formula raised it with the
// level, making level 10 the slowest round in the game.)
export function levelConfig(level) {
  const n = Math.min(10, Math.max(1, parseInt(level, 10) || 1));
  const maxItems = Math.min(2 + n * 1.3, 15);
  const spawnMs = Math.max(300, 2000 - n * 170);
  const fallSec = Math.max(3, 10 - n * 0.7);
  const itemCount = Math.min(2 + n, 8);
  return { maxItems, spawnMs, fallSec, itemCount };
}
