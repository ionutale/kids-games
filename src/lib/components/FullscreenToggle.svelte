<script>
  let isFullscreen = $state(false);
  let supported = $state(true);

  function sync() {
    isFullscreen = !!document.fullscreenElement;
  }

  function toggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  if (typeof document !== 'undefined') {
    supported = typeof document.documentElement?.requestFullscreen === 'function';
    document.addEventListener('fullscreenchange', sync);
  }
</script>

{#if supported}
  <button class="fullscreen-btn" onclick={toggle} aria-label="Fullscreen">
    {isFullscreen ? '🗗' : '⛶'}
  </button>
{/if}

<style>
  .fullscreen-btn {
    width: var(--touch-min);
    height: var(--touch-min);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    border-radius: 50%;
    background: rgba(255,255,255,0.8);
  }
</style>
