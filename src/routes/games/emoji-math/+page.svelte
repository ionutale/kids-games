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
  let chosen = $state(-1); // index of wrong pick (shake) / tapped side for compare
  let reveal = $state(false); // briefly show correct answer after a miss
  let answered = $state(false); // one score per question, no double-tap
  let correct = $state(0);
  let streak = $state(0);
  let milestone = $state(false);
  let bestStreak = $state(
    (typeof localStorage !== 'undefined' && parseInt(localStorage.getItem('emoji-math-best-streak') || '0', 10)) || 0
  );
  let timers = [];
  let pausedMid = false;

  function clearTimers() {
    for (const t of timers) clearTimeout(t);
    timers = [];
  }

  function next(seedOffset = Date.now() % 100000) {
    clearTimers();
    milestone = false;
    question = makeQuestion($settings.ageLevel, seedOffset);
    chosen = -1;
    reveal = false;
    answered = false;
  }

  function answer(idx) {
    if (!question || chosen !== -1 || reveal || answered) return;
    const isRight =
      question.type === 'compare'
        ? idx === question.answer
        : Number(question.options[idx]) === question.answer;
    if (isRight) {
      answered = true;
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
      }
      timers.push(setTimeout(() => next((Date.now() + correct * 31) % 100000), milestone ? 1500 : 450));
    } else {
      // silent shake + reveal the correct answer, then move on — no penalty
      chosen = idx;
      reveal = true;
      streak = 0;
      timers.push(setTimeout(() => next((Date.now() + correct * 17) % 100000), 1400));
    }
  }

  // Hiding the app must never strand the round: freeze any pending advance and
  // resume on return; an open, unanswered question simply stays open.
  function visibility() {
    if (document.hidden) {
      if (timers.length > 0) {
        clearTimers();
        pausedMid = true;
      }
    } else if (pausedMid) {
      pausedMid = false;
      next();
    }
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
          <div class="compare" data-testid="compare">
            {#each question.groups as g, gi}
              <button
                class="side"
                class:shake={chosen === gi}
                class:reveal-correct={reveal && gi === question.answer}
                onclick={() => answer(gi)}
                data-testid="compare-side-{gi}"
              >
                <span class="cluster">{groupEmoji(g)}</span>
              </button>
            {/each}
          </div>
          <p class="prompt">{$_('whichMore')}</p>
        {:else}
          <p class="expression" data-testid="expression">
            {#each question.groups as g, gi}
              {#if gi > 0}<span class="op">{question.op}</span>{/if}<span class="cluster">{groupEmoji(g)}</span>
            {/each}
            <span class="op">=</span><span class="qmark">❓</span>
          </p>
        {/if}
      </div>

      {#if question.type !== 'compare'}
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
  .compare { display: flex; gap: 24px; justify-content: center; }
  .side {
    min-width: calc(var(--touch-min) * 1.6);
    min-height: calc(var(--touch-min) * 1.4);
    padding: 12px 18px;
    border-radius: 24px;
    background: var(--panel-glass);
    border: 2px solid var(--panel-border);
    transition: transform 0.12s;
  }
  .side:active { transform: scale(0.95); }
  .side.shake { animation: fxWobble 0.4s ease-in-out; opacity: 0.7; }
  .side.reveal-correct { box-shadow: 0 0 24px #7ee787; border-color: #7ee787; }
  .cluster { display: block; font-size: 34px; line-height: 1.6; max-width: 300px; word-break: break-all; margin: 0; }
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
