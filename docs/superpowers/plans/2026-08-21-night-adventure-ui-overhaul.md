# Night Adventure UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin hub + all 11 games into the "Night Adventure" theme using a shared component library, with zero gameplay/logic changes.

**Architecture:** Design tokens live in `src/app.css`; seven reusable Svelte 5 components in `src/lib/components/ui/` replace duplicated chrome (win overlays, level pickers, HUD pills). Each game page wraps itself in `GameShell` and keeps its own playfield styles. `+layout.svelte` drops its top-bar last, after every game renders its own chrome. All e2e-relevant class names are preserved.

**Tech Stack:** SvelteKit 2, Svelte 5 runes, Vite, vitest, Playwright. Fonts: `@fontsource-variable/fredoka` (bundled offline).

**Spec:** `docs/superpowers/specs/2026-08-21-night-adventure-ui-overhaul-design.md`

---

### Task 1: Design tokens + base styles

**Files:**
- Modify: `src/app.css`

- [ ] **Step 1: Replace `src/app.css` contents**

```css
@import '@fontsource-variable/fredoka';

:root {
  /* Night Adventure palette */
  --bg-space-1: #0A1128;
  --bg-space-2: #1B2A4A;
  --bg-space-3: #2D4373;
  --panel-glass: rgba(255,255,255,0.08);
  --panel-border: rgba(255,255,255,0.16);
  --text-hi: #EAF2FF;
  --text-lo: #CFE4FF;
  --gold: #FFE082;
  --glow-gold: rgba(255,224,130,0.45);
  --cyan: #7FD8FF;
  --btn-gradient: linear-gradient(135deg,#9FE4FF,#5BC2F0);
  --purple: #A78BFA;
  --mint: #6EE7B7;
  --warn: #FF9B9B;

  /* legacy aliases removed gradually by page rewrites */
  --color-primary: var(--cyan);

  /* shape + motion */
  --radius-card: 20px;
  --radius-btn: 22px;
  --touch-min: 64px;
  --font-display: 'Fredoka Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: var(--font-display);
  background: var(--bg-space-1);
  color: var(--text-hi);
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
  color: inherit;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Shared night background helper */
.night-bg {
  position: relative;
  background: linear-gradient(180deg, var(--bg-space-1) 0%, var(--bg-space-2) 55%, var(--bg-space-3) 100%);
}

/* Glass panel helper */
.glass {
  background: var(--panel-glass);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(6px);
}
@supports not (backdrop-filter: blur(6px)) {
  .glass { background: rgba(27,42,74,0.92); }
}

/* Shared keyframes */
@keyframes twinkle { 0%,100% { opacity:.25; } 50% { opacity:1; } }
@keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes glowPulse {
  0%,100% { box-shadow: 0 0 10px var(--accent-glow, rgba(127,216,255,.35)); }
  50% { box-shadow: 0 0 22px var(--accent-glow, rgba(127,216,255,.7)); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Note: keep `--color-primary` alias so any not-yet-migrated style keeps rendering during migration.

- [ ] **Step 2: Install Fredoka**

Run: `pnpm add @fontsource-variable/fredoka`
Expected: added to dependencies.

- [ ] **Step 3: Verify app still builds**

Run: `pnpm run build`
Expected: build succeeds (pages unchanged but font bundled).

- [ ] **Step 4: Commit**

```bash
git add src/app.css package.json pnpm-lock.yaml
git commit -m "feat(ui): night adventure design tokens + fredoka font"
```

---

### Task 2: Starfield component

**Files:**
- Create: `src/lib/components/ui/Starfield.svelte`
- Test: `tests/unit/starfield.test.js`

- [ ] **Step 1: Write failing test**

```js
// tests/unit/starfield.test.js
import { describe, it, expect } from 'vitest';

