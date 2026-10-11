<script>
  import { onDestroy } from 'svelte';

  // A continuous 3s press is the only way through: too long for a toddler to
  // hold by accident, but easy for a parent. The ring's dash offset is driven
  // by a rAF loop off the hold's start timestamp.
  const HOLD_MS = 3000;
  const R = 46;
  const CIRC = 2 * Math.PI * R;

  let { onpass, children } = $props();

  let progress = $state(0);
  let holding = $state(false);
  let rafId = null;
  let startTime = 0;
  let fired = false;

  const dashOffset = $derived(CIRC * (1 - progress));

  function tick(now) {
    const p = Math.min(1, (now - startTime) / HOLD_MS);
    progress = p;
    if (p >= 1) {
      // Fire once per hold, then snap the ring back so the next press starts
      // clean. `finally` guarantees the hold is released even if `onpass` throws
      // — otherwise `holding` would stay true and the gate would lock forever.
      try {
        if (!fired) {
          fired = true;
          onpass?.();
        }
      } finally {
        stop();
      }
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function start(e) {
    if (holding) return;
    e.preventDefault();
    holding = true;
    fired = false;
    startTime = performance.now();
    progress = 0;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    holding = false;
    cancelAnimationFrame(rafId);
    rafId = null;
    progress = 0;
  }

  // iOS pops the selection/context menu on a long press; suppress it only while
  // the hold is actually in progress.
  function handleContext(e) {
    if (holding) e.preventDefault();
  }

  onDestroy(() => cancelAnimationFrame(rafId));
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="gp-gate"
  onpointerdown={start}
  onpointerup={stop}
  onpointercancel={stop}
  onpointerleave={stop}
  oncontextmenu={handleContext}
>
  {@render children?.()}

  <svg class="gp-gate-ring" viewBox="0 0 100 100" aria-hidden="true">
    <circle class="gp-gate-ring-track" cx="50" cy="50" r={R} />
    <circle
      class="gp-gate-ring-fill"
      cx="50"
      cy="50"
      r={R}
      style="stroke-dasharray: {CIRC}; stroke-dashoffset: {dashOffset}"
    />
  </svg>
</div>

<style>
  .gp-gate {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    cursor: pointer;
  }
  .gp-gate-ring {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .gp-gate-ring circle {
    fill: none;
    stroke-width: 6;
  }
  .gp-gate-ring-track {
    stroke: rgba(255, 255, 255, 0.15);
  }
  .gp-gate-ring-fill {
    stroke: var(--accent, #5eead4);
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
  }
</style>
