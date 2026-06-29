# Kids Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 8 mobile touch games for ages 2-5 as a PWA.

**Architecture:** SvelteKit static export with PWA. Each game is a route under `/games/<name>`. A shared shell provides back navigation, sound toggle, and auto-fullscreen. Games share stores (settings, audio), utils (touch, animation, confetti), and components (BackButton, SoundToggle, StarBurst, Confetti, AgeSelector).

**Tech Stack:** Svelte 5, SvelteKit, Vite, `vite-plugin-pwa`, `@sveltejs/adapter-static`, Web Audio API.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `svelte.config.js`
- Create: `vite.config.js`
- Create: `static/manifest.json`
- Create: `static/icons/icon-192.svg`
- Create: `static/icons/icon-512.svg`
- Create: `src/app.css`
- Create: `src/app.html` (overwrite default)

- [ ] **Step 1: Initialize SvelteKit project**

```bash
npm create svelte@latest . -- --template skeleton --no-add-ons --no-install
```

Choose: Skeleton project, no TypeScript, no ESLint, no Prettier.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install --save-dev @sveltejs/adapter-static vite-plugin-pwa
```

- [ ] **Step 3: Write `svelte.config.js`**

```js
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: true
    })
  }
};

export default config;
```

- [ ] **Step 4: Write `vite.config.js`**

```js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*'],
      manifest: {
        name: 'Kids Games',
        short_name: 'KidsGames',
        description: 'Touch games for ages 2-5',
        theme_color: '#4FC3F7',
        background_color: '#E3F2FD',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}']
      }
    })
  ]
});
```

- [ ] **Step 5: Write `static/manifest.json`**

```json
{
  "name": "Kids Games",
  "short_name": "KidsGames",
  "description": "Touch games for ages 2-5",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#4FC3F7",
  "background_color": "#E3F2FD",
  "icons": [
    { "src": "/icons/icon-192.svg", "sizes": "192x192", "type": "image/svg+xml" },
    { "src": "/icons/icon-512.svg", "sizes": "512x512", "type": "image/svg+xml" }
  ]
}
```

- [ ] **Step 6: Write icon SVGs**

`static/icons/icon-192.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="32" fill="#4FC3F7"/>
  <text x="96" y="120" font-size="80" text-anchor="middle" fill="white">🎮</text>
</svg>
```

`static/icons/icon-512.svg` (same but 512x512 with font-size 200).

- [ ] **Step 7: Write `src/app.css`**

```css
:root {
  --color-primary: #4FC3F7;
  --color-secondary: #FFB74D;
  --color-success: #81C784;
  --color-bg: #E3F2FD;
  --color-text: #333;
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --touch-min: 60px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  overscroll-behavior: none;
  user-select: none;
  -webkit-user-select: none;
}

body {
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
}

button { 
  font-family: inherit; 
  cursor: pointer;
  border: none;
  background: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

- [ ] **Step 8: Update `src/app.html`**

Replace default with:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/icons/icon-192.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#4FC3F7" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <link rel="apple-touch-icon" href="%sveltekit.assets%/icons/icon-192.svg" />
    %sveltekit.head%
  </head>
  <body>
    <div style="display: contents;">%sveltekit.body%</div>
  </body>
</html>
```

- [ ] **Step 9: Remove default routes and test files**

```bash
rm -rf src/routes/styles.css 2>/dev/null; true
```

- [ ] **Step 10: Build and verify it compiles**

```bash
npm run build
```
Expected: build succeeds, outputs to `build/` directory.

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "feat: scaffold SvelteKit + PWA project"
```

---

### Task 2: Settings Store + Audio Manager

**Files:**
- Create: `src/lib/stores/settings.js`
- Create: `src/lib/sounds/audioManager.js`
- Create: `src/lib/sounds/` (directory)

- [ ] **Step 1: Write `src/lib/stores/settings.js`**

```js
import { writable } from 'svelte/store';

const STORAGE_KEY = 'kids-games-settings';

function createSettings() {
  const stored = typeof localStorage !== 'undefined'
    ? JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    : null;

  const { subscribe, set, update } = writable({
    soundEnabled: stored?.soundEnabled ?? true,
    ageLevel: stored?.ageLevel ?? 3,
    firstVisit: stored?.firstVisit ?? true
  });

  return {
    subscribe,
    toggleSound: () => update(s => {
      const next = { ...s, soundEnabled: !s.soundEnabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    }),
    setAge: (level) => update(s => {
      const next = { ...s, ageLevel: level };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    }),
    markVisited: () => update(s => {
      const next = { ...s, firstVisit: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    })
  };
}

export const settings = createSettings();
```

- [ ] **Step 2: Write `src/lib/sounds/audioManager.js`**

```js
let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playTap() {
  playTone(600, 0.08, 'sine', 0.2);
}

export function playPop() {
  playTone(400, 0.1, 'sine', 0.25);
  setTimeout(() => playTone(600, 0.1, 'sine', 0.2), 60);
}

export function playMatch() {
  playTone(523, 0.15, 'sine', 0.2);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.2), 100);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.2), 200);
}

export function playWin() {
  const notes = [523, 587, 659, 784, 880, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, 'sine', 0.2), i * 80);
  });
}

export function playError() {
  playTone(200, 0.2, 'sawtooth', 0.15);
}

export function playSplash() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      playTone(300 + Math.random() * 400, 0.3, 'sine', 0.1);
    }, i * 50);
  }
}

export function playGoal() {
  playWin();
  setTimeout(() => playTone(1047, 0.4, 'triangle', 0.3), 400);
}

export function vibrate(pattern = 30) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
```

- [ ] **Step 3: Verify imports work**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add settings store and audio manager"
```

---

### Task 3: Shared Components

**Files:**
- Create: `src/lib/components/BackButton.svelte`
- Create: `src/lib/components/SoundToggle.svelte`
- Create: `src/lib/components/StarBurst.svelte`
- Create: `src/lib/components/Confetti.svelte`
- Create: `src/lib/components/AgeSelector.svelte`

- [ ] **Step 1: Write `BackButton.svelte`**

```svelte
<script>
  import { goto } from '$app/navigation';
  import { settings } from '$lib/stores/settings';

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
  <span class="arrow">←</span>
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
```

- [ ] **Step 2: Write `SoundToggle.svelte`**

```svelte
<script>
  import { settings } from '$lib/stores/settings';

  let soundOn = $derived($settings.soundEnabled);
</script>

<button
  class="sound-btn"
  onclick={() => settings.toggleSound()}
  aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
>
  {soundOn ? '🔊' : '🔇'}
</button>

<style>
  .sound-btn {
    width: var(--touch-min);
    height: var(--touch-min);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    border-radius: 50%;
    background: rgba(255,255,255,0.8);
  }
</style>
```

- [ ] **Step 3: Write `StarBurst.svelte`**

```svelte
<script>
  import { onMount } from 'svelte';

  let { x = 50, y = 50 } = $props();
  let particles = $state([]);

  onMount(() => {
    const count = 8;
    const items = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = 40 + Math.random() * 30;
      items.push({
        id: i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 6 + Math.random() * 8,
        color: ['#FFB74D','#4FC3F7','#81C784','#E57373','#BA68C8','#FFD54F'][i % 6],
        delay: Math.random() * 0.1
      });
    }
    particles = items;
    setTimeout(() => particles = [], 600);
  });
