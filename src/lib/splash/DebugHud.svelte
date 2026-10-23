<script>
  import { onMount } from 'svelte';

  let { liveCount = 0, cap = 0, measureStart = 0 } = $props();

  const WINDOW_MS = 10000;
  const PAINT_MS = 250;
  const IGNORE_FRAME_MS = 1000;

  let fps = $state(0);
  let p95 = $state(0);
  let worst = $state(0);
  let peak = $state(0);

  let frames = [];
  let startSeen = 0;
  let lastPaint = 0;
  let last = 0;

  function pushFrame(now, dt) {
    if (dt <= 0 || dt > IGNORE_FRAME_MS) {
      frames = [];
      return;
    }
    frames.push({ t: now, dt });
    while (frames.length && now - frames[0].t > WINDOW_MS) frames.shift();
  }

  function paint(now) {
    if (!frames.length) return;

    let sum = 0;
    for (const frame of frames) sum += frame.dt;
    const avgMs = sum / frames.length;
    const sorted = frames.map((frame) => frame.dt).sort((a, b) => a - b);

    fps = avgMs > 0 ? 1000 / avgMs : 0;
    p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    lastPaint = now;
  }

  onMount(() => {
    last = performance.now();
    let raf;

    function tick(now) {
      const dt = now - last;
      last = now;

      if (measureStart > 0) {
        if (measureStart !== startSeen) {
          startSeen = measureStart;
          frames = [];
          worst = 0;
          peak = 0;
          lastPaint = 0;
        }

        if (dt > 0 && dt <= IGNORE_FRAME_MS) {
          pushFrame(now, dt);
          if (dt > worst) worst = dt;
          if (liveCount > peak) peak = liveCount;
          if (now - lastPaint >= PAINT_MS) paint(now);
        } else if (dt > IGNORE_FRAME_MS) {
          frames = [];
        }
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

  const fpsText = $derived(fps > 0 ? fps.toFixed(1) : '—');
  const p95Text = $derived(p95 > 0 ? `${Math.round(p95)}ms` : '—');
  const worstText = $derived(worst > 0 ? `${Math.round(worst)}ms` : '—');
</script>

<div class="debug-hud" data-testid="debug-hud" aria-hidden="true">
  <span>FPS {fpsText}</span>
  <span>p95 {p95Text}</span>
  <span>worst {worstText}</span>
  <span>live {liveCount}/{cap}</span>
  <span>peak {peak}/{cap}</span>
</div>

<style>
  .debug-hud {
    position: absolute;
    left: 8px;
    bottom: calc(8px + var(--safe-bottom));
    z-index: 100;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    max-width: calc(100% - 16px);
    padding: 8px 10px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.72);
    color: #e5e7eb;
    font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
    pointer-events: none;
    user-select: none;
  }
</style>
