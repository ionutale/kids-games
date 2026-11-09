<script>
  import { onMount } from 'svelte';
  import { dev } from '$app/env';
  import { setupServiceWorker } from '#lib/pwa/serviceWorker.js';
  import { settings } from '#lib/stores/settings.js';
  import { _ } from '#lib/stores/locale.js';
  import '../app.css';

  let { children } = $props();
  let showInstall = $state(false);
  let deferredPrompt = null;

  onMount(() => {
    settings.markVisited();

    const onBeforeInstall = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstall = true;
    };
    const onInstalled = () => {
      showInstall = false;
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // Production only: `vite dev` has no sw.js. One registration precaches the
    // whole build; the helper re-checks on focus/visibility so a long-lived tab
    // picks up a new shell, and reloads once when the worker takes over.
    const cleanupServiceWorker = setupServiceWorker({
      isDev: dev,
      reload: () => location.reload()
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      cleanupServiceWorker();
    };
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

      <button
        class="dismiss-btn"
        onclick={() => showInstall = false}
      >×</button>
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
