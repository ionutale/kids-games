import { clampPercent } from './geometry.js';

export const SAVE_KEY = 'kids-games-stickers';
export const SAVE_VERSION = 1;

function emptySave() {
  return { version: SAVE_VERSION, worlds: {} };
}

function readAll(storage) {
  try {
    const raw = storage?.getItem?.(SAVE_KEY);
    if (!raw) return emptySave();

    const data = JSON.parse(raw);
    if (
      !data ||
      data.version !== SAVE_VERSION ||
      typeof data.worlds !== 'object' ||
      data.worlds === null ||
      Array.isArray(data.worlds)
    ) {
      return emptySave();
    }

    return { version: SAVE_VERSION, worlds: { ...data.worlds } };
  } catch {
    return emptySave();
  }
}

export function loadWorld(storage, worldId, isKnownType = () => true) {
  const data = readAll(storage);
  const placed = data.worlds?.[worldId]?.placed;
  if (!Array.isArray(placed)) return [];

  return placed
    .filter(
      (placement) =>
        placement &&
        typeof placement.id === 'string' &&
        typeof placement.type === 'string' &&
        Number.isFinite(placement.x) &&
        Number.isFinite(placement.y) &&
        isKnownType(placement.type)
    )
    .map((placement) => ({
      id: placement.id,
      type: placement.type,
      x: clampPercent(placement.x),
      y: clampPercent(placement.y)
    }));
}

export function saveWorld(storage, worldId, placed) {
  if (!storage?.setItem) return;

  const data = readAll(storage);
  data.worlds = {
    ...data.worlds,
    [worldId]: {
      placed: placed.map((placement) => ({
        id: placement.id,
        type: placement.type,
        x: clampPercent(placement.x),
        y: clampPercent(placement.y)
      }))
    }
  };

  storage.setItem(SAVE_KEY, JSON.stringify(data));
}
