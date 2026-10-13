<script>
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playPop } from '$lib/sounds/audioManager';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import LadderBar from '$lib/ladder/LadderBar.svelte';
  import LadderActions from '$lib/ladder/LadderActions.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import { loadLevel, saveLevel, loadMastered, saveMastered, MAX_LEVEL } from '$lib/ladder/progress.js';
  import { levelConfig } from '$lib/pop/config.js';

  const items = ['🫧', '🐟', '🦋', '⭐', '🌟', '💫', '🌸', '🍎'];
  let bubbles = $state([]);
  let interval = null;
  let score = $state(0);
  let timeLeft = $state(20);
  let playing = $state(false);
  let level = $state(loadLevel('pop'));
  let mastered = $state(loadMastered('pop'));

  function spawnBubble() {
    if (!playing) return;
    const config = levelConfig(level);
    if (bubbles.length >= config.maxItems) return;
    bubbles = [...bubbles, {
      id: Math.random(),
      emoji: items[Math.floor(Math.random() * config.itemCount)],
      x: 5 + Math.random() * 90,
      size: level <= 3 ? 50 + Math.random() * 15 : 36 + Math.random() * 12,
      fall: config.fallSec + Math.random() * 2
    }];
  }

  function popBubble(id) {
    if (!playing) return;
    bubbles = bubbles.filter(b => b.id !== id);
    score++;
    if ($settings.soundEnabled) playPop();
    if (navigator.vibrate) navigator.vibrate(20);
  }

  function startGame() {
    score = 0;
    timeLeft = 20;
    bubbles = [];
    playing = true;
    const config = levelConfig(level);
    if (interval) clearInterval(interval);
    interval = setInterval(spawnBubble, config.spawnMs);
  }

  function resetGame() {
    playing = false;
    if (interval) clearInterval(interval);
  }

  onMount(() => {
    startGame();
    const timer = setInterval(() => {
      if (playing) {
        timeLeft--;
        if (timeLeft <= 0) {
          resetGame();
          if (level >= MAX_LEVEL) {
            saveMastered('pop');
            mastered = true;
          }
          // WinOverlay plays the single win cheer on mount; no second jingle here.
        }
      }
    }, 1000);
    return () => { clearInterval(interval); clearInterval(timer); };
  });

  function setLevel(l) {
    level = l;
    saveLevel('pop', l);
    startGame();
  }

  function advanceLevel(e) {
    e?.preventDefault();
    setLevel(Math.min(MAX_LEVEL, level + 1));
  }

  function replayLevel(e) {
    e?.preventDefault();
    startGame();
  }
</script>

<GameShell accent="#C4B5FD">
  {#snippet hudLeft()}
    <HudPill icon="⭐" label="{$_('score')}: {score}" />
  {/snippet}

  {#snippet hudRight()}
    <div class="hud-right">
      <HudPill icon="⏱" label="{$_('time')}: {timeLeft}s" tone={timeLeft <= 5 ? 'warn' : 'default'} />
      <SoundToggle />
    </div>
  {/snippet}

  <div class="pop-game">
    {#if !playing && timeLeft <= 0}
      <WinOverlay title={$_('greatJob')} subtitle="{$_('score')}: {score}">
        <LadderActions
          gameId="pop"
          {level}
          backHref="/"
          nextHref="/games/pop"
          replayHref="/games/pop"
          onnext={advanceLevel}
          onreplay={replayLevel}
        />
      </WinOverlay>
    {/if}

    {#each bubbles as b (b.id)}
      <button
        class="bubble"
        style:left="{b.x}%"
        style:font-size="{b.size}px"
        style:--fall="{b.fall}s"
        onclick={() => popBubble(b.id)}
      >
        {b.emoji}
      </button>
    {/each}

    <LadderBar current={level} {mastered} onchange={setLevel} />
  </div>
</GameShell>

<style>
  .pop-game {
    flex: 1;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .pop-game :global(.ladder-bar) { margin-top: auto; }
  .hud-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .bubble {
    position: absolute;
    transform: translateX(-50%);
    animation: float var(--fall) linear infinite;
    filter: drop-shadow(0 2px 6px rgba(196,181,253,0.55));
  }
  @keyframes float {
    0% { bottom: -60px; opacity: 0; }
    5% { opacity: 1; }
    90% { opacity: 1; }
    100% { bottom: 100%; opacity: 0; }
  }
</style>
