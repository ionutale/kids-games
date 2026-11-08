/** Parse a hidden `?seed=` value for deterministic tests and debugging. */
export function seedFromUrl(url) {
  const raw = url?.searchParams?.get?.('seed');
  if (raw == null || raw === '') return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  const seed = Math.abs(Math.floor(value)) % 1000000;
  return seed || 1;
}

/** A fresh non-zero seed for production rounds. */
export function makeSeed(prefix = 1) {
  const mixed = (Date.now() ^ (Math.floor(prefix) * 2654435761)) >>> 0;
  return mixed || 1;
}
