<script>
  // Flat inline SVG art for the Forest Road. No emoji on the game surface.
  let { id = 'fox', size = 44 } = $props();
  const outline = '#3A271B';
</script>

<svg
  viewBox="0 0 64 64"
  width={size}
  height={size}
  aria-hidden="true"
  fill="none"
  stroke={outline}
  stroke-width="2.4"
  stroke-linejoin="round"
  stroke-linecap="round"
>
  {#if id === 'fox'}
    <path d="M12 48c-5-3-7-10-3-15 6 2 10 8 10 15z" fill="#E07A3F" />
    <ellipse cx="32" cy="48" rx="11" ry="11" fill="#E07A3F" />
    <ellipse cx="32" cy="50" rx="6" ry="7" fill="#FFF3E4" />
    <path d="M26 58v4M38 58v4" stroke={outline} stroke-width="2.6" />
    <path d="M18 34c-3-9-1-16 3-20l7 7 4-9 4 9 7-7c4 4 6 11 3 20-3 8-9 12-14 12s-11-4-14-12z" fill="#E07A3F" />
    <path d="M24 36c2 8 6 10 8 10s6-2 8-10z" fill="#FFF3E4" />
    <circle cx="26" cy="34" r="2" fill={outline} stroke="none" />
    <circle cx="38" cy="34" r="2" fill={outline} stroke="none" />
    <circle cx="32" cy="42" r="2.2" fill={outline} stroke="none" />
  {:else if id === 'home'}
    <path d="M10 30 32 12l22 18v24H10z" fill="#C98A5E" />
    <path d="M6 30 32 8l26 22" fill="#E4572E" />
    <rect x="26" y="38" width="12" height="16" rx="2" fill="#6B4326" />
    <rect x="15" y="34" width="7" height="7" rx="1.5" fill="#FFE3A3" />
  {:else if id === 'dest'}
    <path d="M10 30 32 12l22 18v24H10z" fill="#8FB59B" />
    <path d="M6 30 32 8l26 22" fill="#57A773" />
    <rect x="26" y="38" width="12" height="16" rx="2" fill="#3A271B" />
    <path d="M46 10v18" stroke="#6B4326" stroke-width="3" />
    <path d="M46 10h12l-3 5 3 5H46z" fill="#F2C14E" />
  {:else if id === 'rock'}
    <path d="M12 46 20 24l14-8 16 12 4 18-12 8H22z" fill="#8F8C97" />
    <path d="M24 26l8 8-4 10" stroke="#6C6975" stroke-width="2" />
  {:else if id === 'pond'}
    <ellipse cx="32" cy="38" rx="26" ry="14" fill="#4E9BD4" />
    <ellipse cx="32" cy="35" rx="18" ry="8" fill="#7FB6E6" />
    <path d="M14 38c6 3 30 3 36 0" stroke="#FFF8EC" stroke-width="2" opacity=".5" />
  {:else if id === 'hedge'}
    <circle cx="18" cy="40" r="12" fill="#57A773" />
    <circle cx="32" cy="34" r="14" fill="#6FBF8E" />
    <circle cx="46" cy="40" r="12" fill="#57A773" />
    <rect x="16" y="46" width="32" height="8" rx="3" fill="#6B4326" />
  {:else if id === 'star'}
    <path d="M32 6 39.5 24 59 25.5 44 38.5 48.5 57.5 32 47 15.5 57.5 20 38.5 5 25.5 24.5 24z" fill="#F2C14E" />
  {:else if id === 'tree'}
    <rect x="28" y="38" width="8" height="18" rx="3" fill="#6B4326" />
    <circle cx="32" cy="26" r="15" fill="#3E8E5A" />
    <circle cx="20" cy="32" r="9" fill="#57A773" />
    <circle cx="44" cy="32" r="9" fill="#57A773" />
  {:else if id === 'mushroom'}
    <rect x="27" y="34" width="10" height="20" rx="4" fill="#FFE9C9" />
    <path d="M10 36a22 16 0 0 1 44 0z" fill="#E4572E" />
    <circle cx="23" cy="28" r="3" fill="#FFF3E4" />
    <circle cx="39" cy="30" r="2.4" fill="#FFF3E4" />
  {:else if id === 'hand'}
    <path d="M24 30V16a4 4 0 0 1 8 0v12h4V12a4 4 0 0 1 8 0v18h4v-6a4 4 0 0 1 8 0v16c0 10-7 16-16 16h-4c-8 0-12-4-16-11l-5-8a4 4 0 0 1 7-4z" fill="#FFE3C4" />
  {:else}
    <circle cx="32" cy="32" r="18" fill="#C9B79C" />
  {/if}
</svg>
