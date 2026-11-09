<script>
  // Flat pond and trinket art for the Rising Pond. Inline SVG only: no emoji
  // ever lands on the play surface.
  let { id = 'fish', size = 24 } = $props();
  const outline = '#2A2035';
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
  {#if id === 'fish'}
    <path d="M8 32c8-12 24-16 36-8 4 3 8 6 12 8-4 2-8 5-12 8-12 8-28 4-36-8z" fill="#F2A03D" />
    <path d="M44 32 58 22v20z" fill="#E4572E" />
    <circle cx="20" cy="29" r="2.4" fill={outline} stroke="none" />
    <path d="M28 34c3 3 7 3 10 0" />
  {:else if id === 'starfish'}
    <path d="M32 6 40 24 60 26 45 39 50 58 32 47 14 58 19 39 4 26 24 24z" fill="#F9A8D4" />
    <circle cx="32" cy="30" r="3" fill="#FFF3E4" stroke="none" />
    <circle cx="24" cy="38" r="1.8" fill="#FFF3E4" stroke="none" />
    <circle cx="40" cy="38" r="1.8" fill="#FFF3E4" stroke="none" />
  {:else if id === 'shell'}
    <path d="M32 54C14 54 8 36 12 18c14 2 26 12 20 36z" fill="#F6C9A8" />
    <path d="M32 54c18 0 24-18 20-36-14 2-26 12-20 36z" fill="#FBE0C8" />
    <path d="M32 54V22M20 26c-2 10 0 20 6 26M44 26c2 10 0 20-6 26" stroke="#D99A6C" stroke-width="2" />
  {:else if id === 'flower'}
    <circle cx="32" cy="32" r="7" fill="#F2C14E" />
    <g fill="#F9A8D4">
      <circle cx="32" cy="16" r="9" />
      <circle cx="32" cy="48" r="9" />
      <circle cx="16" cy="32" r="9" />
      <circle cx="48" cy="32" r="9" />
    </g>
    <circle cx="32" cy="32" r="4" fill="#FFF3E4" stroke="none" />
  {:else if id === 'butterfly'}
    <path d="M32 32C22 12 4 14 6 28c1 10 14 12 26 4z" fill="#C4B5FD" />
    <path d="M32 32c10-20 28-18 26-4-1 10-14 12-26 4z" fill="#A78BFA" />
    <path d="M32 32C20 46 10 50 8 42c-2-8 10-14 24-10z" fill="#7FD8FF" />
    <path d="M32 32c12 14 22 18 24 10 2-8-10-14-24-10z" fill="#60C4F0" />
    <path d="M32 26v20" stroke={outline} stroke-width="3" />
  {:else if id === 'lily'}
    <path d="M32 34c18 0 28 8 24 16-5 9-38 9-48 2-8-6 2-18 24-18z" fill="#57A773" />
    <path d="M32 34 24 22l8 12" fill="#57A773" />
    <circle cx="26" cy="30" r="5" fill="#F9A8D4" />
    <circle cx="26" cy="30" r="2" fill="#FFF3E4" stroke="none" />
  {:else if id === 'reed'}
    <path d="M20 58V26M32 58V18M44 58V30" stroke="#3E8E5A" stroke-width="4" />
    <path
      d="M20 26c-4-4-4-10 0-14 4 4 4 10 0 14zM32 18c-4-4-4-10 0-14 4 4 4 10 0 14zM44 30c-4-4-4-10 0-14 4 4 4 10 0 14z"
      fill="#57A773"
    />
  {:else if id === 'star'}
    <path d="M32 6 39.5 24 59 25.5 44 38.5 48.5 57.5 32 47 15.5 57.5 20 38.5 5 25.5 24.5 24z" fill="#F2C14E" />
  {:else}
    <circle cx="32" cy="32" r="18" fill="#C9B79C" />
  {/if}
</svg>
