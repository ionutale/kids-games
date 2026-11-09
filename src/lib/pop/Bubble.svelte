<script>
  // A soap film with one pond trinket inside. The route owns hit-testing, so
  // the bubble itself is never a pointer target: a swipe can cross several.
  import Icons from '#lib/pop/Icons.svelte';

  let {
    id = 0,
    item = 'fish',
    type = 'normal',
    size = 56,
    cracked = false,
    reduced = false,
    label = ''
  } = $props();
</script>

<div
  class="bubble"
  class:giant={type === 'giant'}
  class:star={type === 'star'}
  class:cracked
  class:still={reduced}
  style:width="{size}px"
  style:height="{size}px"
  role="img"
  aria-label={label}
  data-id={id}
  data-type={type}
  data-cracked={cracked}
>
  <span class="film" aria-hidden="true"></span>
  <span class="shine" aria-hidden="true"></span>
  <span class="surprise" aria-hidden="true">
    <Icons id={type === 'star' ? 'star' : item} size={size * (type === 'star' ? 0.44 : 0.4)} />
  </span>
  {#if type !== 'star'}
    <span class="gleam" aria-hidden="true"></span>
  {/if}
  {#if cracked}
    <span class="crack" aria-hidden="true"></span>
  {/if}
</div>

<style>
  .bubble {
    position: relative;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at 30% 26%, rgba(255, 255, 255, 0.95) 0 8%, rgba(255, 255, 255, 0.18) 20%, transparent 44%),
      radial-gradient(circle at 50% 82%, color-mix(in srgb, var(--tint, #7fd8ff) 92%, #fff) 0 12%, color-mix(in srgb, var(--tint, #7fd8ff) 62%, transparent) 46%, transparent 76%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.14), rgba(196, 181, 253, 0.1) 70%);
    border: 3px solid color-mix(in srgb, var(--tint, #7fd8ff) 72%, #fff);
    box-shadow:
      inset -6px -8px 14px color-mix(in srgb, var(--tint, #7fd8ff) 45%, transparent),
      inset 6px 8px 14px rgba(255, 255, 255, 0.35),
      0 8px 20px rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(1px);
    --tint: #7fd8ff;
    animation: pondBob 3.2s ease-in-out infinite;
  }
  .bubble.giant {
    --tint: #ffe3a3;
    border-color: rgba(255, 227, 163, 0.85);
    box-shadow:
      inset -8px -10px 18px rgba(249, 168, 212, 0.3),
      0 0 24px rgba(255, 227, 163, 0.25),
      0 10px 24px rgba(0, 0, 0, 0.3);
  }
  .bubble.star {
    --tint: #f2c14e;
    border-color: rgba(242, 193, 78, 0.95);
    background:
      radial-gradient(circle at 30% 26%, #fff 0 10%, rgba(255, 243, 196, 0.55) 24%, transparent 50%),
      radial-gradient(circle at 50% 55%, rgba(242, 193, 78, 0.45), rgba(249, 168, 212, 0.25) 70%);
    box-shadow:
      0 0 22px rgba(242, 193, 78, 0.5),
      0 8px 20px rgba(0, 0, 0, 0.3);
  }
  .bubble.still {
    animation: none;
  }
  .bubble.cracked {
    animation: crack 0.35s ease-in-out;
  }
  .film {
    position: absolute;
    inset: 10%;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.35);
  }
  .shine {
    position: absolute;
    top: 12%;
    left: 18%;
    width: 28%;
    height: 18%;
    border-radius: 50%;
    background: #fff;
    opacity: 0.7;
    transform: rotate(-30deg);
  }
  .gleam {
    position: absolute;
    right: 18%;
    bottom: 14%;
    width: 12%;
    height: 12%;
    border-radius: 50%;
    background: #fff;
    opacity: 0.45;
  }
  .surprise {
    position: relative;
    display: grid;
    place-items: center;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));
  }
  .crack {
    position: absolute;
    inset: 18%;
    border-radius: 50%;
    background:
      linear-gradient(112deg, transparent 47%, rgba(255, 255, 255, 0.85) 48%, transparent 50%),
      linear-gradient(64deg, transparent 52%, rgba(42, 32, 53, 0.5) 53%, transparent 55%);
  }
  @keyframes pondBob {
    0%, 100% { transform: translateY(0) rotate(-1deg); }
    50% { transform: translateY(-4px) rotate(1deg); }
  }
  @keyframes crack {
    0%, 100% { transform: rotate(0) scale(1); }
    25% { transform: rotate(-4deg) scale(1.04); }
    75% { transform: rotate(4deg) scale(1.04); }
  }
</style>
