<script>
  import { onMount } from 'svelte';
  import { _ } from '$lib/stores/locale';
  import { settings } from '$lib/stores/settings';
  import GameShell from '$lib/components/ui/GameShell.svelte';
  import '$lib/trainers/fx.css';
  import HudPill from '$lib/components/ui/HudPill.svelte';
  import Confetti from '$lib/components/Confetti.svelte';
  import { playMatch, playWin } from '$lib/sounds/audioManager.js';
  import { makeQuestion } from '$lib/emoji-math/game.js';

  let question = $state(null);
  let chosen = $state(-1); // index of wrong pick (shake)
  let reveal = $state(false); // briefly show correct answer after a miss
  let correct = $state(0);
  let streak = $state(0);
  let milestone = $state(false);
  let bestStreak = $state(
    (typeof localStorage !== 'undefined' && parseInt(localStorage.getItem('emoji-math-best-streak') || '0', 10)) || 0
  );
  let timers = [];

  function clearTimers() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }

  function next(seedOffset = Date.now() % 100000) {
    clearTimers();
    question = makeQuestion($settings.ageLevel, seedOffset);
    chosen = -1;
    reveal = false;
  }

  function answer(idx) {
    if (!question || chosen !== -1 || reveal) return;
    const value = Number(question.options[idx]);
    if (value === question.answer) {
      playMatch();
      correct += 1;
      streak += 1;
      if (streak > bestStreak) {
        bestStreak = streak;
        localStorage.setItem('emoji-math-best-streak', String(bestStreak));
      }
      if (correct % 10 === 0) {
        milestone = true;
        playWin();
        timers.push(setTimeout(() => (milestone = false), 1600));
      }
      timers.push(setTimeout(() => next((Date.now() + correct * 31) % 100000), milestone ? 1500 : 450));
    } else {
      // silent shake + reveal the correct pill, then move on — no penalty
      chosen = idx;
      reveal = true;
      streak = 0;
      timers.push(setTimeout(() => next((Date.now() + correct * 17) % 100000), 1400));
    }
  }

  function visibility() {
    clearTimers(); // freeze mid-question timers when hidden; resume with a fresh question
  }

  onMount(() => {
    next();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      clearTimers();
    };
  });

  function groupEmoji(n) {
    return Array(n).fill(question.emoji).join('');
  }
</script>

<GameShell accent="#81C784">
  {#snippet hudLeft()}
    <HudPill icon="✅" label={String(correct)} />
    <HudPill icon="🔥" label={String(streak)} />
    <HudPill icon="🏆" label={String(bestStreak)} />
  {/snippet}

  <div class="math" data-testid="math-root">
    {#if milestone}
      <div class="milestone" data-testid="milestone">
        <Confetti />
        <p class="milestone-text">🎉 {correct}!</p>
      </div>
    {/if}

    {#if question}
      <div class="equation" data-testid="equation">
        {#if question.type === 'compare'}
          <div class="compare">
            {#each question.groups as g, gi}
              <div class="side">
                <p class="cluster">{groupEmoji(g)}</p>
                <p class="side-label">{gi === 0 ? '⬅️' : '➡️'}</p>
              </div>
            {/each}
          </div>
          <p class="prompt">{$_('whichMore')}</p>
        {:else}
          <p class="expression" data-testid="expression">
            {#each question.groups as g, gi}
              {#if gi > 0}<span class="op">➕</span>{/if}<span class="cluster">{groupEmoji(g)}</span>
            {/each}
            <span class="op">=</span><span class="qmark">❓</span>
          </p>
        {/if}
      </div>

      <div class="answers" data-testid="answers">
        {#each question.options as opt, idx}
          <button
            class="ans"
            class:shake={chosen === idx}
            class:reveal-correct={reveal && Number(opt) === question.answer}
            onclick={() => answer(idx)}
            data-testid={Number(opt) === question.answer ? 'correct-ans' : `ans-${idx}`}
          >
            {opt}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</GameShell>

<style>
  .math {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 26px;
    padding: 12px;
  }
  .milestone { position: fixed; inset: 0; z-index: 30; display: flex; align-items: center; justify-content: center; pointer-events: none; }
  .milestone-text { font-size: 56px; color: var(--gold); text-shadow: 0 0 20px var(--glow-gold); margin: 0; }
  .compare { display: flex; gap: 40px; justify-content: center; }
  .side { text-align: center; }
  .cluster { font-size: 34px; line-height: 1.6; max-width: 300px; word-break: break-all; margin: 0; }
  .side-label { font-size: 22px; margin: 6px 0 0; }
  .expression {
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: center;
    font-size: 34px; margin: 0;
  }
  .op { font-size: 30px; color: var(--text-lo); }
  .qmark { font-size: 40px; animation: floaty 2s ease-in-out infinite; }
  .prompt { text-align: center; font-size: 22px; color: var(--text-hi); font-weight: 700; margin: 14px 0 0; }
  .answers { display: grid; grid-template-columns: repeat(2, minmax(90px, 130px)); gap: 16px; padding-bottom: calc(10px + var(--safe-bottom)); }
  .ans {
    min-height: calc(var(--touch-min) * 1.3);
    border-radius: 24px;
    font-size: 34px;
    font-weight: 700;
    font-family: var(--font-display);
    color: #062033;
    background: var(--btn-gradient);
    box-shadow: 0 4px 18px rgba(91, 194, 240, 0.5);
    transition: transform 0.12s;
  }
  .ans:active { transform: scale(0.94); }
  .ans.shake { animation: fxWobble 0.4s ease-in-out; opacity: 0.7; }
  .ans.reveal-correct { box-shadow: 0 0 24px #7ee787; border: 2px solid #7ee787; }
</style>
