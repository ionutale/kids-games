/**
 * Builds the answer options for one question.
 *
 * @param item      the correct item
 * @param items     the topic's items (distractor pool)
 * @param lang      current locale
 * @param rng       injected rng (defaults to Math.random)
 * @param count     total options: 2–4 on the quiz ladder (default 3)
 */
export function buildOptions(item, items, lang, rng = Math.random, count = 3) {
  const total = Math.max(2, Math.min(4, parseInt(count, 10) || 3));
  // Topics with sub-domains (colors vs shapes) must draw wrong answers from the
  // same sub-domain — a red circle's wrong answers may not be "Circle".
  const pool = items.filter(
    (i) => i.emoji !== item.emoji && (item.group === undefined || i.group === item.group)
  );
  const picks = [];
  let guard = 0;
  while (picks.length < total - 1 && pool.length > 0 && guard < 200) {
    guard++;
    const candidate = pool[Math.floor(rng() * pool.length) % pool.length];
    const name = candidate[lang] || candidate.en;
    if (name !== (item[lang] || item.en) && !picks.some((p) => p.name === name)) {
      picks.push({ name, correct: false });
    }
  }
  const correct = { name: item[lang] || item.en, correct: true };
  const options = [correct, ...picks];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1)) % (i + 1);
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
