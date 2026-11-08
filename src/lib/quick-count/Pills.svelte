<script>
  // Answer pills: the digit plus that many theme dots. A wrong pill wobbles
  // silently; the play route decides what a correct pill does.
  import { _ } from '#lib/stores/locale.js';

  let {
    options = [],
    theme = { emoji: '🍓' },
    wrong = -1,
    correct = -1,
    groupLabel = $_('qcAnswers'),
    onpick = () => {}
  } = $props();
</script>

<div class="pills" role="group" aria-label={groupLabel} data-testid="pills">
  {#each options as value, i (i)}
    <button
      type="button"
      class="pill"
      class:wobble={wrong === i}
      onclick={() => onpick(i)}
      aria-label={`${value}, ${$_('qcDots', { n: value })}`}
      data-value={value}
      data-testid={value === correct ? 'correct-pill' : 'wrong-pill'}
    >
      <span class="digit" aria-hidden="true">{value}</span>
      <span class="dots" aria-hidden="true">
        {#each Array(value) as _, k (k)}
          <span class="dot">{theme.emoji}</span>
        {/each}
      </span>
    </button>
  {/each}
</div>

<style>
  .pills {
    display: flex;
    justify-content: center;
    gap: clamp(8px, 2.6vw, 12px);
    padding: 4px 8px 10px;
    width: 100%;
  }
  .pill {
    flex: 1;
    max-width: 108px;
    min-height: clamp(76px, 13vh, 92px);
    padding: 6px 4px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background: linear-gradient(160deg, #fff8ec, #ffe9c9);
    border: 3px solid rgba(138, 90, 52, 0.55);
    box-shadow:
      0 5px 0 rgba(90, 58, 34, 0.45),
      0 8px 16px rgba(0, 0, 0, 0.25);
    color: #4a2e1b;
    touch-action: manipulation;
  }
  .pill:active {
    transform: translateY(2px);
    box-shadow: 0 3px 0 rgba(90, 58, 34, 0.45);
  }
  .pill.wobble {
    animation: wobble 0.3s ease-in-out;
  }
  .digit {
    font-size: clamp(24px, 8vw, 30px);
    font-weight: 800;
    line-height: 1;
  }
  .dots {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0;
    font-size: clamp(8px, 2.6vw, 11px);
    line-height: 1;
    max-width: 78px;
  }
  .dot {
    display: inline-block;
  }
  @keyframes wobble {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    50% {
      transform: translateX(5px);
    }
    75% {
      transform: translateX(-2px);
    }
  }
</style>
