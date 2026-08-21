<script>
  import { get } from 'svelte/store';
  import { _ } from '$lib/stores/locale';
  import { locale } from '$lib/stores/locale';
  import { playTap, playMatch, playWin } from '$lib/sounds/audioManager';
  import Confetti from '$lib/components/Confetti.svelte';
  import ANIMALS from '$lib/animalQuizData.js';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import WinOverlay from '$lib/components/ui/WinOverlay.svelte';
  import BigButton from '$lib/components/ui/BigButton.svelte';

  let round = $state(0);
  let currentAnimal = $state(null);
  let options = $state([]);
  let showConfetti = $state(false);
  let shakeId = $state(null);
  let done = $state(false);

  function lang() {
    return get(locale);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function nextRound() {
    if (round >= ANIMALS.length) {
      done = true;
      if ($locale.startsWith('it')) {
        // Italian already handled
      }
      return;
    }
    const animal = ANIMALS[round];
    currentAnimal = animal;

    const wrongPool = ANIMALS.filter(a => a.emoji !== animal.emoji);
    const shuffled = shuffle(wrongPool);
    const wrong = [
      { name: shuffled[0][lang()] || shuffled[0].en, correct: false },
      { name: shuffled[1][lang()] || shuffled[1].en, correct: false },
    ];
    const correct = { name: animal[lang()] || animal.en, correct: true };
    options = shuffle([correct, ...wrong]);
    shakeId = null;
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
      shakeId = opt.name;
      playTap();
      setTimeout(() => { shakeId = null; }, 500);
    }
  }

  function restart() {
    round = 0;
    currentAnimal = null;
    options = [];
    done = false;
    showConfetti = false;
    shakeId = null;
    setTimeout(() => nextRound(), 0);
  }

  nextRound();
</script>

<GameShell accent="#FDBA74">
<div class="quiz">
  <h2 class="quiz-title">🐾 {$_('animalQuiz')}</h2>

  {#if !done}
    <p class="quiz-progress">{round + 1} / {ANIMALS.length}</p>

    {#if currentAnimal}
      <div class="animal-display">
        <span class="big-emoji">{currentAnimal.emoji}</span>
      </div>

      <div class="options">
        {#each options as opt (opt.name)}
          <button
            class="opt-btn"
            class:shake={shakeId === opt.name}
            onclick={() => pick(opt)}
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
  .animal-display {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 160px;
    height: 160px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    border-radius: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
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
