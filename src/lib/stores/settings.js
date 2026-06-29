import { writable } from 'svelte/store';

const STORAGE_KEY = 'kids-games-settings';

function createSettings() {
  const stored = typeof localStorage !== 'undefined'
    ? JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    : null;

  const { subscribe, set, update } = writable({
    soundEnabled: stored?.soundEnabled ?? true,
    ageLevel: stored?.ageLevel ?? 3,
    firstVisit: stored?.firstVisit ?? true
  });

  return {
    subscribe,
    toggleSound: () => update(s => {
      const next = { ...s, soundEnabled: !s.soundEnabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    }),
    setAge: (level) => update(s => {
      const next = { ...s, ageLevel: level };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    }),
    markVisited: () => update(s => {
      const next = { ...s, firstVisit: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    })
  };
}

export const settings = createSettings();
