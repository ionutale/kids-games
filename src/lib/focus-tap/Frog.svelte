<script>
  // The pond frog: bottom-left, sitting on a lily pad and holding the wooden
  // target sign. Decorative for screen readers; the route announces the target.
  let { target = '🍎' } = $props();
  const ink = '#1F3A2A';
</script>

<div class="frog" aria-hidden="true">
  <div class="sign"><span class="sign-face">{target}</span></div>
  <svg viewBox="0 0 140 110" width="100%" height="auto">
    <ellipse cx="70" cy="99" rx="62" ry="14" fill="#3E8E5A" />
    <path d="M70 99c-34 0-58-6-64-12 12-4 30-4 46 0z" fill="#57A773" opacity=".6" />
    <ellipse cx="70" cy="73" rx="36" ry="26" fill="#57A773" />
    <ellipse cx="70" cy="80" rx="22" ry="15" fill="#86C99C" opacity=".55" />
    <path d="M42 76 Q32 52 28 32" stroke="#57A773" stroke-width="8" fill="none" stroke-linecap="round" />
    <path d="M98 76 Q108 52 112 32" stroke="#57A773" stroke-width="8" fill="none" stroke-linecap="round" />
    <circle cx="28" cy="31" r="6" fill="#57A773" />
    <circle cx="112" cy="31" r="6" fill="#57A773" />
    <circle cx="50" cy="45" r="13" fill="#57A773" />
    <circle cx="90" cy="45" r="13" fill="#57A773" />
    <circle cx="50" cy="43" r="7.5" fill="#FFF8EC" />
    <circle cx="90" cy="43" r="7.5" fill="#FFF8EC" />
    <circle cx="50" cy="44" r="3.2" fill={ink} />
    <circle cx="90" cy="44" r="3.2" fill={ink} />
    <path d="M56 71c6 6 22 6 28 0" stroke={ink} stroke-width="3" fill="none" stroke-linecap="round" />
    <circle cx="61" cy="67" r="2" fill="#C98A5E" opacity=".65" />
    <circle cx="79" cy="67" r="2" fill="#C98A5E" opacity=".65" />
    <path d="M28 88c9-6 27-6 36 0M76 88c9-6 23-6 32 0" stroke={ink} stroke-width="2.4" fill="none" opacity=".45" />
  </svg>
</div>

<style>
  .frog {
    position: relative;
    width: 100%;
    filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.35));
    pointer-events: none;
  }
  .sign {
    position: absolute;
    left: 50%;
    top: -28px;
    z-index: 2;
    transform: translateX(-50%);
    min-width: 48px;
    height: 44px;
    padding: 0 7px;
    border-radius: 10px;
    background: linear-gradient(180deg, #fff8ec, #f3e3c8);
    border: 3px solid #8a5a34;
    box-shadow:
      0 4px 0 rgba(52, 28, 16, 0.45),
      inset 0 -6px 0 rgba(138, 90, 52, 0.12);
    display: grid;
    place-items: center;
  }
  .sign-face {
    font-size: 26px;
    line-height: 1;
    filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.6));
  }
</style>
