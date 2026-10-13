<script>
  import { get } from 'svelte/store';
  import { untrack } from 'svelte';
  import { _, locale } from '$lib/stores/locale';
  import { playTap, playMatch } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import LadderBar from '$lib/ladder/LadderBar.svelte';
  import LadderActions from '$lib/ladder/LadderActions.svelte';
  import { TOPICS, itemsFor } from '$lib/quiz/topics.js';
  import { buildOptions } from '$lib/quiz/round.js';
  import { quizLevelConfig, buildQueue } from '$lib/quiz/levels.js';
  import { speak, defaultQuizMode } from '$lib/quiz/audio.js';
  import { settings } from '$lib/stores/settings';
  import { loadLevel, saveLevel, loadMastered, saveMastered, MAX_LEVEL } from '$lib/ladder/progress.js';

  let { topic = '', gameId = '' } = $props();

  const meta = $derived(TOPICS[topic]);
  const items = $derived(itemsFor(topic));

  // Pre-readers (age ≤4) start in listen mode: the word is spoken and the
  // answers are emoji cards. The header toggle switches per user and sticks.
  const initialSettings = get(settings);
  let mode = $state(initialSettings.quizMode ?? defaultQuizMode(initialSettings.ageLevel));

  // A quiz is bound to one topic per mounted route: read the saved level once.
  let level = $state(untrack(() => loadLevel(gameId)));
  let mastered = $state(untrack(() => loadMastered(gameId)));
  let queue = $state([]);
  let round = $state(0);
  let currentItem = $state(null);
  let options = $state([]);
  let showConfetti = $state(false);
  let shakeName = $state(null);
  let misses = $state(0);
  let done = $state(false);

  function lang() {
    return get(locale);
  }

  function sayWord() {
    if (!currentItem) return;
    speak(currentItem[lang()] || currentItem.en, lang());
  }

  function toggleMode() {
    mode = mode === 'listen' ? 'read' : 'listen';
    settings.setQuizMode(mode);
  }

  // Best effort: read each new question aloud in listen mode (the 🔊 button
  // always works — it is inside a user gesture).
  $effect(() => {
    if (mode === 'listen' && currentItem) {
      speak(currentItem[lang()] || currentItem.en, lang());
    }
  });

  function nextRound() {
    if (round >= queue.length) {
      showConfetti = false; // never fall confetti over the win card
      done = true;
      if (level >= MAX_LEVEL) {
        saveMastered(gameId);
        mastered = true;
      }
      return;
    }
    currentItem = queue[round];
    options = buildOptions(currentItem, items, lang(), Math.random, quizLevelConfig(level).options);
    shakeName = null;
    misses = 0;
    showConfetti = false;
  }

  function startRound() {
    // A fresh shuffle every round: replays are never the same order.
    queue = buildQueue(items, level);
    round = 0;
    currentItem = null;
    options = [];
    done = false;
    showConfetti = false;
    shakeName = null;
    nextRound();
  }

  function startLevel(n) {
    level = Math.min(MAX_LEVEL, Math.max(1, n));
    saveLevel(gameId, level);
    startRound();
  }

  function advanceLevel(e) {
    e?.preventDefault();
    startLevel(level + 1);
  }

  function replayLevel(e) {
    e?.preventDefault();
    startRound();
  }

  function pick(opt) {
    if (showConfetti || done) return;
    if (opt.correct) {
      showConfetti = true;
      playMatch();
      setTimeout(() => {
        round++;
        nextRound();
      }, 1500);
    } else {
      shakeName = opt.name;
      misses += 1; // after two misses the correct option gets a gentle pulse
      playTap();
      setTimeout(() => (shakeName = null), 500);
    }
  }

  startRound();
</script>

