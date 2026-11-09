<script>
  // Time as a moon crossing the pond sky. No digits, no ticking: the arc is the
  // countdown and the moon's warm colour softens in the last five seconds.
  let { secondsLeft = 30, total = 30, reduced = false, label = 'Moon timer' } = $props();

  const t = $derived(Math.max(0, Math.min(1, secondsLeft / total)));
  const angle = $derived(Math.PI * (1 - t));
  const cx = $derived(55 + 44 * Math.cos(angle));
  const cy = $derived(52 - 38 * Math.sin(angle));
  const urgent = $derived(secondsLeft <= 5 && secondsLeft > 0);
</script>

<svg
  class="moon"
  class:urgent
  class:still={reduced}
  viewBox="0 0 110 64"
  role="img"
  aria-label={label}
  data-testid="pop-moon"
  data-left={Math.max(0, Math.round(secondsLeft * 10) / 10)}
>
  <path
    d="M11 52a44 38 0 0 1 88 0"
    fill="none"
    stroke="rgba(255,255,255,0.18)"
    stroke-width="6"
    stroke-linecap="round"
  />
  <path
    d="M11 52a44 38 0 0 1 88 0"
    fill="none"
    stroke={urgent ? '#F6B26B' : '#C4B5FD'}
    stroke-width="3"
    stroke-linecap="round"
    stroke-dasharray="150"
    stroke-dashoffset={150 - 150 * t}
    opacity=".75"
  />
  <circle cx={cx} cy={cy} r="13" fill="rgba(255,227,163,0.18)" class="halo" />
  <circle cx={cx} cy={cy} r="9" fill="#FFE3A3" />
  <circle cx={cx - 2.5} cy={cy - 2} r="2.2" fill="#FFF8EC" opacity=".8" />
</svg>

<style>
  .moon {
    display: block;
    width: 110px;
    height: auto;
    overflow: visible;
    flex: 0 0 auto;
  }
  .halo {
    animation: moonBreath 3.4s ease-in-out infinite;
  }
  .urgent .halo {
    animation-duration: 1.6s;
  }
  .still .halo {
    animation: none;
  }
  @keyframes moonBreath {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 1; }
  }
  @media (max-width: 360px) {
    .moon {
      width: 92px;
    }
  }
</style>
