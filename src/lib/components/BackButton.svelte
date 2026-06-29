<script>
  import { goto } from '$app/navigation';

  let { to = '/' } = $props();
  let pressTimer = null;
  let pressing = $state(false);

  function startPress() {
    pressing = true;
    pressTimer = setTimeout(() => {
      goto(to);
      pressing = false;
    }, 1500);
  }

  function cancelPress() {
    pressing = false;
    if (pressTimer) clearTimeout(pressTimer);
  }
</script>

<button
  class="back-btn"
  ontouchstart={startPress}
  ontouchend={cancelPress}
  ontouchcancel={cancelPress}
  onmousedown={startPress}
  onmouseup={cancelPress}
  onmouseleave={cancelPress}
  aria-label="Back to games"
>
  <span class="arrow">&#8592;</span>
  {#if pressing}
    <div class="progress">
      <div class="progress-fill"></div>
    </div>
  {/if}
</button>

<style>
  .back-btn {
    position: relative;
    width: var(--touch-min);
    height: var(--touch-min);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255,255,255,0.8);
    font-size: 28px;
  }
  .arrow { pointer-events: none; }
  .progress {
    position: absolute;
    bottom: 4px;
    width: 32px;
    height: 3px;
    background: rgba(0,0,0,0.1);
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: var(--color-primary);
    animation: fill 1.5s linear forwards;
  }
  @keyframes fill {
    from { width: 0%; }
    to { width: 100%; }
  }
</style>
