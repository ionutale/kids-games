let ctx = null;

function audioCtx() {
  if (ctx !== null) return ctx;
  try {
    const AC = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;
    ctx = AC ? new AC() : false;
  } catch {
    ctx = false;
  }
  return ctx;
}

function tone(freq, dur, gain = 0.14, delay = 0) {
  const ac = audioCtx();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Rising musical tone per pad (see PADS[].tone). */
export function playPadTone(freq) {
  tone(freq, 0.28);
}

/** Gentle "try again" — soft low note, not punitive. */
export function playRetryTone() {
  tone(220, 0.25, 0.1);
}
