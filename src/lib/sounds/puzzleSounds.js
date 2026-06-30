// Puzzle-specific sounds loaded from Mixkit CC0 audio files

const sounds = {};
let loaded = false;

function loadSound(id, url) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.oncanplaythrough = () => { sounds[id] = audio; resolve(); };
    audio.onerror = () => resolve(); // fail silently
    audio.src = url;
    audio.load();
  });
}

export async function loadPuzzleSounds() {
  if (loaded) return;
  loaded = true;
  await Promise.all([
    loadSound('pickup', '/sounds/pickup.mp3'),
    loadSound('snap', '/sounds/snap.mp3'),
    loadSound('victory', '/sounds/victory.mp3'),
    loadSound('nudge', '/sounds/nudge.mp3'),
    loadSound('tap', '/sounds/tap.mp3'),
  ]);
}

function play(id, volume = 0.5) {
  const audio = sounds[id];
  if (!audio) return;
  try {
    const clone = audio.cloneNode();
    clone.volume = volume;
    clone.play().catch(() => {});
  } catch {}
}

export function playPickup() { play('pickup', 0.4); }
export function playSnap() { play('snap', 0.5); }
export function playVictory() { play('victory', 0.6); }
export function playNudge() { play('nudge', 0.3); }
export function playTap() { play('tap', 0.3); }
