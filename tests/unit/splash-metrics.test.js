import { describe, it, expect } from 'vitest';
import { addFrame, frameStats, FRAME_WINDOW_MS } from '#lib/splash/metrics.js';

describe('Splash frame metrics', () => {
  it('uses a 10-second frame window', () => {
    expect(FRAME_WINDOW_MS).toBe(10000);
  });

  it('includes a long frame in p95 and worst', () => {
    let frames = [];
    frames = addFrame(frames, 0, 16);
    frames = addFrame(frames, 16, 16);
    frames = addFrame(frames, 32, 1200);

    const stats = frameStats(frames);
    expect(stats.worst).toBe(1200);
    expect(stats.p95).toBe(1200);
  });

  it('prunes frames older than the window', () => {
    let frames = [];
    frames = addFrame(frames, 0, 16);
    frames = addFrame(frames, 5000, 16);
    frames = addFrame(frames, 10001, 16);

    expect(frames).toHaveLength(2);
    expect(frames[0].t).toBe(5000);
  });

  it('computes fps from the mean frame time', () => {
    let frames = [];
    frames = addFrame(frames, 0, 16);
    frames = addFrame(frames, 16, 16);
    frames = addFrame(frames, 32, 16);

    expect(frameStats(frames).fps).toBeCloseTo(62.5, 5);
  });

  it('returns zeroed stats for an empty window', () => {
    expect(frameStats([])).toEqual({ fps: 0, p95: 0, worst: 0 });
  });
});
