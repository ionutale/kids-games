<script>
  // Flat stadium cast for the Night Penalty. Every mark is inline SVG, so the
  // pitch never depends on an emoji font.
  let { id = 'ball', size = 48, ...rest } = $props();
  const ink = '#2A2035';
  const gold = '#F2C14E';
</script>

<svg
  viewBox="0 0 64 64"
  width={size}
  height={size}
  aria-hidden="true"
  fill="none"
  stroke={ink}
  stroke-width="2.4"
  stroke-linejoin="round"
  stroke-linecap="round"
  {...rest}
>
  {#if id === 'ball'}
    <circle cx="32" cy="32" r="24" fill="#FFF8EC" />
    <path d="M32 20l10 7-4 12H26l-4-12z" fill={ink} stroke="none" />
    <path d="M32 8v12M56 26l-14 1M48 52l-10-13M16 52l10-13M8 26l14 1" stroke={ink} stroke-width="3" />
  {:else if id === 'striker'}
    <circle cx="32" cy="14" r="8" fill="#F2C9A0" />
    <path d="M24 12c1-6 7-8 12-5 3 2 4 5 3 8-3-3-8-4-15-3z" fill="#4A2E1B" stroke="none" />
    <path d="M22 24h20l3 14H19z" fill="#E4572E" />
    <path d="M20 38h24l-2 9H22z" fill={ink} />
    <path d="M24 47v10M40 47v10" stroke="#F2C9A0" stroke-width="6" />
    <path d="M20 58h8M38 58h8" stroke={ink} stroke-width="4" />
    <path d="M44 28l9-5" stroke="#F2C9A0" stroke-width="5" />
    <path d="M14 30l-5 9" stroke="#E4572E" stroke-width="5" />
  {:else if id === 'bear'}
    <circle cx="20" cy="18" r="7" fill="#A9702F" />
    <circle cx="44" cy="18" r="7" fill="#A9702F" />
    <circle cx="32" cy="24" r="14" fill="#C98A5E" />
    <ellipse cx="32" cy="30" rx="8" ry="6" fill="#F2C9A0" />
    <circle cx="27" cy="22" r="2" fill={ink} stroke="none" />
    <circle cx="37" cy="22" r="2" fill={ink} stroke="none" />
    <circle cx="32" cy="28" r="2.4" fill={ink} stroke="none" />
    <path d="M32 40v12" stroke="#C98A5E" stroke-width="12" />
    <circle cx="16" cy="42" r="8" fill={gold} />
    <circle cx="48" cy="42" r="8" fill={gold} />
  {:else if id === 'glove'}
    <path
      d="M20 54V28a6 6 0 0 1 12 0v10h4V22a6 6 0 0 1 12 0v20h4v-6a5 5 0 0 1 10 0v14c0 8-6 12-14 12H34c-8 0-12-4-14-8z"
      fill={gold}
    />
    <path d="M22 40h22" stroke="#C99A2E" stroke-width="2" />
  {:else if id === 'star'}
    <path d="M32 6 39.5 24 59 25.5 44 38.5 48.5 57.5 32 47 15.5 57.5 20 38.5 5 25.5 24.5 24z" fill={gold} stroke="#C99A2E" stroke-width="1.6" />
  {:else if id === 'star-outline'}
    <path d="M32 6 39.5 24 59 25.5 44 38.5 48.5 57.5 32 47 15.5 57.5 20 38.5 5 25.5 24.5 24z" fill="none" stroke="#8C7CA6" stroke-width="2.4" />
  {:else}
    <circle cx="32" cy="32" r="18" fill="#C9B79C" />
  {/if}
</svg>
