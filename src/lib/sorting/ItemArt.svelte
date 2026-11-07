<script>
  // Flat SVG item art shared by the sorting game. Ids come from data.js.
  let { id = 'apple', size = 56 } = $props();
  const stroke = '#3A271B';
  const sw = 2.5;
</script>

<svg
  viewBox="0 0 64 64"
  width={size}
  height={size}
  class="item-art"
  aria-hidden="true"
  fill="none"
  stroke={stroke}
  stroke-width={sw}
  stroke-linejoin="round"
  stroke-linecap="round"
>
  {#if id === 'apple'}
    <path d="M32 20c-9-8-24-2-24 14 0 13 11 24 24 24s24-11 24-24c0-16-15-22-24-14z" fill="#E4572E" />
    <path d="M32 20c0-6 2-10 7-12" />
    <path d="M33 13c7-5 13-3 15 1-6 4-12 4-15-1z" fill="#57A773" />
    <ellipse cx="21" cy="30" rx="6" ry="4" fill="#fff" opacity=".3" stroke="none" transform="rotate(-25 21 30)" />
  {:else if id === 'heart'}
    <path d="M32 54S8 39 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 15-24 30-24 30z" fill="#E4572E" />
    <ellipse cx="21" cy="27" rx="5" ry="3.5" fill="#fff" opacity=".3" stroke="none" transform="rotate(-30 21 27)" />
  {:else if id === 'sun'}
    <circle cx="32" cy="32" r="14" fill="#F2C14E" />
    <path d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l6 6M46 46l6 6M52 12l-6 6M18 46l-6 6" />
    <circle cx="27" cy="27" r="3" fill="#fff" opacity=".45" stroke="none" />
  {:else if id === 'star'}
    <path d="M32 6 39.5 24 59 25.5 44 38.5 48.5 57.5 32 47 15.5 57.5 20 38.5 5 25.5 24.5 24z" fill="#F2C14E" />
    <circle cx="28" cy="27" r="2.5" fill="#fff" opacity=".45" stroke="none" />
  {:else if id === 'drop'}
    <path d="M32 5C26 17 13 29 13 39a19 19 0 0 0 38 0C51 29 38 17 32 5z" fill="#4E9BD4" />
    <ellipse cx="24" cy="36" rx="4" ry="7" fill="#fff" opacity=".35" stroke="none" transform="rotate(-18 24 36)" />
  {:else if id === 'ball'}
    <circle cx="32" cy="32" r="22" fill="#4E9BD4" />
    <path d="M11 26c14 7 28 7 42 0M11 38c14-7 28-7 42 0" stroke="#FFF8EC" />
    <circle cx="23" cy="22" r="4" fill="#fff" opacity=".35" stroke="none" />
  {:else if id === 'leaf'}
    <path d="M54 10C30 10 10 26 10 45c0 5 2 9 2 9s5-21 24-29C26 35 20 44 20 51c14 0 34-13 34-41z" fill="#57A773" />
    <path d="M20 51c8-14 18-24 30-30" stroke="#2F6A48" stroke-width="2" />
  {:else if id === 'clover'}
    <g fill="#57A773" stroke="none">
      <circle cx="22" cy="24" r="11" />
      <circle cx="42" cy="24" r="11" />
      <circle cx="22" cy="42" r="11" />
      <circle cx="42" cy="42" r="11" />
    </g>
    <circle cx="32" cy="33" r="5" fill="#7FC79C" stroke="none" />
    <path d="M32 38c0 9 2 14 4 20" stroke="#2F6A48" stroke-width="3" />
  {:else if id === 'square-a'}
    <rect x="12" y="12" width="40" height="40" rx="6" fill="#F2C14E" />
    <rect x="18" y="18" width="12" height="8" rx="3" fill="#fff" opacity=".35" stroke="none" />
  {:else if id === 'square-b'}
    <rect x="12" y="12" width="40" height="40" rx="6" fill="#E39B3C" />
    <rect x="18" y="18" width="12" height="8" rx="3" fill="#fff" opacity=".35" stroke="none" />
  {:else if id === 'circle-a'}
    <circle cx="32" cy="32" r="21" fill="#F2C14E" />
    <circle cx="25" cy="25" r="4" fill="#fff" opacity=".35" stroke="none" />
  {:else if id === 'circle-b'}
    <circle cx="32" cy="32" r="21" fill="#E39B3C" />
    <circle cx="25" cy="25" r="4" fill="#fff" opacity=".35" stroke="none" />
  {:else if id === 'triangle-a'}
    <path d="M32 8 57 53H7z" fill="#F2C14E" />
    <path d="M26 24 32 35 38 24z" fill="#fff" opacity=".3" stroke="none" />
  {:else if id === 'triangle-b'}
    <path d="M32 8 57 53H7z" fill="#E39B3C" />
    <path d="M26 24 32 35 38 24z" fill="#fff" opacity=".3" stroke="none" />
  {:else if id === 'diamond-a'}
    <path d="M32 5 59 32 32 59 5 32z" fill="#F2C14E" />
    <path d="M24 22 32 14l8 8-8 8z" fill="#fff" opacity=".3" stroke="none" />
  {:else if id === 'diamond-b'}
    <path d="M32 5 59 32 32 59 5 32z" fill="#E39B3C" />
    <path d="M24 22 32 14l8 8-8 8z" fill="#fff" opacity=".3" stroke="none" />
  {:else}
    <circle cx="32" cy="32" r="20" fill="#C9B79C" />
  {/if}
</svg>

<style>
  .item-art {
    display: block;
    overflow: visible;
    filter: drop-shadow(0 3px 3px rgba(40, 24, 12, 0.28));
  }
</style>
