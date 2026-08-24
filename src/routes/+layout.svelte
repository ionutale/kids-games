<script>
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import '../app.css';

  let { children } = $props();
  let showInstall = $state(false);
  let deferredPrompt = null;

  onMount(() => {
    settings.markVisited();
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstall = true;
    });
    window.addEventListener('appinstalled', () => {
      showInstall = false;
    });

    // When a new service worker takes over (post-deploy), reload once so the
    // app shell always matches the routes — prevents stale-shell dead buttons.
    if ('serviceWorker' in navigator) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        location.reload();
      });
    }
  });

  async function installApp() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') showInstall = false;
      deferredPrompt = null;
    }
  }
</script>

<div class="shell">
  <main class="game-area">
    {@render children()}
  </main>

  {#if showInstall}
    <div class="install-banner">
      <span>{$_('install')}</span>
      <button class="install-btn" onclick={installApp}>{$_('installBtn')}</button>
      <button class="dismiss-btn" onclick={() => showInstall = false}>&times;</button>
    </div>
  {/if}
</div>

<style>
  .shell {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    width: 100dvw;
    position: fixed;
    inset: 0;
    overflow: hidden;
  }
  .game-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }
  .install-banner {
    position: fixed;
    bottom: calc(16px + var(--safe-bottom));
    left: 16px;
    right: 16px;
    background: white;
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 200;
    font-size: 16px;
    font-weight: 600;
  }
  .install-btn {
    margin-left: auto;
    padding: 8px 20px;
    background: var(--color-primary);
    color: white;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
  }
  .dismiss-btn {
    font-size: 20px;
    padding: 4px 8px;
    color: #999;
  }
</style>
