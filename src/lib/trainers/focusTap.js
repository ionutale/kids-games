import { makeRng, pickOne } from './rng.js';
import { CATEGORIES, LOOKALIKES, pickDistractors } from './emojiSets.js';

export function tierFor(level) {
  if (level <= 2) return 'cross';
  if (level <= 5) return 'same';
  return 'lookalike';
}

export function levelConfig(level) {
  const n = Math.max(1, level);
  return {
    goal: Math.min(6 + n, 20),
    spawnMs: Math.max(600, 1800 - 100 * n),
    riseSec: Math.max(4, 9 - 0.25 * n),
    maxItems: 6,
    targetChance: 0.35
  };
}

export function makeRoundState(level, seed = Date.now()) {
  const rng = makeRng(seed);
  const config = levelConfig(level);
  const tier = tierFor(level);

  let target;
  let distractors = [];
  for (let attempt = 0; attempt < 20; attempt++) {
    const pool = Object.values(CATEGORIES).flat();
    target = pickOne(pool, rng);
    distractors = pickDistractors(target, tier, 4, rng);
    if (distractors.length >= 2) break;
  }
  // lookalike tiers may have few partners — top up from same category
  if (distractors.length < 2) {
    const extra = pickDistractors(target, 'same', 4 - distractors.length, rng);
    distractors = [...new Set([...distractors, ...extra])];
  }
  return { config, tier, target, distractors, rng };
}

export function chooseSpawnItem(state, targetsOnScreen, spawnIndex) {
  const { rng, target, distractors, config } = state;
  if (targetsOnScreen === 0) {
    return { emoji: target, isTarget: true };
  }
  const roll = rng();
  if (roll < config.targetChance) {
    return { emoji: target, isTarget: true };
  }
  const fallbackPool = distractors.length > 0 ? distractors : [target];
  void spawnIndex;
  const emoji = pickOne(fallbackPool, rng);
  return emoji === target
    ? { emoji: target, isTarget: true }
    : { emoji, isTarget: false };
}
