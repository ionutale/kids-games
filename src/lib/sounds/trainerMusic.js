let current = null;

export function musicUrl(trainerId) {
  return `/sounds/music/${trainerId}.mp3`;
}

export function startTrainerMusic(trainerId) {
  if (typeof globalThis.Audio !== 'function') return null;
  if (current && current.trainerId === trainerId) return current.audio;
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
  const p = audio.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
  current = { trainerId, audio };
  return audio;
}

export function stopTrainerMusic() {
  if (!current) return;
  try {
    current.audio.pause();
  } catch {}
  current = null;
}