<GameShell accent={meta?.accent ?? '#FDBA74'}>
  {#snippet hudLeft()}
    <button
      class="mode-btn"
      data-testid="quiz-mode"
      aria-label={mode === 'listen' ? $_('readMode') : $_('listenMode')}
      onclick={toggleMode}
    >
      {mode === 'listen' ? '🔊' : '📖'}
    </button>
  {/snippet}

  <div class="quiz">
    <h2 class="quiz-title">{meta?.icon} {meta ? $_(meta.titleKey) : ''}</h2>

    {#if !done}
      <p class="quiz-progress" data-testid="quiz-progress">
        {$_('level')} {level} · {round + 1} / {queue.length}
      </p>

      {#if currentItem}
        {#if mode === 'listen'}
          <div class="listen-prompt" data-testid="listen-prompt">
            <button class="speak-btn" data-testid="speak" aria-label={$_('listenMode')} onclick={sayWord}>
              🔊
            </button>
            <p class="listen-word" data-testid="listen-word">{currentItem[lang()] || currentItem.en}</p>
          </div>
        {:else}
          <div class="item-display">
            <span class="big-emoji" data-testid="quiz-emoji">{currentItem.emoji}</span>
          </div>
        {/if}

        <div class="options">
          {#each options as opt, i (opt.name)}
            <button
              class="opt-btn"
              class:emojify={mode === 'listen'}
              class:shake={shakeName === opt.name}
              class:correct={showConfetti && opt.correct}
              class:hint={misses >= 2 && opt.correct && !showConfetti}
              onclick={() => pick(opt)}
              data-testid={opt.correct ? 'correct-opt' : `wrong-opt-${i}`}
            >
              {#if mode === 'listen'}
                <span class="opt-emoji">{opt.emoji}</span>
              {:else}
                {opt.name}
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    {:else}
      <WinOverlay title="🎉 {$_('allDone')}">
        <LadderBar current={level} {mastered} onchange={startLevel} />
        <LadderActions
          {gameId}
          {level}
          backHref="/"
          nextHref={`/games/${gameId}`}
          replayHref={`/games/${gameId}`}
          onnext={advanceLevel}
          onreplay={replayLevel}
        />
      </WinOverlay>
    {/if}

    {#if showConfetti}
      <Confetti />
    {/if}
  </div>
</GameShell>

<style>
  .quiz {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    padding: 24px 16px;
    gap: 16px;
  }
  .quiz-title {
    font-size: 22px;
    color: var(--text-hi);
  }
  .mode-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    font-size: 20px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.12s;
  }
  .mode-btn:active { transform: scale(0.94); }
  .listen-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .speak-btn {
    width: 112px;
    height: 112px;
    border-radius: 50%;
    font-size: 52px;
    background: var(--btn-gradient);
    box-shadow: 0 6px 22px rgba(91, 194, 240, 0.5);
    transition: transform 0.12s;
  }
  .speak-btn:active { transform: scale(0.93); }
  .listen-word {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-lo);
    margin: 0;
  }
  .opt-btn.emojify { padding: 8px; }
  .opt-emoji { font-size: 44px; line-height: 1; }
  .quiz-progress {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-lo);
  }
  .item-display {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    height: 160px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  .big-emoji {
    font-size: 80px;
    line-height: 1;
  }
  .options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 280px;
  }
  .opt-btn {
    width: 100%;
    padding: 16px;
    font-size: 20px;
    font-weight: 700;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    border-radius: 16px;
    transition: transform 0.1s;
    color: var(--text-hi);
  }
  .opt-btn:active { transform: scale(0.97); }
  .opt-btn.correct {
    background: var(--mint);
    border-color: var(--mint);
    color: #062033;
    transform: scale(1.12);
    box-shadow: 0 0 20px rgba(110, 231, 183, 0.6);
    animation: correctPop 0.25s ease-out;
  }
  @keyframes correctPop {
    0% { transform: scale(1); }
    60% { transform: scale(1.18); }
    100% { transform: scale(1.12); }
  }
  .opt-btn.shake {
    animation: shake 0.4s ease-in-out;
    background: #FFEBEE;
    color: #E57373;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    50% { transform: translateX(10px); }
    75% { transform: translateX(-5px); }
  }
  .opt-btn.hint {
    border-color: var(--mint);
    box-shadow: 0 0 18px rgba(110, 231, 183, 0.55);
    animation: hintPulse 1.2s ease-in-out infinite;
  }
  @keyframes hintPulse {
    0%, 100% { box-shadow: 0 0 6px rgba(110, 231, 183, 0.25); }
    50% { box-shadow: 0 0 22px rgba(110, 231, 183, 0.65); }
  }
</style>
