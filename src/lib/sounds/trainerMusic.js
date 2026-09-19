import { get } from 'svelte/store';
import { settings } from '$lib/stores/settings.js';

let current = null;

function playSafely(audio) {
  const p = audio.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}

// The theme loop obeys the existing SoundToggle: mute pauses it, unmute resumes it.
settings.subscribe((s) => {
  if (!current) return;
  if (s.soundEnabled) {
    playSafely(current.audio);
  } else {
    try { current.audio.pause(); } catch {}
  }
});

export function musicUrl(trainerId) {
  return `/sounds/music/${trainerId}.mp3`;
}

export function startTrainerMusic(trainerId) {
  if (typeof globalThis.Audio !== 'function') return null;
  if (current && current.trainerId === trainerId) {
    if (get(settings).soundEnabled && current.audio.paused) playSafely(current.audio);
    return current.audio;
  }
  stopTrainerMusic();
  let audio;
  try {
    audio = new Audio(musicUrl(trainerId));
  } catch {
    return null;
  }
  audio.loop = true;
  audio.volume = 0.2;
  audio.trainerId = trainerId;
  current = { trainerId, audio };
  if (get(settings).soundEnabled) playSafely(audio);
  return audio;
}

export function stopTrainerMusic() {
  if (!current) return;
  try {
    current.audio.pause();
  } catch {}
  current = null;
}
