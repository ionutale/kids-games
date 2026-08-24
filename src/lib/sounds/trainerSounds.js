let ctx = null;

function audioCtx() {
  if (ctx !== null) return ctx;
  try {
    const AC = typeof window !== 'undefined'
      ? (window.AudioContext || window.webkitAudioContext)
      : null;
    ctx = AC ? new AC() : false;
  } catch {
    ctx = false;
  }
  return ctx;
}

function tone(freq, dur, { type = 'sine', gain = 0.15, pitch = 1, delay = 0 } = {}) {
  const ac = audioCtx();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.value = Math.max(30, freq * pitch);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseSweep(dur, { from = 300, to = 1800, gain = 0.08, pitch = 1 } = {}) {
  const ac = audioCtx();
  if (!ac) return;
  const t0 = ac.currentTime;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(from * pitch, t0);
  filter.frequency.exponentialRampToValueAtTime(to * pitch, t0 + dur);
  const amp = ac.createGain();
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start(t0);
}

export function playLevelTick(pitch = 1) {
  tone(1200, 0.05, { type: 'square', gain: 0.06, pitch });
}

export function playFlashWhoosh(pitch = 1) {
  noiseSweep(0.3, { from: 300, to: 2000, pitch });
}

/** Rubbery low wobble while drawing the slingshot band taut. */
export function playStretch(pitch = 1) {
  tone(160, 0.18, { type: 'sawtooth', gain: 0.06, pitch });
  tone(210, 0.14, { type: 'sawtooth', gain: 0.05, pitch: pitch * 1.15, delay: 0.06 });
}

/** Big low blast — TNT crates and the fire-bird explosion. */
export function playBoom() {
  noiseSweep(0.5, { from: 500, to: 70, gain: 0.28 });
  tone(70, 0.35, { type: 'sine', gain: 0.22 });
}

/** Heavy non-breaking impact thud. scale 0–1 sets the punch. */
export function playThud(scale = 1) {
  tone(75, 0.1, { type: 'sine', gain: 0.05 + 0.13 * Math.min(1, scale) });
}

/** Material-flavoured break sounds — "if it moves it should make a sound". */
export function playMaterialBreak(type) {
  if (type === 'tnt') return playBoom();
  if (type === 'ice') {
    tone(1568, 0.08, { type: 'triangle', gain: 0.1 });
    tone(2093, 0.07, { type: 'triangle', gain: 0.08, delay: 0.04 });
    return;
  }
  if (type === 'stone') {
    tone(120, 0.12, { type: 'sawtooth', gain: 0.16 });
    return;
  }
  // wood (and anything else): creak-crack
  noiseSweep(0.12, { from: 500, to: 180, gain: 0.16 });
}

export function playReadyTick(pitch = 1) {
  tone(900, 0.06, { type: 'square', gain: 0.07, pitch });
  tone(900, 0.06, { type: 'square', gain: 0.07, pitch, delay: 0.14 });
}

export function playAdvancePop(pitch = 1) {
  tone(420, 0.07, { type: 'sine', gain: 0.14, pitch });
  tone(920, 0.09, { type: 'triangle', gain: 0.12, pitch, delay: 0.05 });
}

export function playSlotChime(pitch = 1) {
  tone(1318, 0.09, { gain: 0.13, pitch }); // E6
  tone(1568, 0.12, { gain: 0.13, pitch, delay: 0.08 }); // G6
}

export function playSparkle(pitch = 1) {
  [2093, 2637, 3136].forEach((f, i) => {
    tone(f, 0.07, { type: 'triangle', gain: 0.08, pitch, delay: i * 0.05 });
  });
}

export function fanfare(pitch = 1) {
  try {
    const audio = new Audio('/sounds/fanfare.mp3');
    audio.volume = 0.8;
    audio.playbackRate = pitch;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
    return;
  } catch {
    // fall through to synth win below
  }
  import('./audioManager.js').then((m) => m.playWin()).catch(() => {});
}
