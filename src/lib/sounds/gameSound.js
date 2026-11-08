import { getAudioContext, isSoundEnabled, unlockAudio, suspendAudio } from './audioManager.js';

function tone(ctx, {
  freq = 440,
  dur = 0.12,
  type = 'sine',
  vol = 0.1,
  slide = 0,
  delay = 0
} = {}) {
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  }
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

function noise(ctx, { dur = 0.15, vol = 0.1, cutoff = 1200, delay = 0 } = {}) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = cutoff;
  const gain = ctx.createGain();
  const t = ctx.currentTime + delay;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(t);
}

/**
 * A game registers named cues and gets a mute-aware player over the shared
 * AudioContext. A cue receives `{ tone, noise, after }` and any extra args.
 */
export function createGameSound(recipes = {}) {
  const timers = new Set();
  let disposed = false;

  function after(ms, fn) {
    const id = setTimeout(() => {
      timers.delete(id);
      if (!disposed) fn();
    }, ms);
    timers.add(id);
    return id;
  }

  function stop() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
  }

  function play(name, ...args) {
    if (disposed || !isSoundEnabled()) return;
    const recipe = recipes[name];
    if (typeof recipe !== 'function') return;
    try {
      const ctx = getAudioContext();
      recipe(
        {
          tone: (options) => tone(ctx, options),
          noise: (options) => noise(ctx, options),
          after
        },
        ...args
      );
    } catch {
      // A missing or suspended context is never fatal for a game cue.
    }
  }

  return {
    unlock() {
      if (!disposed) unlockAudio();
    },
    play,
    stop,
    dispose() {
      disposed = true;
      stop();
      suspendAudio();
    }
  };
}
