<script>
  // The pier cat with a brass magnifier. It watches both pictures, bobs slowly,
  // and gives the child a friend in the scene. Never a tap target.
  let { reduced = false } = $props();
</script>

<div class="cat" class:calm={reduced} aria-hidden="true">
  <svg viewBox="0 0 80 80" width="100%" height="auto" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="34" cy="73" rx="19" ry="4.5" fill="rgba(0,0,0,0.18)" stroke="none" />
    <path d="M14 62c-8-4-8-16 2-18" stroke="#D9823B" stroke-width="6" />
    <ellipse cx="35" cy="57" rx="16" ry="14" fill="#E8954A" stroke="#2A2035" stroke-width="1.6" />
    <circle cx="38" cy="37" r="16" fill="#F2A65A" stroke="#2A2035" stroke-width="1.6" />
    <path d="M26 27l-3-13 13 7z" fill="#F2A65A" stroke="#2A2035" stroke-width="1.6" />
    <path d="M50 27l3-13-13 7z" fill="#F2A65A" stroke="#2A2035" stroke-width="1.6" />
    <path d="M27 24l-1-6 6 3z" fill="#E88A8A" stroke="none" />
    <path d="M49 24l1-6-6 3z" fill="#E88A8A" stroke="none" />
    <circle cx="32" cy="35" r="2.5" fill="#2A2035" stroke="none" />
    <circle cx="44" cy="35" r="2.5" fill="#2A2035" stroke="none" />
    <path d="M36 41h4l-2 2.4z" fill="#C96A4A" stroke="none" />
    <path d="M29 41l-8-1M29 44l-7 2M47 41l8-1M47 44l7 2" stroke="#2A2035" stroke-width="1" opacity="0.45" />
    <circle cx="63" cy="49" r="10" fill="rgba(200,240,255,0.28)" stroke="#8A5A34" stroke-width="3" />
    <path d="M70 56l6 7" stroke="#6B4326" stroke-width="4.5" />
    <path d="M58 45a6 6 0 0 1 5-3" stroke="#FFF8EC" stroke-width="1.6" opacity="0.8" />
  </svg>
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
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }
</style>
