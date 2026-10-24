export const FRAME_WINDOW_MS = 10000;

export function addFrame(frames, now, dt, windowMs = FRAME_WINDOW_MS) {
  const next = [...frames, { t: now, dt }];
  while (next.length && now - next[0].t > windowMs) next.shift();
  return next;
}

export function frameStats(frames) {
  if (!frames.length) return { fps: 0, p95: 0, worst: 0 };

  let sum = 0;
  let worst = 0;
  for (const frame of frames) {
    sum += frame.dt;
    if (frame.dt > worst) worst = frame.dt;
  }

  const sorted = frames.map((frame) => frame.dt).sort((a, b) => a - b);
  const avgMs = sum / frames.length;

  return {
    fps: avgMs > 0 ? 1000 / avgMs : 0,
    p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
    worst
  };
}
