<script>
  // Picture progress without digits: one token per difference in this puzzle
  // and one slot per picture in the five-picture set.
  let { found = 0, total = 0, step = 0, steps = 5, label = '' } = $props();
</script>

<div class="hud" data-testid="spot-progress" role="img" aria-label={label}>
  <div class="tokens" aria-hidden="true">
    {#each Array(Math.max(0, total)) as _, i (i)}
      <span class="token" class:on={i < found}></span>
    {/each}
  </div>
  <div class="strip" aria-hidden="true">
    {#each Array(Math.max(0, steps)) as _, i (i)}
      <span class="slot" class:done={i < step}></span>
    {/each}
  </div>
</div>

<style>
  .hud {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 12px;
    background: var(--panel-glass);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(6px);
  }
  .tokens,
  .strip {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .token {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 2px solid rgba(255, 212, 121, 0.5);
    background: transparent;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .token.on {
    background: #ffd479;
    border-color: #ffd479;
    box-shadow: 0 0 7px rgba(255, 212, 121, 0.8);
  }
  .slot {
    width: 13px;
    height: 9px;
    border-radius: 2px;
    border: 1px solid rgba(255, 248, 236, 0.4);
    background: rgba(255, 248, 236, 0.08);
    transition: background 0.2s, border-color 0.2s;
  }
  .slot.done {
    background: linear-gradient(135deg, #57c785, #9fe6b8);
    border-color: #57c785;
  }
</style>
