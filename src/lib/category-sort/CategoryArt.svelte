<script>
  // Illustrated badge for one category, drawn as inline SVG.
  let { id = 'animals', size = 44 } = $props();
  const stroke = '#3A271B';
</script>

<svg
  viewBox="0 0 64 64"
  width={size}
  height={size}
  aria-hidden="true"
  fill="none"
  stroke={stroke}
  stroke-width="2.5"
  stroke-linejoin="round"
  stroke-linecap="round"
>
  {#if id === 'animals'}
    <circle cx="32" cy="41" r="12" fill="#C98A5E" />
    <circle cx="17" cy="27" r="6" fill="#C98A5E" />
    <circle cx="29" cy="19" r="6" fill="#C98A5E" />
    <circle cx="43" cy="21" r="6" fill="#C98A5E" />
    <circle cx="53" cy="33" r="5" fill="#C98A5E" />
  {:else if id === 'food'}
    <path d="M32 20c-9-8-24-2-24 14 0 13 11 24 24 24s24-11 24-24c0-16-15-22-24-14z" fill="#E4572E" />
    <path d="M32 20c0-6 2-10 7-12" />
    <path d="M33 13c7-5 13-3 15 1-6 4-12 4-15-1z" fill="#57A773" />
  {:else if id === 'vehicles'}
    <path d="M7 40h50v9H7z" fill="#4E9BD4" />
    <path d="M15 40 21 27h20l7 13" fill="#7FB6E6" />
    <circle cx="18" cy="50" r="6" fill="#3A271B" />
    <circle cx="46" cy="50" r="6" fill="#3A271B" />
    <circle cx="18" cy="50" r="2.4" fill="#FFF8EC" stroke="none" />
    <circle cx="46" cy="50" r="2.4" fill="#FFF8EC" stroke="none" />
  {:else if id === 'nature'}
    <rect x="28" y="38" width="8" height="18" rx="3" fill="#8A5A34" />
    <circle cx="32" cy="24" r="13" fill="#57A773" />
    <circle cx="20" cy="31" r="9" fill="#6FBF8E" />
    <circle cx="44" cy="31" r="9" fill="#6FBF8E" />
  {:else if id === 'clothes'}
    <path d="M22 12h20l8 10-8 5v25H22V27l-8-5z" fill="#F0ABFC" />
    <path d="M27 12c1 4 3 6 5 6s4-2 5-6" />
  {:else if id === 'toys'}
    <circle cx="24" cy="24" r="7" fill="#F2C14E" />
    <circle cx="40" cy="24" r="7" fill="#F2C14E" />
    <circle cx="32" cy="34" r="15" fill="#D99A3E" />
    <circle cx="27" cy="32" r="2.2" fill="#3A271B" stroke="none" />
    <circle cx="37" cy="32" r="2.2" fill="#3A271B" stroke="none" />
    <path d="M28 40c2 2 6 2 8 0" />
  {:else}
    <circle cx="32" cy="32" r="18" fill="#C9B79C" />
  {/if}
</svg>
