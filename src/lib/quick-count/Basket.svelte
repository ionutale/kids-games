<script>
  // The berry basket: one berry lights per correct answer. Decorative for
  // screen readers; the play route owns the progress label.
  import { basketDots } from './layout.js';

  let { filled = 0, goal = 6, reduced = false } = $props();

  const dots = $derived(basketDots(goal));
</script>

<div class="basket" class:reduced aria-hidden="true">
  <div class="berries">
    {#each dots as dot, i (i)}
      <span
        class="berry"
        class:on={i < filled}
        class:pop={i === filled - 1}
        style:left="{dot.left}%"
        style:top="{dot.top}%"
        data-testid="basket-berry"
      ></span>
    {/each}
  </div>
  <div class="body">
    <span class="rim"></span>
    <span class="weave"></span>
  </div>
</div>

<style>
  .basket {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 0.9;
    filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.35));
  }
  .berries {
    position: absolute;
    left: 7%;
    right: 7%;
    top: 4%;
    bottom: 42%;
    z-index: 2;
  }
  .berry {
    position: absolute;
    width: clamp(7px, 2.4vw, 10px);
    height: clamp(7px, 2.4vw, 10px);
    margin: -4px 0 0 -4px;
    border-radius: 50%;
    background: #e4572e;
    border: 1px solid #8f2d14;
    opacity: 0.18;
    transition:
      opacity 0.25s,
      box-shadow 0.25s,
      transform 0.2s;
  }
  .berry.on {
    opacity: 1;
    box-shadow: 0 0 6px rgba(228, 87, 46, 0.6);
  }
  .berry.on.pop {
    animation: berryPop 0.32s ease-out;
  }
  .basket.reduced .berry.on.pop {
    animation: none;
  }
  .body {
    position: absolute;
    left: 4%;
    right: 4%;
    bottom: 4%;
    height: 54%;
    border-radius: 8px 8px 16px 16px;
    background: repeating-linear-gradient(90deg, #c98a5e 0 8px, #a9702f 8px 16px);
    border: 3px solid #5a3a22;
    overflow: hidden;
  }
  .rim {
    position: absolute;
    left: -5%;
    right: -5%;
    top: -7px;
    height: 12px;
    border-radius: 6px;
    background: #8a5a34;
    border: 3px solid #5a3a22;
  }
  .weave {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent 0 12px,
      rgba(90, 58, 34, 0.25) 12px 15px
    );
  }
  @keyframes berryPop {
    0% {
      transform: scale(0.3);
    }
    70% {
      transform: scale(1.35);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