</script>

{#each particles as p (p.id)}
  <div
    class="star"
    style:--dx="{p.dx}px"
    style:--dy="{p.dy}px"
    style:--size="{p.size}px"
    style:--color="{p.color}"
    style:--delay="{p.delay}s"
  ></div>
{/each}

<style>
  .star {
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--size);
    height: var(--size);
    background: var(--color);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: burst 0.5s ease-out forwards;
    animation-delay: var(--delay);
    pointer-events: none;
  }
  @keyframes burst {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0); opacity: 0; }
  }
</style>
```

- [ ] **Step 4: Write `Confetti.svelte`**

```svelte
<script>
  import { onMount } from 'svelte';

  let pieces = $state([]);

  onMount(() => {
    const count = 30;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 1.5,
        color: ['#FFB74D','#4FC3F7','#81C784','#E57373','#BA68C8','#FFD54F'][i % 6],
        rotation: Math.random() * 360,
        size: 6 + Math.random() * 6
      });
    }
    pieces = items;
  });
</script>

<div class="confetti-container">
  {#each pieces as p (p.id)}
    <div
      class="piece"
      style:--x="{p.x}%"
      style:--delay="{p.delay}s"
      style:--duration="{p.duration}s"
      style:--color="{p.color}"
      style:--rotation="{p.rotation}deg"
      style:--size="{p.size}px"
    ></div>
  {/each}
</div>

<style>
  .confetti-container {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 100;
    overflow: hidden;
  }
  .piece {
    position: absolute;
    top: -20px;
    left: var(--x);
    width: var(--size);
    height: var(--size);
    background: var(--color);
    border-radius: 2px;
    animation: fall var(--duration) ease-in forwards;
    animation-delay: var(--delay);
    transform: rotate(var(--rotation));
    opacity: 0;
  }
  @keyframes fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
</style>
```

- [ ] **Step 5: Write `AgeSelector.svelte`**

```svelte
<script>
  import { settings } from '$lib/stores/settings';

  let age = $derived($settings.ageLevel);
</script>

<div class="age-selector">
  <span class="label">Age:</span>
  <div class="slider-track">
    <input
      type="range"
      min="2"
      max="5"
      step="1"
      value={age}
      oninput={(e) => settings.setAge(parseInt(e.target.value))}
      aria-label="Select age level"
    />
  </div>
  <span class="value">{age}</span>
</div>

<style>
  .age-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255,255,255,0.8);
    border-radius: 20px;
    font-size: 16px;
  }
  .label { font-weight: 600; }
  .slider-track {
    width: 80px;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
  }
  input[type="range"] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .value {
    font-weight: 700;
    font-size: 18px;
    min-width: 20px;
    text-align: center;
    color: var(--color-primary);
  }
</style>
```

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: add shared UI components"
```

---

### Task 4: Shell Layout

**Files:**
- Create: `src/routes/+layout.svelte`
- Create: `src/routes/+layout.js`

- [ ] **Step 1: Write `src/routes/+layout.js`**

```js
export const prerender = false;
export const ssr = false;
```

- [ ] **Step 2: Write `src/routes/+layout.svelte`**

```svelte
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { settings } from '$lib/stores/settings';
  import BackButton from '$lib/components/BackButton.svelte';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import '../app.css';

  let { children } = $props();
  let isGame = $derived($page.url.pathname.startsWith('/games'));
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
  {#if isGame}
    <header class="top-bar">
      <BackButton />
      <SoundToggle />
    </header>
  {/if}

  <main class="game-area">
    {@render children()}
  </main>

  {#if showInstall}
    <div class="install-banner">
      <span>Install Kids Games</span>
      <button class="install-btn" onclick={installApp}>Install</button>
      <button class="dismiss-btn" onclick={() => showInstall = false}>×</button>
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
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    padding-top: calc(8px + var(--safe-top));
    z-index: 10;
    flex-shrink: 0;
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
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add app shell layout with fullscreen and install prompt"
```

