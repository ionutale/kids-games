import { describe, it, expect, vi } from 'vitest';
import { SPEECH_LANGS, speechLangFor, speak, defaultQuizMode } from '$lib/quiz/audio.js';

describe('speechLangFor', () => {
  it('maps every app locale to a speech tag', () => {
    for (const locale of ['en', 'it', 'ro', 'de', 'fr', 'zh']) {
      expect(SPEECH_LANGS[locale]).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
      expect(speechLangFor(locale)).toBe(SPEECH_LANGS[locale]);
    }
  });

  it('falls back to English for unknown locales', () => {
    expect(speechLangFor('xx')).toBe(SPEECH_LANGS.en);
    expect(speechLangFor(undefined)).toBe(SPEECH_LANGS.en);
  });
});

describe('speak', () => {
  function fakeSynth() {
    return { cancel: vi.fn(), speak: vi.fn() };
  }
  class FakeUtterance {
    constructor(text) { this.text = text; }
  }

  it('cancels the previous speech and speaks with the locale tag and a child-friendly rate', () => {
    const synth = fakeSynth();
    const ok = speak('Cane', 'it', synth, FakeUtterance);
    expect(ok).toBe(true);
    expect(synth.cancel).toHaveBeenCalledTimes(1);
    expect(synth.speak).toHaveBeenCalledTimes(1);
    const utter = synth.speak.mock.calls[0][0];
    expect(utter.text).toBe('Cane');
    expect(utter.lang).toBe('it-IT');
    expect(utter.rate).toBeLessThan(1);
  });

  it('is a silent no-op when speech synthesis is unavailable', () => {
    expect(speak('Dog', 'en', null, null)).toBe(false);
    expect(speak('Dog', 'en', undefined, FakeUtterance)).toBe(false);
    expect(speak('', 'en', fakeSynth(), FakeUtterance)).toBe(false);
  });

  it('never throws if the platform rejects the call', () => {
    const synth = { cancel: vi.fn(() => { throw new Error('nope'); }), speak: vi.fn() };
    expect(speak('Dog', 'en', synth, FakeUtterance)).toBe(false);
  });
});

describe('defaultQuizMode', () => {
  it('starts pre-readers in listen mode and readers in read mode', () => {
    expect(defaultQuizMode(2)).toBe('listen');
    expect(defaultQuizMode(3)).toBe('listen');
    expect(defaultQuizMode(4)).toBe('listen');
    expect(defaultQuizMode(5)).toBe('read');
  });

  it('treats a missing age as the youngest band', () => {
    expect(defaultQuizMode(undefined)).toBe('listen');
    expect(defaultQuizMode(null)).toBe('listen');
  });
});