describe('Starfield star generation', () => {
  // Extracted pure function mirrors component logic
  function makeStars(count, seed = 42) {
    let s = seed;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: rand() * 100,
      left: rand() * 100,
      size: 1 + rand() * 2,
      delay: rand() * 4,
      duration: 2 + rand() * 3
    }));
  }

  it('creates requested number of stars', () => {
    expect(makeStars(40)).toHaveLength(40);
  });

  it('keeps positions within bounds', () => {
    const stars = makeStars(200);
    stars.forEach(st => {
      expect(st.top).toBeGreaterThanOrEqual(0);
      expect(st.top).toBeLessThanOrEqual(100);
      expect(st.left).toBeGreaterThanOrEqual(0);
      expect(st.left).toBeLessThanOrEqual(100);
    });
  });
});
```

- [ ] **Step 2: Run test**

Run: `pnpm vitest run tests/unit/starfield.test.js`
Expected: PASS (pure logic test validates generation contract before component exists).

- [ ] **Step 3: Create component**

```svelte
<!-- src/lib/components/ui/Starfield.svelte -->
<script>
  let { count = 40 } = $props();

  let s = 42;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    top: rand() * 100,
    left: rand() * 100,
    size: 1 + rand() * 2,
    delay: rand() * 4,
    duration: 2 + rand() * 3
  }));
</script>