---

### Task 5: Game Hub (Home Page)

**Files:**
- Create: `src/routes/+page.svelte`

- [ ] **Step 1: Write `src/routes/+page.svelte`**

```svelte
<script>
  import { goto } from '$app/navigation';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import AgeSelector from '$lib/components/AgeSelector.svelte';
  import { settings } from '$lib/stores/settings';
  import { onMount } from 'svelte';

  const games = [
    { id: 'paint', icon: '🎨', label: 'Paint' },
    { id: 'stickers', icon: '🌟', label: 'Stickers' },
    { id: 'memory', icon: '🧠', label: 'Memory' },
    { id: 'puzzle', icon: '🧩', label: 'Puzzle' },
    { id: 'pop', icon: '🫧', label: 'Pop' },
    { id: 'soccer', icon: '⚽', label: 'Soccer' },
    { id: 'sorting', icon: '📦', label: 'Sorting' },
    { id: 'splash', icon: '🌈', label: 'Splash' }
  ];

  let showSettings = $state(false);
  let settingsTimer = null;

  function onSettingsPress() {
    settingsTimer = setTimeout(() => {
      showSettings = true;
    }, 3000);
  }

  function cancelSettings() {
    if (settingsTimer) clearTimeout(settingsTimer);
  }

  function goToGame(id) {
    goto(`/games/${id}`);
  }

  onMount(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {}
  });
</script>

<div class="hub">
  <h1 class="title">🎮 Kids Games</h1>

  <div class="grid">
    {#each games as game (game.id)}
      <button class="game-btn" onclick={() => goToGame(game.id)}>
        <span class="icon">{game.icon}</span>
        <span class="label">{game.label}</span>
      </button>
    {/each}
  </div>

  {#if showSettings}
    <div class="settings-bar">
      <SoundToggle />
      <AgeSelector />
      <button class="close-settings" onclick={() => showSettings = false}>Done</button>
    </div>
  {:else}
    <button
      class="settings-trigger"
      ontouchstart={onSettingsPress}
      ontouchend={cancelSettings}
      onmousedown={onSettingsPress}
      onmouseup={cancelSettings}
      onmouseleave={cancelSettings}
    >
      ⚙️
    </button>
  {/if}
</div>

<style>
  .hub {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;
    gap: 24px;
  }
  .title {
    font-size: 32px;
    text-align: center;
    color: #333;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;
    max-width: 400px;
  }
  .game-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 20px 16px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    min-height: 110px;
    transition: transform 0.15s;
  }
  .game-btn:active { transform: scale(0.95); }
  .icon { font-size: 40px; }
  .label { font-size: 14px; font-weight: 600; color: #666; }
  .settings-trigger {
    font-size: 28px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255,255,255,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.5;
  }
  .settings-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  }
  .close-settings {
    padding: 6px 16px;
    background: var(--color-primary);
    color: white;
    border-radius: 16px;
    font-weight: 600;
    font-size: 14px;
  }
</style>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add game hub launcher with settings"
```

---

### Task 6: Game — Paint

**Files:**
- Create: `src/routes/games/paint/+page.svelte`

- [ ] **Step 1: Write `src/routes/games/paint/+page.svelte`**

