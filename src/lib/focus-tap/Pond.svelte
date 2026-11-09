<script>
  // The moonlit pond backdrop for Pond Catch. Decorative only: the route owns
  // the stream, the tongue and the docks. Fireflies drift unless the child
  // asked for reduced motion.
  let { reduced = false } = $props();

  const PADS = [
    { x: 15, y: 84, s: 58, r: -8 },
    { x: 76, y: 91, s: 66, r: 6 },
    { x: 46, y: 98, s: 52, r: 0 },
    { x: 90, y: 72, s: 44, r: 12 },
    { x: 31, y: 66, s: 34, r: -4 }
  ];
  const REEDS = [
    { x: 4, y: 64, s: 46 },
    { x: 96, y: 58, s: 42 },
    { x: 88, y: 86, s: 34 },
    { x: 10, y: 94, s: 30 }
  ];
  const FLIES = [
    { x: 17, y: 20, d: 0 },
    { x: 39, y: 33, d: -1.4 },
    { x: 64, y: 16, d: -2.6 },
    { x: 84, y: 38, d: -3.8 },
    { x: 54, y: 56, d: -5 },
    { x: 12, y: 49, d: -6.2 }
  ];
</script>

<div class="pond-art" aria-hidden="true">
  <div class="sky-glow"></div>
  <div class="moon"></div>
  <div class="moon-reflection"></div>
  <div class="water"></div>

  <div class="ripples">
    <span class="ripple r1"></span>
    <span class="ripple r2"></span>
    <span class="ripple r3"></span>
  </div>

  <div class="shore">
    {#each PADS as pad, i (i)}
      <span
        class="pad"
        style:left="{pad.x}%"
        style:top="{pad.y}%"
        style:width="{pad.s}px"
        style:height="{pad.s * 0.32}px"
        style:transform="translate(-50%, -50%) rotate({pad.r}deg)"
      ></span>
    {/each}
    {#each REEDS as reed, i (i)}
      <span
        class="reed"
        style:left="{reed.x}%"
        style:top="{reed.y}%"
        style:height="{reed.s}px"
      ></span>
    {/each}
  </div>

  {#if !reduced}
    <div class="fireflies" data-testid="fireflies">
      {#each FLIES as fly, i (i)}
        <span
          class="firefly"
          style:left="{fly.x}%"
          style:top="{fly.y}%"
          style:animation-delay="{fly.d}s"
        ></span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .pond-art {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    background:
      radial-gradient(74% 42% at 50% 4%, rgba(255, 227, 163, 0.2), transparent 64%),
      radial-gradient(80% 46% at 50% 102%, rgba(127, 216, 255, 0.16), transparent 70%),
      linear-gradient(180deg, #182641 0%, #1d3a4a 44%, #14403a 100%);
  }
  .sky-glow {
    position: absolute;
    left: 50%;
    top: -26%;
    width: 82%;
    height: 66%;
    transform: translateX(-50%);
    background: radial-gradient(closest-side, rgba(255, 227, 163, 0.2), transparent 72%);
  }
  .moon {
    position: absolute;
    top: 6%;
    right: 13%;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: #ffe3a3;
    box-shadow:
      0 0 26px 9px rgba(255, 227, 163, 0.24),
      0 0 70px 22px rgba(255, 227, 163, 0.1);
    opacity: 0.9;
  }
  .moon-reflection {
    position: absolute;
    top: 26%;
    right: 14%;
    width: 12px;
    height: 34%;
    border-radius: 50%;
    background: linear-gradient(180deg, rgba(255, 227, 163, 0.34), transparent 86%);
    filter: blur(4px);
    opacity: 0.55;
  }
  .water {
    position: absolute;
    inset: 42% 0 0 0;
    background: repeating-linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.045) 0 24px,
      transparent 24px 48px
    );
    opacity: 0.55;
  }
  .ripples {
    position: absolute;
    inset: 0;
  }
  .ripple {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(196, 245, 255, 0.2);
    transform: translate(-50%, -50%);
  }
  .r1 {
    left: 44%;
    top: 58%;
    width: 96px;
    height: 26px;
  }
  .r2 {
    left: 58%;
    top: 48%;
    width: 62px;
    height: 17px;
  }
  .r3 {
    left: 28%;
    top: 42%;
    width: 44px;
    height: 12px;
  }
  .shore {
    position: absolute;
    inset: 0;
  }
  .pad {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 38% 32%, #57a773, #3e8e5a 68%);
    box-shadow:
      inset 0 2px 6px rgba(255, 255, 255, 0.14),
      0 4px 8px rgba(0, 0, 0, 0.24);
    opacity: 0.92;
  }
  .pad::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 12%;
    height: 70%;
    transform: translate(-50%, -50%) rotate(24deg);
    background: rgba(20, 64, 58, 0.55);
    clip-path: polygon(50% 0, 100% 100%, 0 100%);
  }
  .reed {
    position: absolute;
    width: 4px;
    border-radius: 2px;
    background: #3e8e5a;
    transform: translate(-50%, -100%) rotate(3deg);
    opacity: 0.78;
  }
  .reed::before,
  .reed::after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 4px;
    height: 72%;
    border-radius: 2px;
    background: #57a773;
    transform-origin: bottom;
  }
  .reed::before {
    left: -9px;
    transform: rotate(-10deg);
  }
  .reed::after {
    left: 9px;
    transform: rotate(10deg);
  }
  .fireflies {
    position: absolute;
    inset: 0;
  }
  .firefly {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #ffe3a3;
    box-shadow: 0 0 10px 3px rgba(255, 214, 140, 0.5);
    animation: drift 7s ease-in-out infinite;
  }
  .firefly:nth-child(2n) {
    animation-duration: 9s;
  }
  @keyframes drift {
    0%,
    100% {
      transform: translate(0, 0);
      opacity: 0.2;
    }
    40% {
      transform: translate(10px, -18px);
      opacity: 0.9;
    }
    70% {
      transform: translate(-8px, -28px);
      opacity: 0.5;
    }
  }
</style>
