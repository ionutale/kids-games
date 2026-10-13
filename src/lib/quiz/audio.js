/**
 * Speech support for the quizzes' pre-reader "listen" mode.
 * Uses the Web Speech API; every call degrades to a silent no-op when the
 * platform has no synthesis (the word is also shown, so a parent can read it).
 */

export const SPEECH_LANGS = {
  en: 'en-US',
  it: 'it-IT',
  ro: 'ro-RO',
  de: 'de-DE',
  fr: 'fr-FR',
  zh: 'zh-CN'
};

export function speechLangFor(locale) {
  return SPEECH_LANGS[locale] ?? SPEECH_LANGS.en;
}

/** Speaks `text` in the locale's voice. Returns true when a call was made. */
export function speak(
  text,
  locale,
  synth = globalThis.speechSynthesis,
  Utterance = globalThis.SpeechSynthesisUtterance
) {
  if (!text || !synth || typeof Utterance !== 'function') return false;
  try {
    synth.cancel(); // never queue words on top of each other
    const utterance = new Utterance(text);
    utterance.lang = speechLangFor(locale);
    utterance.rate = 0.9; // a touch slower than default for young ears
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

/** Pre-readers start in listen mode; readers can still tap the toggle. */
export function defaultQuizMode(ageLevel) {
  const age = Number(ageLevel);
  return !Number.isFinite(age) || age <= 4 ? 'listen' : 'read';
}
