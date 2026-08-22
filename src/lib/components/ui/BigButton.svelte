<script>
  let { variant = 'primary', onclick, href = '', children, class: extraClass = '' } = $props();
</script>

{#if href}
  <a class="big-btn {variant} {extraClass}" {href}>
    {@render children?.()}
  </a>
{:else}
  <button class="big-btn {variant} {extraClass}" {onclick}>
    {@render children?.()}
  </button>
{/if}

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
    text-decoration: none;
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
