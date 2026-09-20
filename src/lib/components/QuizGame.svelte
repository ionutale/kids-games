<script>
  import { get } from 'svelte/store';
  import { _, locale } from '$lib/stores/locale';
  import { playTap, playMatch } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';
  import { TOPICS, itemsFor } from '$lib/quiz/topics.js';
  import { buildOptions } from '$lib/quiz/round.js';

  let { topic = '' } = $props();

  const meta = $derived(TOPICS[topic]);
  const items = $derived(itemsFor(topic));

  let round = $state(0);
  let currentItem = $state(null);
  let options = $state([]);
  let showConfetti = $state(false);
  let shakeName = $state(null);
  let done = $state(false);

  function lang() {
    return get(locale);
  }

  function nextRound() {
    if (round >= items.length) {
      done = true;
      return;
    }
    currentItem = items[round];
    options = buildOptions(currentItem, items, lang());
    shakeName = null;
    showConfetti = false;
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
      playTap();
      setTimeout(() => (shakeName = null), 500);
    }
  }

  function restart() {
    round = 0;
    currentItem = null;
    options = [];
    done = false;
    showConfetti = false;
    shakeName = null;
    setTimeout(() => nextRound(), 0);
  }

  nextRound();
</script>

<GameShell accent={meta?.accent ?? '#FDBA74'}>
  <div class="quiz">
    <h2 class="quiz-title">{meta?.icon} {meta ? $_(meta.titleKey) : ''}</h2>

    {#if !done}
      <p class="quiz-progress" data-testid="quiz-progress">{round + 1} / {items.length}</p>

      {#if currentItem}
        <div class="item-display">
          <span class="big-emoji" data-testid="quiz-emoji">{currentItem.emoji}</span>
        </div>

        <div class="options">
          {#each options as opt, i (opt.name)}
            <button
              class="opt-btn"
              class:shake={shakeName === opt.name}
              class:correct={showConfetti && opt.correct}
              onclick={() => pick(opt)}
              data-testid={opt.correct ? 'correct-opt' : `wrong-opt-${i}`}
            >
              {opt.name}
            </button>
          {/each}
        </div>
      {/if}
    {:else}
      <WinOverlay title="🎉 {$_('allDone')}">
        <BigButton variant="primary" class="replay-btn" onclick={restart}>{$_('playAgain')}</BigButton>
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
</style>