<div class="starfield" aria-hidden="true">
  {#each stars as st (st.id)}
    <span
      class="star"
      style:top="{st.top}%"
      style:left="{st.left}%"
      style:width="{st.size}px"
      style:height="{st.size}px"
      style:animation-delay="{st.delay}s"
      style:animation-duration="{st.duration}s"
    ></span>
  {/each}
</div>

<style>
  .starfield {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }
  .star {
    position: absolute;
    border-radius: 50%;
    background: #fff;
    animation: twinkle ease-in-out infinite;
  }
</style>
```

(`twinkle` keyframe comes from `app.css`.)

- [ ] **Step 4: Lint**

Run: `pnpm run lint`
Expected: no errors for new file.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ui/Starfield.svelte tests/unit/starfield.test.js
git commit -m "feat(ui): Starfield component"
```

---

### Task 3: BigButton component

**Files:**
- Create: `src/lib/components/ui/BigButton.svelte`

- [ ] **Step 1: Create component**

```svelte
<!-- src/lib/components/ui/BigButton.svelte -->
<script>
  let { variant = 'primary', onclick, children, class: extraClass = '' } = $props();
</script>

<button class="big-btn {variant} {extraClass}" {onclick}>
  {@render children?.()}
</button>

<style>
  .big-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--touch-min);
    padding: 12px 32px;
    border-radius: var(--radius-btn);
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    transition: transform 0.15s;
  }
  .big-btn:active { transform: scale(0.95); }

  .primary {
    color: #062033;
    background: var(--btn-gradient);
    box-shadow: 0 4px 18px rgba(91,194,240,0.5);
  }
  .ghost {
    color: var(--text-lo);
    background: transparent;
    border: 1.5px solid rgba(255,255,255,0.35);
  }
</style>
```

Callers pass their legacy class via `class="replay-btn"` etc., which merges into the rendered button — e2e selectors stay valid while getting themed styles from `.primary`/`.ghost`.

- [ ] **Step 2: Lint**

Run: `pnpm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/ui/BigButton.svelte
git commit -m "feat(ui): BigButton component"
```

---

### Task 4: HudPill component

**Files:**
- Create: `src/lib/components/ui/HudPill.svelte`

- [ ] **Step 1: Create component**

```svelte
<!-- src/lib/components/ui/HudPill.svelte -->
<script>
  let { icon = '', label, tone = 'default' } = $props();
</script>

<span class="hud-item" class:hud-warn={tone === 'warn'}>
  {#if icon}<span class="hud-icon">{icon}</span>{/if}{label}
</span>

<style>
  .hud-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(6px);
    padding: 6px 14px;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-hi);
    min-height: calc(var(--touch-min) * 0.66);
  }
  .hud-icon { font-size: 15px; }
  .hud-warn {
    color: var(--warn);
    border-color: rgba(255,155,155,0.45);
    animation: glowPulse 1.2s ease-in-out infinite;
    --accent-glow: rgba(255,155,155,0.4);
  }
</style>
```

- [ ] **Step 2: Lint + commit**

Run: `pnpm run lint`
Expected: clean.

```bash
git add src/lib/components/ui/HudPill.svelte
git commit -m "feat(ui): HudPill component"
```

---

### Task 5: LevelBar component

**Files:**
- Create: `src/lib/components/ui/LevelBar.svelte`

- [ ] **Step 1: Create component**

```svelte
<!-- src/lib/components/ui/LevelBar.svelte -->
<script>
  let { current = 1, count = 10, onchange } = $props();
</script>

<div class="level-bar">
  {#each Array(count) as _, i}
    <button
      class="level-btn"
      class:active={current === i + 1}
      onclick={() => onchange?.(i + 1)}
    >
      {i + 1}
    </button>
  {/each}
</div>

<style>
  .level-bar {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;
    padding-bottom: calc(8px + var(--safe-bottom));
  }
  .level-btn {
    width: 34px;
    height: 32px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-display);
    color: var(--text-lo);
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
  }
  .level-btn.active {
    color: #062033;
    background: var(--cyan);
    border-color: var(--cyan);
    box-shadow: 0 0 8px rgba(127,216,255,0.6);
  }
</style>
```

- [ ] **Step 2: Lint + commit**

Run: `pnpm run lint`
Expected: clean.

```bash
git add src/lib/components/ui/LevelBar.svelte
git commit -m "feat(ui): LevelBar component"
```

---

### Task 6: LevelDots component

**Files:**
- Create: `src/lib/components/ui/LevelDots.svelte`

- [ ] **Step 1: Create component**

```svelte
<!-- src/lib/components/ui/LevelDots.svelte -->
<script>
  let { total = 10, current = 1, unlocked = 1 } = $props();
</script>

<div class="level-dots">
  {#each Array(total) as _, i}
    <span
      class="level-dot"
      class:current={current === i + 1}
      class:unlocked={i + 1 <= unlocked}
      class:locked={i + 1 > unlocked}
    ></span>
  {/each}
</div>

<style>
  .level-dots { display: flex; gap: 4px; align-items: center; }
  .level-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transition: all 0.2s;
  }
  .level-dot.locked { background: rgba(255,255,255,0.18); }
  .level-dot.unlocked { background: var(--cyan); opacity: 0.4; }
  .level-dot.current {
    background: var(--cyan);
    opacity: 1;
    transform: scale(1.35);
    box-shadow: 0 0 6px rgba(127,216,255,0.85);
  }
</style>
```

- [ ] **Step 2: Lint + commit**

Run: `pnpm run lint`
Expected: clean.

```bash
git add src/lib/components/ui/LevelDots.svelte
git commit -m "feat(ui): LevelDots component"
```

---

### Task 7: WinOverlay component

**Files:**
- Create: `src/lib/components/ui/WinOverlay.svelte`

- [ ] **Step 1: Create component**

```svelte
<!-- src/lib/components/ui/WinOverlay.svelte -->
<script>
  import Confetti from '$lib/components/Confetti.svelte';
  import StarBurst from '$lib/components/StarBurst.svelte';
  import Starfield from './Starfield.svelte';

  let { title, subtitle = '', children } = $props();
</script>

<div class="win-overlay">
  <Starfield count={25} />
  <Confetti />
  <div class="win-card">
    <p class="win-burst">🎉 ✨ 🎉</p>
    <p class="win-title">{title}</p>
    {#if subtitle}<p class="win-sub">{subtitle}</p>{/if}
    <div class="win-actions">
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .win-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(4,8,24,0.72);
  }
  .win-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 36px 44px;
    border-radius: 28px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(10px);
    animation: popIn 0.35s ease-out;
    max-width: 90vw;
  }
  .win-burst { font-size: 26px; letter-spacing: 8px; animation: floaty 2.4s ease-in-out infinite; }
  .win-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--gold);
    text-shadow: 0 0 18px var(--glow-gold);
    text-align: center;
  }
  .win-sub { font-size: 16px; color: var(--text-lo); text-align: center; }
  .win-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
</style>
```

Note: check `src/lib/components/StarBurst.svelte` exists and takes no required props; if it requires props or is unsuitable, drop that import line and element.

- [ ] **Step 2: Lint + commit**

Run: `pnpm run lint`
Expected: clean.

```bash
git add src/lib/components/ui/WinOverlay.svelte
git commit -m "feat(ui): WinOverlay component"
```

---

### Task 8: GameShell component

**Files:**
- Create: `src/lib/components/ui/GameShell.svelte`

- [ ] **Step 1: Create component**

```svelte
<!-- src/lib/components/ui/GameShell.svelte -->
<script>
  import BackButton from '$lib/components/BackButton.svelte';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import Starfield from './Starfield.svelte';

  let { accent = '#7FD8FF', hudLeft = null, hudRight = null, children } = $props();

  const accentGlow = $derived(accent + '99');
</script>

<div class="game-shell night-bg" style:--accent={accent} style:--accent-glow={accentGlow}>
  <Starfield />
  <header class="top-bar">
    <BackButton />
    {#if hudLeft}{@render hudLeft()}{/if}
    {#if hudRight}{@render hudRight()}{:else}<SoundToggle />{/if}
  </header>
  <main class="playfield">
    {@render children?.()}
  </main>
</div>

<style>
  .game-shell {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    position: relative;
  }
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    padding-top: calc(8px + var(--safe-top));
    z-index: 10;
    flex-shrink: 0;
  }
  .top-bar :global(.back-btn),
  .top-bar :global(.sound-btn) {
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
  }
  .playfield {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }
</style>
```

Games render `<BackButton/>`/`<SoundToggle/>` through GameShell, preserving `.back-btn`/`.sound-btn` classes for e2e. Per-game accent drives glow via `--accent`.

- [ ] **Step 2: Lint + commit**

Run: `pnpm run lint`
Expected: clean.

```bash
git add src/lib/components/ui/GameShell.svelte
git commit -m "feat(ui): GameShell component"
```

---

### Task 9: Redesign hub

**Files:**
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Rewrite hub template + styles**

Script section: unchanged logic, plus imports:

```js
import Starfield from '$lib/components/ui/Starfield.svelte';
```

Keep existing `games`, `showSettings`, `locale`, `goToGame`, `onMount` fullscreen code exactly as-is. Add per-game accent to data:

```js
const games = [
  { id: 'paint', icon: '🎨', key: 'paint', accent: '#FF8FB1' },
  { id: 'stickers', icon: '🌟', key: 'stickers', accent: '#F0ABFC' },
  { id: 'memory', icon: '🧠', key: 'memory', accent: '#7FD8FF' },
  { id: 'puzzle', icon: '🧩', key: 'puzzle', accent: '#93C5FD' },
  { id: 'pop', icon: '🫧', key: 'pop', accent: '#C4B5FD' },
  { id: 'soccer', icon: '⚽', key: 'soccer', accent: '#FFE082' },
  { id: 'sorting', icon: '📦', key: 'sorting', accent: '#FCA5A5' },
  { id: 'splash', icon: '🌈', key: 'splash', accent: '#6EE7B7' },
  { id: 'tower-defense', icon: '🛡️', key: 'towerDefense', accent: '#F87171' },
  { id: 'animal-quiz', icon: '🐾', key: 'animalQuiz', accent: '#FDBA74' },
  { id: 'glossary-puzzle', icon: '🧩', key: 'puzzle', accent: '#5EEAD4' },
];
```

Template:

```svelte
<div class="hub night-bg">
  <Starfield />
  <h1 class="title">🎮 {$_('title')}</h1>

  <div class="grid">
    {#each games as game, i (game.id)}
      <button
        class="game-btn glass"
        style:--accent={game.accent}
        style:animation-delay="{i * 0.07}s"
        onclick={() => goToGame(game.id)}
      >
        <span class="icon">{game.icon}</span>
        <span class="label">{$_(game.key)}</span>
      </button>
    {/each}
  </div>

  <!-- settings block unchanged -->
  {#if showSettings}
    ...existing settings bar markup...
  {:else}
    <button class="settings-trigger" onclick={toggleSettings} aria-label="Settings">⚙️</button>
  {/if}
</div>
```

Replace the entire `<style>` block:

```css
.hub {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  gap: 24px;
  overflow-y: auto;
}
.title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: var(--gold);
  text-shadow: 0 0 14px var(--glow-gold);
  z-index: 1;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 400px;
  z-index: 1;
}
@media (min-width: 480px) { .grid { grid-template-columns: repeat(3, 1fr); max-width: 560px; } }
@media (min-width: 768px) { .grid { grid-template-columns: repeat(4, 1fr); max-width: 720px; } }
.game-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 12px;
  min-height: 120px;
  border-radius: var(--radius-card);
  animation: floaty 5s ease-in-out infinite, popIn 0.4s ease-out backwards;
  transition: transform 0.15s;
}
.game-btn:active { transform: scale(0.94); animation-play-state: paused; }
.game-btn:nth-child(2n) { animation-delay: 0.8s; }
.game-btn:nth-child(3n) { animation-delay: 1.6s; }
.icon { font-size: 42px; filter: drop-shadow(0 0 8px var(--accent)); }
.label { font-size: 14px; font-weight: 600; color: var(--text-lo); }
.settings-trigger {
  font-size: 28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--panel-glass);
  border: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.75;
  z-index: 1;
}
.settings-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--panel-glass);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  z-index: 1;
}
.close-settings {
  padding: 8px 18px;
  min-height: var(--touch-min);
  background: var(--btn-gradient);
  color: #062033;
  border-radius: 18px;
  font-weight: 600;
  font-size: 14px;
}
.lang-btn {
  padding: 6px 12px;
  min-height: var(--touch-min);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-lo);
  background: transparent;
  border: 1px solid var(--panel-border);
  letter-spacing: 0.5px;
}
.lang-btn.active { color: #062033; background: var(--cyan); border-color: var(--cyan); }
```

Settings-bar markup stays structurally identical (classes preserved).

- [ ] **Step 2: Visual smoke**

Run: `pnpm run dev` → open http://localhost:5173 → confirm night sky, glowing title, floating cards, settings slide-up works.
Expected: matches approved mockup direction.

- [ ] **Step 3: E2E navigation still passes**

Run: `pnpm playwright test tests/e2e/navigation.test.js`
Expected: PASS (`.game-btn` grid intact on hub is not asserted here, but hub must not crash).

- [ ] **Step 4: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "feat(hub): night adventure hub redesign"
```

---

### Task 10–20: Migrate games

Each game follows the same recipe; only the specifics below change. Common recipe:
1. Add imports: `GameShell` (+ named components used), remove direct `Confetti` import when WinOverlay adopted.
2. Wrap root in `<GameShell accent="...">` with `hudLeft`/`hudRight` snippets where a HUD exists.
3. Replace win overlay markup with `<WinOverlay>`; buttons inside actions become `<BigButton variant="primary" class="next-btn|replay-btn">` (keep legacy classes).
4. Replace inline level bars/dots with components.
5. Delete replaced scoped CSS; reskin remaining playfield selectors to theme (glass panels, `var(--text-hi)` text, accent glows).
6. Run lint + behavioral tests for that game + its e2e test.
7. Commit.

#### Task 10: memory (accent `#7FD8FF`)
- hudRight: explicit `<SoundToggle />`; hudLeft snippet holds `<HudPill icon="⭐" label="{$_('level')} {level}" />` next to `<LevelDots total={10} current={level} unlocked={unlockedLevel} />`.
- Cards: back face `background: linear-gradient(145deg,#23375F,#18294A)` with `border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent)` + `glowPulse`; front face light `linear-gradient(145deg,#F5FAFF,#DCEBFF)` keeping `.card-front`/`.card-back`/`.flipped`/`.matched`/`.showcasing` classes and flip transform logic.
- Win overlay → WinOverlay with two BigButtons (`class="next-btn"` primary when level<10; `class="replay-btn"` ghost).
- Keep `.level-label`, `.level-dots`, `.level-dot*`, `.sparkle` markup/classes.
- Test: `pnpm vitest run tests/behavioral/memory.test.js && pnpm playwright test tests/e2e/memory.test.js`

#### Task 11: pop (accent `#C4B5FD`)
- hudLeft: `<HudPill icon="⭐" label="{$_('score')}: {score}" />`; hudRight: HudPill tone warn when `timeLeft <= 5` else default + `<SoundToggle />` beside it inside the same snippet.
- Level bar at bottom → `<LevelBar current={level} onchange={setLevel} />`.
- Playfield bg: `night-bg`; bubbles get drop-shadow glow `rgba(196,181,253,.5)`.
- End-of-round screen → WinOverlay, BigButton `class="replay-btn"` primary.
- Keep `.bubble`, `.score-text`, `.hud-item`, `.hud-warn` classes.
- Test: pop unit+behavioral+e2e.

#### Task 12: soccer (accent `#FFE082`)
- No HUD pills (score shown on field) — hudRight defaults to SoundToggle.
- Field keeps green gradient pitch but framed in glass card; goal/ball/arrow untouched.
- Win overlay → WinOverlay (title `{$_('greatGame')}`, subtitle `{$_('goals')}: {score}`), BigButton `class="replay-btn"` primary.
- Level bar → `<LevelBar current={level} onchange={setLevel} />`.
- Keep `.win-overlay`, `.replay-btn`, `.level-bar`, `.level-btn`, `.active` classes.
- Test: soccer suites.

#### Task 13: sorting (accent `#FCA5A5`)
- Items/baskets: white→glass (`var(--panel-glass)`, `var(--panel-border)`, radius 16); selected ring uses `var(--accent)`; basket-count color `var(--accent)`.
- Hint text color `var(--text-lo)`.
- Level bar → `<LevelBar current={level} onchange={(l) => { level = l; initGame(); }} />`.
- Win overlay → WinOverlay + BigButton `class="replay-btn"` ghost.
- Test: sorting suites.

#### Task 14: puzzle (accent `#93C5FD`)
- Note: this game uses `.lvl-btn` (not `.level-btn`) — swap inline bar for `<LevelBar current={level} onchange={setLevel} />` and update its e2e/unit expectations if they reference `.lvl-btn`.
- Ghost cells: dashed border → `color-mix(in srgb, var(--accent) 35%, transparent)`; drag-over tint mint.
- Tray: glass panel; tray pieces white→glass with accent shadow.
- Win overlay → WinOverlay + BigButton `class="replay-btn"` primary.
- Keep `.ghost-cell`, `.placed-piece`, `.tray-piece`, `.dragging`, `.drag-hint` classes.
- Test: puzzle suites.

#### Task 15: paint (accent `#FF8FB1`) — reskin only
- Canvas stays white drawing surface (kids draw in color) but framed in glass toolbar rows: `.toolbar`/`.bottom-bar` bg → `var(--panel-glass)` + top/bottom border `var(--panel-border)`; action/size buttons glass chips ≥48px; active states `var(--accent)`.
- No overlay/levels in this game.
- Test: paint suites.

#### Task 16: stickers (accent `#F0ABFC`) — reskin only
- Scene select/tray/clear buttons → glass chips; scene-area inner gradient kept per-scene (kid content pops on dark frame).
- Tray bg → glass; sticker buttons ≥52px stay.
- Test: stickers suites.

#### Task 17: splash (accent `#6EE7B7`) — reskin only
- Already dark! Align its hardcoded navy gradient with `var(--bg-space-*)` values; nothing else changes.
- Test: splash suites.

#### Task 18: animal-quiz (accent `#FDBA74`)
- Quiz container text colors → `var(--text-hi)`/`var(--text-lo)`; option buttons → glass chips with accent ring on hover/select; animal display card → glass.
- Done-screen → WinOverlay (title `🎉 {$_('allDone')}`), BigButton `class="replay-btn"` primary.
- Keep `.opt-btn`, `.shake`, `.done-text`, `.replay-btn` classes.
- Test: animal-quiz suites.

#### Task 19: tower-defense (accent `#F87171`)
- Menu (`view==='select'`): title gold glow; `.td-level-btn` → glass cards, locked state dimmed; wrap menu in `night-bg` + `<Starfield />` (no GameShell — it has its own two-view flow).
- In-game view stays wrapped in GameShell-less structure but gains `night-bg` root + `<Starfield />`; `.td-hud` spans → three `<HudPill>` (❤️ lives default, 🪙 coins default, 🌊 waves default).
- Cell/path/tower colors already dark-friendly; adjust `.spot-hint`/borders to `var(--panel-border)`.
- Test: tower-defense suites (engine logic untouched).

#### Task 20: glossary-puzzle (accent `#5EEAD4`)
- Gallery view: `night-bg` + Starfield; `.gp-cat-btn`, `.gp-image-card`, `.gp-resume-btn`, `.gp-diff-btn` → glass cards/chips with accent highlights.
- Play view: board-wrap gets glass frame; tray glass; progress pill → `<HudPill label="{placed.size}/{pieces.length}" />` in `.gp-top-bar` (keep `.gp-exit-btn` — parental gate logic must NOT move into GameShell's back button; this game overrides back behavior intentionally).
- Celebration → keep `.gp-celebration` container but restyle to WinOverlay visual language OR swap to `<WinOverlay title="🎉 {$_('puzzleDone')}">` with both BigButtons (`◀ back` ghost, `🔄 replay` primary). Prefer full swap if trivial; keep classes on buttons.
- Test: glossary-puzzle suites.

Each of Tasks 10–20 ends with:

```bash
git add src/routes/games/<id>/+page.svelte
git commit -m "feat(<id>): night adventure reskin"
```

and passing: `pnpm run lint && pnpm vitest run tests/unit/<id>.test.js tests/behavioral/<id>.test.js && pnpm playwright test tests/e2e/<id>.test.js` (skip vitest files that don't exist for that game).

---

### Task 21: Slim down layout chrome

**Files:**
- Modify: `src/routes/+layout.svelte`

Only after ALL games migrated (each now renders its own top bar):

- [ ] **Step 1: Remove the `isGame` header block**

Delete from template:

```svelte
{#if isGame}
  <header class="top-bar">
    <BackButton />
    <SoundToggle />
  </header>
{/if}
```

and from script: `isGame` derived, `BackButton`, `SoundToggle` imports. Delete `.top-bar` styles. Keep shell/game-area/install-banner intact.

- [ ] **Step 2: Full navigation e2e**

Run: `pnpm playwright test tests/e2e/navigation.test.js`
Expected: PASS — `.back-btn` now comes from each game's GameShell.

- [ ] **Step 3: Commit**

```bash
git add src/routes/+layout.svelte
git commit -m "refactor(layout): game chrome owned by GameShell"
```

---

### Task 22: Final verification sweep

- [ ] **Step 1:** `pnpm run lint` — clean
- [ ] **Step 2:** `pnpm test` — all unit + behavioral green, zero modifications to those files since baseline
- [ ] **Step 3:** `pnpm test:e2e` — all green
- [ ] **Step 4:** `pnpm run dev` — manually walk: hub → each of 11 games → one win path each (memory level 1, pop timer end, sorting easy level, quiz first question wrong→right, soccer goal, puzzle 2×2). Check mobile viewport (iPhone SE) + desktop. Screenshot review against mockup direction.
- [ ] **Step 5:** Fix anything found; final commit if needed.

---

## Self-review notes

- Spec coverage: tokens(T1) fonts(T1) 7 components(T2–8) hub(T9) all 11 games(T10–20) layout(T21) error-handling(@supports/reduced-motion in T1; font-display swap via fontsource css) testing(T22). ✓
- Type consistency: `onchange(level)` callback name used identically in T5/T11/T13/T14. ✓
- Sequencing guard: T21 strictly after T10–20. ✓
