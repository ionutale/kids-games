<script>
  // The one win-overlay action row for every ladder game:
  // Next Level ▶ (replaced by 🎓 at the top of the ladder), Replay, Back.
  // Defaults navigate the /games/{id}/play/{n} routes; games with local level
  // state pass onnext/onreplay callbacks instead.
  import { goto } from '$app/navigation';
  import { _ } from '$lib/stores/locale';
  import { MAX_LEVEL, saveMastered } from '$lib/ladder/progress.js';
  import { fanfare } from '$lib/sounds/trainerSounds.js';

  let {
    gameId,
    level,
    pitch = null,
    backHref = `/games/${gameId}`,
    nextHref = `/games/${gameId}/play/${level + 1}`,
    replayHref = `/games/${gameId}/play/${level}`,
    onnext = null,
    onreplay = null
  } = $props();

  // Rendered only when the round is won: finishing the top level masters the ladder.
  $effect(() => {
    if (level >= MAX_LEVEL) saveMastered(gameId);
  });

  function next(e) {
    if (onnext) return onnext(e);
    e.preventDefault();
    if (pitch != null) fanfare(pitch);
    goto(nextHref);
  }

  function replay(e) {
    if (onreplay) return onreplay(e);
    e.preventDefault();
    goto(`${replayHref}?seed=${Date.now() % 1000000}`);
  }
</script>

{#if level < MAX_LEVEL}
  <a class="big-btn primary" href={nextHref} data-testid="next-level" onclick={next}>
    {$_('nextLevel')} ▶
  </a>
{:else}
  <p class="ladder-done" data-testid="ladder-done">🎓</p>
{/if}
<a class="big-btn ghost" href={replayHref} data-testid="replay" onclick={replay}>
  {$_('replay')}
</a>
<a class="big-btn ghost" href={backHref}>{$_('back')}</a>

<style>
  .ladder-done { font-size: 40px; margin: 0; }
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
    text-decoration: none;
    transition: transform 0.15s;
  }
  .big-btn:active { transform: scale(0.95); }
  .primary {
    color: #062033;
    background: var(--btn-gradient);
    box-shadow: 0 4px 18px rgba(91, 194, 240, 0.5);
  }
  .ghost {
    color: var(--text-lo);
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
  }
</style>
