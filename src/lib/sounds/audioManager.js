let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playTap() {
  playTone(600, 0.08, 'sine', 0.2);
}

export function playPop() {
  playTone(400, 0.1, 'sine', 0.25);
  setTimeout(() => playTone(600, 0.1, 'sine', 0.2), 60);
}

export function playMatch() {
  playTone(523, 0.15, 'sine', 0.2);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 100);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.2), 200);
}

export function playWin() {
  const notes = [523, 587, 659, 784, 880, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, 'sine', 0.2), i * 80);
  });
}

export function playError() {
  playTone(200, 0.2, 'sawtooth', 0.15);
}

export function playSplash() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      playTone(300 + Math.random() * 400, 0.3, 'sine', 0.1);
    }, i * 50);
  }
}

export function playGoal() {
  playWin();
  setTimeout(() => playTone(1047, 0.4, 'triangle', 0.3), 400);
}

export function vibrate(pattern = 30) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
