<script>
  // The pier cat with a brass magnifier. It watches both pictures, bobs slowly,
  // and perks an ear, swishes its tail and lifts the glass when a difference is
  // found. Never a tap target, and the reaction is suppressed under reduced
  // motion.
  import { onDestroy } from 'svelte';

  let { reduced = false, react = 0 } = $props();

  let reacting = $state(false);
  let timer = null;
  let lastReact = 0;

  $effect(() => {
    const value = react;
    if (value <= 0 || value === lastReact) return;
    lastReact = value;
    if (reduced) {
      reacting = false;
      return;
    }
    reacting = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      reacting = false;
    }, 750);
  });

  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });
</script>

<div
  class="cat"
  class:calm={reduced}
  data-reacting={reacting ? 'true' : 'false'}
  aria-hidden="true"
>
  <div class="cat-art" class:reacting>
    <svg viewBox="0 0 80 80" width="100%" height="auto" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="34" cy="73" rx="19" ry="4.5" fill="rgba(0,0,0,0.18)" stroke="none" />
      <g class="tail">
        <path d="M14 62c-8-4-8-16 2-18" stroke="#D9823B" stroke-width="6" />
      </g>
      <ellipse cx="35" cy="57" rx="16" ry="14" fill="#E8954A" stroke="#2A2035" stroke-width="1.6" />
      <circle cx="38" cy="37" r="16" fill="#F2A65A" stroke="#2A2035" stroke-width="1.6" />
      <g class="ear">
        <path d="M26 27l-3-13 13 7z" fill="#F2A65A" stroke="#2A2035" stroke-width="1.6" />
        <path d="M50 27l3-13-13 7z" fill="#F2A65A" stroke="#2A2035" stroke-width="1.6" />
        <path d="M27 24l-1-6 6 3z" fill="#E88A8A" stroke="none" />
        <path d="M49 24l1-6-6 3z" fill="#E88A8A" stroke="none" />
      </g>
      <circle cx="32" cy="35" r="2.5" fill="#2A2035" stroke="none" />
      <circle cx="44" cy="35" r="2.5" fill="#2A2035" stroke="none" />
      <path d="M36 41h4l-2 2.4z" fill="#C96A4A" stroke="none" />
      <path d="M29 41l-8-1M29 44l-7 2M47 41l8-1M47 44l7 2" stroke="#2A2035" stroke-width="1" opacity="0.45" />
      <g class="glass">
        <circle cx="63" cy="49" r="10" fill="rgba(200,240,255,0.28)" stroke="#8A5A34" stroke-width="3" />
        <path d="M70 56l6 7" stroke="#6B4326" stroke-width="4.5" />
        <path d="M58 45a6 6 0 0 1 5-3" stroke="#FFF8EC" stroke-width="1.6" opacity="0.8" />
      </g>
    </svg>
  </div>
</div>

<style>
  .cat {
    position: absolute;
    right: 1.5%;
    bottom: 1.5%;
    width: clamp(38px, 13vw, 56px);
    z-index: 6;
    pointer-events: none;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25));
    animation: bob 3.4s ease-in-out infinite;
  }
  .cat.calm {
    animation: none;
  }
  .cat.calm .cat-art.reacting,
  .cat.calm .cat-art.reacting .ear,
  .cat.calm .cat-art.reacting .tail,
  .cat.calm .cat-art.reacting .glass {
    animation: none;
  }
  .cat-art {
    width: 100%;
  }
  .cat-art.reacting {
    animation: catPerk 0.75s ease-out;
  }
  .cat-art.reacting .ear {
    animation: earPerk 0.75s ease-out;
    transform-box: view-box;
    transform-origin: 38px 30px;
  }
  .cat-art.reacting .tail {
    animation: tailPerk 0.75s ease-out;
    transform-box: view-box;
    transform-origin: 16px 58px;
  }
  .cat-art.reacting .glass {
    animation: glassPerk 0.75s ease-out;
    transform-box: view-box;
    transform-origin: 63px 49px;
  }
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }
  @keyframes catPerk {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    30% { transform: translateY(-2px) rotate(-1.5deg); }
    65% { transform: translateY(-1px) rotate(1deg); }
  }
  @keyframes earPerk {
    0%, 100% { transform: rotate(0deg); }
    30% { transform: rotate(-7deg); }
    60% { transform: rotate(4deg); }
  }
  @keyframes tailPerk {
    0%, 100% { transform: rotate(0deg); }
    35% { transform: rotate(8deg); }
    70% { transform: rotate(-4deg); }
  }
  @keyframes glassPerk {
    0%, 100% { transform: rotate(0deg) translate(0, 0); }
    40% { transform: rotate(-10deg) translate(-1px, -2px); }
    75% { transform: rotate(4deg) translate(0, 0); }
  }
</style>
