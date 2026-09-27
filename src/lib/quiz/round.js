export function buildOptions(item, items, lang, rng = Math.random) {
  // Topics with sub-domains (colors vs shapes) must draw wrong answers from the
  // same sub-domain — a red circle's wrong answers may not be "Circle".
  const pool = items.filter(
    (i) => i.emoji !== item.emoji && (item.group === undefined || i.group === item.group)
  );
  const picks = [];
  let guard = 0;
  while (picks.length < 2 && pool.length > 0 && guard < 200) {
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
