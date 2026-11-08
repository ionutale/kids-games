<script>
  import { onMount } from 'svelte';
  import { addFrame, frameStats } from '#lib/splash/metrics.js';

  let { liveCount = 0, cap = 0, measureStart = 0, dragging = false } = $props();

  const PAINT_MS = 250;

  let fps = $state(0);
  let p95 = $state(0);
  let worst = $state(0);
  let peak = $state(0);

  let frames = [];
  let startSeen = 0;
  let lastPaint = 0;
  let last = 0;
  let hidden = false;

  onMount(() => {
    last = performance.now();
    let raf;

    function onVisibility() {
      if (!document.hidden) return;
      hidden = true;
      frames = [];
    }

    function tick(now) {
      const dt = now - last;
      last = now;

      // rAF pauses while the tab is hidden. Skip exactly one frame after it
      // returns: that gap is a tab switch, not a game frame. Every other gap,
      // however large, counts toward FPS, p95, and worst.
      if (hidden) {
        if (document.hidden) {
          raf = requestAnimationFrame(tick);
          return;
        }
        hidden = false;
        frames = [];
        raf = requestAnimationFrame(tick);
        return;
      }

      if (measureStart > 0) {
        if (measureStart !== startSeen) {
          startSeen = measureStart;
          frames = [];
          worst = 0;
          peak = 0;
          lastPaint = 0;
        }

        // Record only while the finger is down, then freeze. The tester can
        // release and read the drag's numbers without idle frames flattering them.
        if (dragging && dt > 0) {
          frames = addFrame(frames, now, dt);
          if (dt > worst) worst = dt;
          if (liveCount > peak) peak = liveCount;

          if (now - lastPaint >= PAINT_MS) {
            const stats = frameStats(frames);
            fps = stats.fps;
            p95 = stats.p95;
            lastPaint = now;
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }

    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
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
