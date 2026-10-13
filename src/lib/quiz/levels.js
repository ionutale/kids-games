import { makeRng, shuffle } from '$lib/trainers/rng.js';

export const QUIZ_MAX_LEVEL = 10;

/**
 * The quiz ladder: rounds stay short (4 → 8 questions) and answers get more
 * crowded (2 → 4 options). The old quizzes walked the entire topic (up to 32
 * questions) at a fixed three options, for every level and every child.
 */
export function quizLevelConfig(level) {
  const n = Math.min(QUIZ_MAX_LEVEL, Math.max(1, parseInt(level, 10) || 1));
  const questions = Math.min(4 + Math.floor((n - 1) / 2), 8);
  const options = n <= 2 ? 2 : n <= 8 ? 3 : 4;
  return { questions, options };
}

/**
 * One round's items: a fresh shuffle of the topic, cut to the level's question
 * count. Every replay reshuffles, and no item repeats inside a round.
 */
export function buildQueue(items, level, rng = Math.random) {
  const r = typeof rng === 'function' ? rng : makeRng(rng);
  const { questions } = quizLevelConfig(level);
  return shuffle([...items], r).slice(0, Math.min(questions, items.length));
}
