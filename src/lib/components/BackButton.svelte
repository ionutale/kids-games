<script>
  import { goto } from '$app/navigation';

  let { to = '/' } = $props();

  function goBack() {
    goto(to);
  }
</script>

<button
  class="back-btn"
  onclick={goBack}
  aria-label="Back to games"
>
  <span class="arrow">&#8592;</span>
</button>

<style>
  .back-btn {
    position: relative;
    width: var(--touch-min);
    height: var(--touch-min);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255,255,255,0.8);
    font-size: 28px;
  }
</style>