```svelte
<script>
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { playTap, playSplash } from '$lib/sounds/audioManager';
  import StarBurst from '$lib/components/StarBurst.svelte';

  let canvasEl;
  let ctx;
  let isDrawing = $state(false);
  let currentColor = $state('#FF6B6B');
  let currentSize = $state('big');
  let mode = $state('brush');
  let bursts = $state([]);

  const colors = ['#FF6B6B', '#4FC3F7', '#81C784', '#FFD54F', '#BA68C8', '#FF8A65'];
  const stamps = ['⭐', '❤️', '🐱', '🐶', '🦋', '🌻'];

  $effect(() => {
    if (canvasEl) {
      ctx = canvasEl.getContext('2d');
      resizeCanvas();
      canvasEl.addEventListener('touchstart', startDraw, { passive: false });
      canvasEl.addEventListener('touchmove', draw, { passive: false });
      canvasEl.addEventListener('touchend', endDraw);
      canvasEl.addEventListener('mousedown', startDraw);
      canvasEl.addEventListener('mousemove', draw);
      canvasEl.addEventListener('mouseup', endDraw);
      canvasEl.addEventListener('mouseleave', endDraw);
    }
  });

  function resizeCanvas() {
    if (!canvasEl) return;
    const rect = canvasEl.parentElement.getBoundingClientRect();
    canvasEl.width = rect.width * 2;
    canvasEl.height = rect.height * 2;
    canvasEl.style.width = rect.width + 'px';
    canvasEl.style.height = rect.height + 'px';
    ctx = canvasEl.getContext('2d');
    ctx.scale(2, 2);
  }

  function getPos(e) {
    const rect = canvasEl.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    if (mode === 'stamp') {
      ctx.font = `${currentSize === 'big' ? 48 : 30}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentColor, pos.x, pos.y);
      const id = Date.now();
      bursts = [...bursts, { id, x: (pos.x / canvasEl.parentElement.getBoundingClientRect().width) * 100, y: (pos.y / canvasEl.parentElement.getBoundingClientRect().height) * 100 }];
      setTimeout(() => bursts = bursts.filter(b => b.id !== id), 600);
      if ($settings.soundEnabled) playSplash();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = currentSize === 'big' ? 20 : currentSize === 'medium' ? 12 : 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
  }

  function draw(e) {
    e.preventDefault();
    if (!isDrawing || mode === 'stamp') return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function endDraw() {
    if (isDrawing && $settings.soundEnabled) playTap();
    isDrawing = false;
  }

  function clearCanvas() {
    if (!canvasEl) return;
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }
</script>

<div class="paint-game">
  <canvas bind:this={canvasEl} class="draw-canvas"></canvas>

  {#each bursts as b (b.id)}
    <div style="position:absolute; top:{b.y}%; left:{b.x}%;">
      <StarBurst />
    </div>
  {/each}

  <div class="toolbar">
    {#each colors as c}
      <button
        class="color-btn"
        style:background={c}
        class:active={currentColor === c}
        onclick={() => { currentColor = c; mode = 'brush'; }}
      ></button>
    {/each}
  </div>

  <div class="bottom-bar">
    <button class="mode-btn" onclick={() => mode = mode === 'brush' ? 'stamp' : 'brush'}>
      {mode === 'brush' ? '🖌️' : '⭐'}
    </button>
    {#if mode === 'brush'}
      {#each ['small', 'medium', 'big'] as s}
        <button class="size-btn" class:active={currentSize === s} onclick={() => currentSize = s}>
          {s === 'small' ? '─' : s === 'medium' ? '━' : '━━'}
        </button>
      {/each}
    {/if}
    <button class="clear-btn" onclick={clearCanvas}>🗑️</button>
  </div>
</div>

<style>
  .paint-game {
    display: flex;
    flex-direction: column;
    flex: 1;
    position: relative;
    background: white;
    overflow: hidden;
  }
  .draw-canvas {
    flex: 1;
    touch-action: none;
    cursor: crosshair;
  }
  .toolbar {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f5f5;
    flex-shrink: 0;
  }
  .color-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid transparent;
  }
  .color-btn.active { border-color: #333; }
  .bottom-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px 12px;
    padding-bottom: calc(8px + var(--safe-bottom));
    background: #f5f5f5;
    flex-shrink: 0;
  }
  .mode-btn, .clear-btn {
    font-size: 24px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: white;
  }
  .size-btn {
    font-size: 20px;
    padding: 4px 12px;
    border-radius: 8px;
    background: white;
    color: #999;
  }
  .size-btn.active { color: #333; font-weight: 700; background: #ddd; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Paint game with brush and stamp mode"
```

---

### Task 7: Game — Stickers

**Files:**
- Create: `src/routes/games/stickers/+page.svelte`

- [ ] **Step 1: Write `src/routes/games/stickers/+page.svelte`**

```svelte
<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playPop } from '$lib/sounds/audioManager';

  const scenes = ['🌿', '🌊', '🚀', '🦁'];
  const stickerSets = {
    '🌿': ['🐰', '🦊', '🐻', '🦋', '🌻', '🍎', '🌲', '🐝'],
    '🌊': ['🐟', '🐙', '🐳', '🦀', '🌊', '🐠', '🐡', '🪸'],
    '🚀': ['👨‍🚀', '🛸', '🌍', '⭐', '🌙', '☄️', '🛰️', '👾'],
    '🦁': ['🐘', '🦒', '🐆', '🦁', '🐒', '🦩', '🐍', '🦜']
  };

  let scene = $state('🌿');
  let placed = $state([]);
  let activeStickers = $state([]);
  let nextId = $state(0);

  $effect(() => {
    updateStickers();
  });

  function updateStickers() {
    const stickers = stickerSets[scene] || stickerSets['🌿'];
    const maxVisible = $settings.ageLevel <= 2 ? 4 : 8;
    activeStickers = stickers.slice(0, maxVisible);
  }

  function placeSticker(emoji) {
    const id = nextId++;
    placed = [...placed, { id, emoji, x: 50 + Math.random() * 30 - 15, y: 40 + Math.random() * 30 - 15 }];
    if ($settings.soundEnabled) playPop();
  }

  function clearAll() {
    placed = [];
    if ($settings.soundEnabled) playTap();
  }
</script>

<div class="stickers-game">
  <div class="scene-select">
    {#each scenes as s}
      <button class="scene-btn" class:active={scene === s} onclick={() => { scene = s; placed = []; }}>
        {s}
      </button>
    {/each}
  </div>

  <div class="scene-area" style="background: linear-gradient(135deg, #e8f5e9 0%, #fff3e0 100%);">
    {#each placed as p (p.id)}
      <span class="placed-sticker" style:left="{p.x}%" style:top="{p.y}%" style:font-size="{$settings.ageLevel <= 2 ? '48px' : '36px'}">
        {p.emoji}
      </span>
    {/each}
  </div>

  <div class="tray">
    {#each activeStickers as sticker}
      <button class="sticker-btn" onclick={() => placeSticker(sticker)}>
        {sticker}
      </button>
    {/each}
  </div>

  {#if placed.length > 0}
    <button class="clear-btn" onclick={clearAll}>🗑️</button>
  {/if}
</div>

<style>
  .stickers-game {
    display: flex;
    flex-direction: column;
    flex: 1;
    position: relative;
  }
  .scene-select {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    flex-shrink: 0;
  }
  .scene-btn {
    font-size: 28px;
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: rgba(255,255,255,0.7);
    transition: transform 0.15s;
  }
  .scene-btn.active { transform: scale(1.15); background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .scene-area {
    flex: 1;
    position: relative;
    margin: 8px;
    border-radius: 20px;
    overflow: hidden;
  }
  .placed-sticker {
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .tray {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    padding-bottom: calc(8px + var(--safe-bottom));
    flex-wrap: wrap;
    flex-shrink: 0;
    background: rgba(255,255,255,0.8);
  }
  .sticker-btn {
    font-size: 32px;
    width: 52px;
    height: 52px;
    border-radius: 12px;
    background: white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }
  .sticker-btn:active { transform: scale(1.2); }
  .clear-btn {
    position: absolute;
    bottom: calc(80px + var(--safe-bottom));
    right: 12px;
    font-size: 24px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Stickers game with scenes"
```

---

### Task 8: Game — Memory

**Files:**
- Create: `src/routes/games/memory/+page.svelte`

- [ ] **Step 1: Write `src/routes/games/memory/+page.svelte`**

```svelte
<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playMatch, playWin, playError } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  const emojis = ['🐶', '🐱', '🐰', '🐻', '🐸', '🐵', '🦊', '🐯', '🐭', '🐼', '🐨', '🦁'];

  let cards = $state([]);
  let flipped = $state([]);
  let matched = $state(new Set());
  let locked = $state(false);
  let won = $state(false);

  function initGame() {
    const pairs = $settings.ageLevel <= 2 ? 3 : $settings.ageLevel === 3 ? 4 : $settings.ageLevel === 4 ? 6 : 8;
    const selected = emojis.slice(0, pairs);
    const deck = [...selected, ...selected].map((emoji, i) => ({ id: i, emoji, flipped: false }));
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    cards = deck;
    flipped = [];
    matched = new Set();
    locked = false;
    won = false;
  }

  function flipCard(card) {
    if (locked || card.flipped || matched.has(card.id)) return;
    card.flipped = true;
    flipped = [...flipped, card.id];

    if ($settings.soundEnabled) playTap();

    if (flipped.length === 2) {
      locked = true;
      const [a, b] = flipped;
      if (cards[a].emoji === cards[b].emoji) {
        matched = new Set([...matched, a, b]);
        flipped = [];
        locked = false;
        if ($settings.soundEnabled) playMatch();
        if (matched.size === cards.length) {
          setTimeout(() => { won = true; if ($settings.soundEnabled) playWin(); }, 300);
        }
      } else {
        if ($settings.soundEnabled) playError();
        setTimeout(() => {
          cards[a].flipped = false;
          cards[b].flipped = false;
          cards = [...cards];
          flipped = [];
          locked = false;
        }, $settings.ageLevel <= 2 ? 1500 : 800);
      }
    }
  }

  let cols = $derived($settings.ageLevel <= 2 ? 3 : $settings.ageLevel <= 3 ? 4 : $settings.ageLevel <= 4 ? 4 : 4);

  initGame();
</script>

<div class="memory-game">
  <div class="grid" style:grid-template-columns="repeat({cols}, 1fr)">
    {#each cards as card (card.id)}
      <button
        class="card"
        class:flipped={card.flipped || matched.has(card.id)}
        class:matched={matched.has(card.id)}
        onclick={() => flipCard(card)}
      >
        <span class="card-front">{card.emoji}</span>
        <span class="card-back">❓</span>
      </button>
    {/each}
  </div>

  {#if won}
    <Confetti />
    <div class="win-overlay">
      <p class="win-text">Great job!</p>
      <button class="replay-btn" onclick={initGame}>Play Again</button>
    </div>
  {/if}
</div>

<style>
  .memory-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 16px;
  }
  .grid {
    display: grid;
    gap: 8px;
    width: 100%;
    max-width: 350px;
  }
  .card {
    aspect-ratio: 1;
    border-radius: 14px;
    font-size: 36px;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.3s;
  }
  .card.flipped { transform: rotateY(180deg); }
  .card.matched { opacity: 0.6; }
  .card-front, .card-back {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    backface-visibility: hidden;
  }
  .card-front {
    background: white;
    transform: rotateY(180deg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .card-back {
    background: linear-gradient(135deg, var(--color-primary), #81D4FA);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    font-size: 28px;
  }
  .win-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.3);
    z-index: 50;
    gap: 16px;
  }
  .win-text {
    font-size: 36px;
    color: white;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .replay-btn {
    padding: 14px 32px;
    background: white;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-primary);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Memory card matching game"
```

---

### Task 9: Game — Puzzle

**Files:**
- Create: `src/routes/games/puzzle/+page.svelte`

- [ ] **Step 1: Write `src/routes/games/puzzle/+page.svelte`**

```svelte
<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playMatch, playWin } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  const images = [
    { id: 1, colors: ['#FF6B6B', '#4FC3F7', '#FFD54F'], name: 'Sun' },
    { id: 2, colors: ['#81C784', '#BA68C8', '#FF8A65'], name: 'Flower' },
    { id: 3, colors: ['#4FC3F7', '#E57373', '#FFD54F'], name: 'Star' },
  ];

  let pieces = $state([]);
  let selectedImage = $state(images[0]);
  let won = $state(false);
  let dragging = $state(null);

  function initGame() {
    selectedImage = images[Math.floor(Math.random() * images.length)];
    const count = $settings.ageLevel <= 2 ? 2 : $settings.ageLevel <= 3 ? 4 : $settings.ageLevel <= 4 ? 6 : 8;
    const gridSize = count <= 2 ? 1 : count <= 4 ? 2 : 3;
    const cols = count <= 2 ? 2 : count <= 4 ? 2 : 3;
    const rows = Math.ceil(count / cols);

    const result = [];
    let id = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols && id < count; c++) {
        result.push({
          id,
          correctRow: r,
          correctCol: c,
          currentRow: r,
          currentCol: c,
          color: selectedImage.colors[(r * cols + c) % selectedImage.colors.length],
          placed: false
        });
        id++;
      }
    }
    // Shuffle
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      result[i] = { ...result[i] };
      result[j] = { ...result[j] };
      [result[i].currentRow, result[j].currentRow] = [result[j].currentRow, result[i].currentRow];
      [result[i].currentCol, result[j].currentCol] = [result[j].currentCol, result[i].currentCol];
    }
    pieces = result;
    won = false;
  }

  function placePiece(piece) {
    if (piece.correctRow === piece.currentRow && piece.correctCol === piece.currentCol) {
      pieces = pieces.map(p => p.id === piece.id ? { ...p, placed: true } : p);
      if ($settings.soundEnabled) playMatch();
      if (pieces.every(p => p.placed)) {
        setTimeout(() => { won = true; if ($settings.soundEnabled) playWin(); }, 300);
      }
    } else {
      // Swap with adjacent piece
      const target = pieces.find(p => p.currentRow === piece.correctRow && p.currentCol === piece.correctCol);
      if (target && !target.placed) {
        pieces = pieces.map(p => {
          if (p.id === piece.id) return { ...p, currentRow: target.currentRow, currentCol: target.currentCol };
          if (p.id === target.id) return { ...target, currentRow: piece.currentRow, currentCol: piece.currentCol };
          return p;
        });
        if ($settings.soundEnabled) playTap();
      }
    }
  }

  let cols = $derived($settings.ageLevel <= 2 ? 2 : $settings.ageLevel <= 3 ? 2 : 3);

  initGame();
</script>

<div class="puzzle-game">
  <div class="puzzle-grid" style:grid-template-columns="repeat({cols}, 1fr)">
    {#each pieces as piece (piece.id)}
      <button
        class="piece"
        class:placed={piece.placed}
        style:background={piece.color}
        onclick={() => placePiece(piece)}
      >
        {piece.placed ? '✓' : '?'}
      </button>
    {/each}
  </div>

  {#if won}
    <Confetti />
    <div class="win-overlay">
      <p class="win-text">Puzzle done!</p>
      <button class="replay-btn" onclick={initGame}>New Puzzle</button>
    </div>
  {/if}
</div>

<style>
  .puzzle-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 24px;
  }
  .puzzle-grid {
    display: grid;
    gap: 6px;
    width: 100%;
    max-width: 300px;
    aspect-ratio: 1;
  }
  .piece {
    border-radius: 12px;
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: opacity 0.2s, transform 0.15s;
  }
  .piece:active { transform: scale(0.92); }
  .piece.placed { opacity: 0.7; }
  .win-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.3);
    z-index: 50;
    gap: 16px;
  }
  .win-text {
    font-size: 36px;
    color: white;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .replay-btn {
    padding: 14px 32px;
    background: white;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-primary);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Puzzle game with difficulty scaling"
```

---

### Task 10: Game — Pop

**Files:**
- Create: `src/routes/games/pop/+page.svelte`

- [ ] **Step 1: Write `src/routes/games/pop/+page.svelte`**

```svelte
<script>
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { playPop, playWin } from '$lib/sounds/audioManager';

  const items = ['🫧', '🐟', '🦋', '⭐', '🌟', '💫', '🌸', '🍎'];
  let bubbles = $state([]);
  let interval = null;

  function spawnBubble() {
    const maxItems = $settings.ageLevel <= 2 ? 3 : $settings.ageLevel <= 3 ? 5 : $settings.ageLevel <= 4 ? 8 : 12;
    if (bubbles.length >= maxItems) return;
    bubbles = [...bubbles, {
      id: Date.now() + Math.random(),
      emoji: items[Math.floor(Math.random() * items.length)],
      x: 5 + Math.random() * 90,
      y: 105,
      size: $settings.ageLevel <= 2 ? 50 + Math.random() * 20 : 36 + Math.random() * 16,
      speed: $settings.ageLevel <= 2 ? 0.3 + Math.random() * 0.2 : 0.5 + Math.random() * 0.5
    }];
  }

  function popBubble(id) {
    bubbles = bubbles.filter(b => b.id !== id);
    if ($settings.soundEnabled) playPop();
    if (navigator.vibrate) navigator.vibrate(20);
  }

  onMount(() => {
    const speed = $settings.ageLevel <= 2 ? 2000 : $settings.ageLevel <= 3 ? 1500 : $settings.ageLevel <= 4 ? 1000 : 700;
    interval = setInterval(spawnBubble, speed);
    return () => clearInterval(interval);
  });
</script>

<div class="pop-game">
  {#each bubbles as b (b.id)}
    <button
      class="bubble"
      style:left="{b.x}%"
      style:font-size="{b.size}px"
      style:--speed="{b.speed}s"
      style:--start-y="105"
      onclick={() => popBubble(b.id)}
    >
      {b.emoji}
    </button>
  {/each}
</div>

<style>
  .pop-game {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%);
  }
  .bubble {
    position: absolute;
    transform: translateX(-50%);
    animation: float var(--speed) linear forwards;
    animation-delay: 0s;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
  @keyframes float {
    0% { bottom: -60px; opacity: 0; }
    5% { opacity: 1; }
    90% { opacity: 1; }
    100% { bottom: 100%; opacity: 0; }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Pop game with floating bubbles"
```

---

### Task 11: Game — Mini Soccer

**Files:**
- Create: `src/routes/games/soccer/+page.svelte`

- [ ] **Step 1: Write `src/routes/games/soccer/+page.svelte`**

```svelte
<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playGoal, playWin } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  let ballX = $state(20);
  let ballY = $state(50);
  let ballMoving = $state(false);
  let scored = $state(false);
  let score = $state(0);
  let showConfetti = $state(false);

  const goalX = 88;
  const goalY1 = 35;
  const goalY2 = 65;

  function kick(event) {
    if (ballMoving) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const tapX = ((clientX - rect.left) / rect.width) * 100;
    const tapY = ((clientY - rect.top) / rect.height) * 100;

    ballMoving = true;
    if ($settings.soundEnabled) playTap();

    // Always scores for age 2, aim matters for older
    const willScore = $settings.ageLevel <= 2 || (tapY > goalY1 && tapY < goalY2 && tapX > 70);
    const targetX = willScore ? goalX : 70 + Math.random() * 15;
    const targetY = willScore ? 45 + Math.random() * 10 : Math.random() * 80 + 10;

    ballX = targetX;
    ballY = targetY;

    setTimeout(() => {
      ballMoving = false;
      if (willScore) {
        scored = true;
        score++;
        showConfetti = true;
        if ($settings.soundEnabled) playGoal();
        setTimeout(() => { showConfetti = false; }, 2000);
        setTimeout(() => {
          ballX = 20;
          ballY = 50;
          scored = false;
        }, 1500);
      } else {
        setTimeout(() => {
          ballX = 20;
          ballY = 50;
        }, 800);
      }
    }, 500);
  }
</script>

<div class="soccer-game" ontouchstart={kick} onmousedown={kick}>
  <div class="field">
    <div class="goal-area"></div>
    <span class="goal-text">GOAL</span>
    <div
      class="ball"
      style:left="{ballX}%"
      style:top="{ballY}%"
      class:scored
    >
      ⚽
    </div>
    <div class="score-display">Score: {score}</div>
  </div>

  {#if showConfetti}
    <Confetti />
  {/if}
</div>

<style>
  .soccer-game {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .field {
    position: relative;
    width: 100%;
    max-width: 350px;
    aspect-ratio: 3/4;
    background: linear-gradient(180deg, #81C784 0%, #66BB6A 50%, #4CAF50 100%);
    border-radius: 24px;
    overflow: hidden;
    cursor: pointer;
  }
  .goal-area {
    position: absolute;
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    height: 18%;
    border: 3px solid white;
    border-radius: 0 0 12px 12px;
    background: rgba(255,255,255,0.1);
  }
  .goal-text {
    position: absolute;
    top: 8%;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-weight: 700;
    font-size: 14px;
    opacity: 0.5;
    letter-spacing: 2px;
  }
  .ball {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 36px;
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .ball.scored {
    animation: celebrate 0.5s ease-out;
  }
  @keyframes celebrate {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.3); }
  }
  .score-display {
    position: absolute;
    bottom: 12px;
    right: 12px;
    color: white;
    font-weight: 700;
    font-size: 18px;
    text-shadow: 0 1px 4px rgba(0,0,0,0.3);
    background: rgba(0,0,0,0.2);
    padding: 4px 12px;
    border-radius: 12px;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Mini Soccer game with adaptive difficulty"
```

---

### Task 12: Game — Sorting

**Files:**
- Create: `src/routes/games/sorting/+page.svelte`

- [ ] **Step 1: Write `src/routes/games/sorting/+page.svelte`**

```svelte
<script>
  import { settings } from '$lib/stores/settings';
  import { playTap, playMatch, playError, playWin } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';

  const categories = {
    colors: {
      label: 'Color',
      items: [
        { emoji: '🔴', category: 0 }, { emoji: '🟡', category: 1 },
        { emoji: '🔵', category: 2 }, { emoji: '🟢', category: 3 },
        { emoji: '🟣', category: 0 }, { emoji: '🟠', category: 1 },
        { emoji: '⚪', category: 2 }, { emoji: '🟤', category: 3 }
      ],
      baskets: ['Red', 'Yellow', 'Blue', 'Green']
    },
    shapes: {
      label: 'Shape',
      items: [
        { emoji: '⬛', category: 0 }, { emoji: '⭕', category: 1 },
        { emoji: '🔺', category: 2 }, { emoji: '💎', category: 3 },
        { emoji: '⬜', category: 0 }, { emoji: '🔵', category: 1 },
        { emoji: '🔻', category: 2 }, { emoji: '🔶', category: 3 }
      ],
      baskets: ['Square', 'Circle', 'Triangle', 'Diamond']
    }
  };

  let currentCat = $state('colors');
  let items = $state([]);
  let baskets = $state([]);
  let sorted = $state(new Set());
  let won = $state(false);
  let wobbleId = $state(null);
  let draggedItem = $state(null);

  function initGame() {
    const keys = Object.keys(categories);
    currentCat = keys[Math.floor(Math.random() * keys.length)];
    const cat = categories[currentCat];
    const numItems = $settings.ageLevel <= 2 ? 2 : $settings.ageLevel <= 3 ? 4 : $settings.ageLevel <= 4 ? 6 : 8;
    baskets = cat.baskets.slice(0, $settings.ageLevel <= 2 ? 2 : 4);
    items = cat.items.map((item, i) => ({ ...item, id: i, index: i })).slice(0, numItems);
    // Shuffle items
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    sorted = new Set();
    won = false;
  }

  function startDrag(item, e) {
    e.preventDefault();
    draggedItem = item.id;
  }

  function dropOnBasket(basketIndex) {
    if (draggedItem === null) return;
    const item = items.find(i => i.id === draggedItem);
    if (!item) return;

    if (item.category === basketIndex) {
      sorted = new Set([...sorted, item.id]);
      if ($settings.soundEnabled) playMatch();
      if (sorted.size === items.length) {
        setTimeout(() => { won = true; if ($settings.soundEnabled) playWin(); }, 300);
      }
    } else {
      wobbleId = item.id;
      if ($settings.soundEnabled) playError();
      setTimeout(() => wobbleId = null, 500);
    }
    draggedItem = null;
  }

  initGame();
</script>

<div class="sorting-game">
  <div class="items-row">
    {#each items as item (item.id)}
      {#if !sorted.has(item.id)}
        <button
          class="item"
          class:wobble={wobbleId === item.id}
          ontouchstart={(e) => startDrag(item, e)}
          onmousedown={(e) => startDrag(item, e)}
        >
          {item.emoji}
        </button>
      {/if}
    {/each}
  </div>

  <div class="baskets-row">
    {#each baskets as basket, i}
      <button
        class="basket"
        ontouchstart={() => dropOnBasket(i)}
        onmousedown={() => dropOnBasket(i)}
      >
        <span class="basket-label">{basket}</span>
        <span class="basket-count">
          {items.filter(item => item.category === i && sorted.has(item.id)).length}
        </span>
      </button>
    {/each}
  </div>

  {#if won}
    <Confetti />
    <div class="win-overlay">
      <p class="win-text">All sorted!</p>
      <button class="replay-btn" onclick={initGame}>Again!</button>
    </div>
  {/if}
</div>

<style>
  .sorting-game {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 16px;
    gap: 24px;
  }
  .items-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    min-height: 80px;
  }
  .item {
    font-size: 40px;
    width: 64px;
    height: 64px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.15s;
  }
  .item:active { transform: scale(1.15); }
  .item.wobble { animation: wobble 0.4s ease-in-out; }
  @keyframes wobble {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
  }
  .baskets-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .basket {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 70px;
    padding: 12px 8px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    min-height: 80px;
  }
  .basket-label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
  }
  .basket-count {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-primary);
  }
  .win-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.3);
    z-index: 50;
    gap: 16px;
  }
  .win-text {
    font-size: 36px;
    color: white;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .replay-btn {
    padding: 14px 32px;
    background: white;
    border-radius: 24px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-primary);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Sorting game with color/shape categories"
```

---

### Task 13: Game — Splash

**Files:**
- Create: `src/routes/games/splash/+page.svelte`

- [ ] **Step 1: Write `src/routes/games/splash/+page.svelte`**

```svelte
<script>
  import { settings } from '$lib/stores/settings';
  import { playSplash } from '$lib/sounds/audioManager';

  const colors = ['#FF6B6B', '#4FC3F7', '#81C784', '#FFD54F', '#BA68C8', '#FF8A65', '#E57373', '#64B5F6'];
  const emojis = ['⭐', '🌸', '🦋', '💫', '🎈', '🌈', '✨', '❤️'];
  let splashes = $state([]);
  let isTouching = $state(false);

  function createSplash(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const count = $settings.ageLevel <= 2 ? 3 : 6;
    const newSplashes = [];

    for (let i = 0; i < count; i++) {
      newSplashes.push({
        id: Date.now() + Math.random() + i,
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 20 + Math.random() * ($settings.ageLevel <= 2 ? 30 : 20),
        delay: Math.random() * 0.2
      });
    }

    splashes = [...splashes, ...newSplashes];
    if ($settings.soundEnabled) playSplash();

    setTimeout(() => {
      splashes = splashes.filter(s => !newSplashes.find(ns => ns.id === s.id));
    }, 1500);
  }

  function handleTouchStart(e) {
    isTouching = true;
    createSplash(e);
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if ($settings.ageLevel > 2) {
      createSplash(e);
    }
  }
</script>

<div
  class="splash-game"
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  onmousedown={createSplash}
  onmousemove={(e) => { if (e.buttons) createSplash(e); }}
>
  {#each splashes as s (s.id)}
    <span
      class="splash"
      style:left="{s.x}%"
      style:top="{s.y}%"
      style:font-size="{s.size}px"
      style:--delay="{s.delay}s"
      style:--color="{s.color}"
    >
      {s.emoji}
    </span>
  {/each}
</div>

<style>
  .splash-game {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    cursor: crosshair;
  }
  .splash {
    position: absolute;
    transform: translate(-50%, -50%);
    animation: splashOut 1.5s ease-out forwards;
    animation-delay: var(--delay);
    pointer-events: none;
    filter: drop-shadow(0 0 6px var(--color));
  }
  @keyframes splashOut {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add Splash game with particle effects"
```

---

### Task 14: Build, verify, deploy prep

- [ ] **Step 1: Final build check**

```bash
npm run build
```

- [ ] **Step 2: Start dev server to test**

```bash
npm run dev
```

Open http://localhost:5173 and verify:
- Game hub loads with 8 games
- Each game navigates correctly
- Back button works
- Sound toggle works
- Settings persists

- [ ] **Step 3: Commit final state**

```bash
git add -A && git commit -m "chore: final build and polish"
```
