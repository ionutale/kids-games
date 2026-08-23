// Puzzle-specific sounds loaded from CC0 audio files (Freesound — see docs/free-assets.md)

import { get } from 'svelte/store';
import { settings } from '$lib/stores/settings.js';

const sounds = {};
let loaded = false;

const DRAG_VOLUME = 0.12;
const DRAG_FADE_MS = 100;
let dragAudio = null;

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
    loadSound('drag', '/sounds/drag-loop.mp3'),
  ]);
}

function play(id, volume = 0.5) {
  if (!get(settings).soundEnabled) return;
  const audio = sounds[id];
  if (!audio) return;
  try {
    const clone = audio.cloneNode();
    clone.volume = volume;
    clone.play().catch(() => {});
  } catch {}
}

function fadeOutAndPause(audio) {
  const step = DRAG_FADE_MS / 4;
  let elapsed = 0;
  const timer = setInterval(() => {
    elapsed += step;
    if (elapsed >= DRAG_FADE_MS || !get(settings).soundEnabled) {
      clearInterval(timer);
      try { audio.pause(); } catch {}
      return;
    }
    audio.volume = Math.max(0, audio.volume - DRAG_VOLUME / 4);
  }, step);
}

export function startDragLoop() {
  if (!get(settings).soundEnabled) return;
  stopDragLoop();
  const base = sounds['drag'];
  if (!base) return;
  try {
    const a = base.cloneNode();
    a.loop = true;
    a.volume = DRAG_VOLUME;
    dragAudio = a;
    a.play().catch(() => { dragAudio = null; });
  } catch {
    dragAudio = null;
  }
}

export function stopDragLoop() {
  if (!dragAudio) return;
  const a = dragAudio;
  dragAudio = null;
  try {
    fadeOutAndPause(a);
  } catch {
    try { a.pause(); } catch {}
  }
}

export function playPickup() { play('pickup', 0.45); }
export function playSnap() { play('snap', 0.6); }
export function playVictory() { play('victory', 0.6); }
export function playNudge() { play('nudge', 0.3); }
export function playTap() { play('tap', 0.3); }
