import { makeRng, pickOne } from './rng.js';
import { CATEGORIES, categoryOfEmoji, lookalikePartner } from './emojiSets.js';

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

// A spawned emoji is absent from the pool this long after its rise animation ends.
export const SPAWN_LIFETIME_GRACE_MS = 250;

function sameCategoryPool(target) {
  const cat = categoryOfEmoji(target);
  return cat ? CATEGORIES[cat].filter((e) => e !== target) : [];
}

function crossCategoryPool(target) {
  const cat = categoryOfEmoji(target);
  const out = [];
  for (const [name, emojis] of Object.entries(CATEGORIES)) {
    if (name !== cat) out.push(...emojis);
  }
  return out;
}

// For the lookalike tier, only targets that actually have a lookalike partner
// are usable — otherwise the tier silently degrades to an easier pool.
export function pickTargetForTier(tier, rng = 1) {
  const next = typeof rng === 'function' ? rng : makeRng(rng);
  const all = Object.values(CATEGORIES).flat();
  const pool = tier === 'lookalike' ? all.filter((e) => lookalikePartner(e)) : all;
  return pickOne(pool, next);
}

export function buildDistractors(tier, target, rng = 1, count = 4) {
  const next = typeof rng === 'function' ? rng : makeRng(rng);
  const picks = [];
  let pool;
  if (tier === 'lookalike') {
    // The hardest distractor is guaranteed, not left to the draw.
    const partner = lookalikePartner(target);
    if (partner && partner !== target) picks.push(partner);
    pool = sameCategoryPool(target);
  } else if (tier === 'same') {
    pool = sameCategoryPool(target);
  } else {
    pool = crossCategoryPool(target);
  }
  let guard = 0;
  while (picks.length < count && guard < 500) {
    guard++;
    const candidate = pickOne(pool, next);
    if (candidate !== target && !picks.includes(candidate)) picks.push(candidate);
  }
  return picks;
}

export function makeRoundState(level, seed = Date.now()) {
  const rng = makeRng(seed);
  const config = levelConfig(level);
  const tier = tierFor(level);
  const target = pickTargetForTier(tier, rng);
  const distractors = buildDistractors(tier, target, rng, 4);
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

export function pruneExpired(items, now = Date.now()) {
  return items.filter((i) => i.expiresAt === undefined || i.expiresAt > now);
}

// Owns the whole spawn decision so the stream cannot dead-end: expired emojis
// leave the pool before the cap is checked, and every spawn carries its own
// expiry timestamp.
export function nextSpawn(state, items, idSeq, now = Date.now()) {
  const live = pruneExpired(items, now);
  if (live.length >= state.config.maxItems) {
    return { items: live, item: null, forced: false };
  }
  const targetsOnScreen = live.filter((i) => i.isTarget).length;
  const forced = targetsOnScreen === 0;
  const pick = chooseSpawnItem(state, targetsOnScreen, idSeq);
  const item = {
    id: idSeq,
    emoji: pick.emoji,
    isTarget: pick.isTarget,
    x: 6 + state.rng() * 84,
    expiresAt: now + state.config.riseSec * 1000 + SPAWN_LIFETIME_GRACE_MS
  };
  return { items: [...live, item], item, forced };
}
