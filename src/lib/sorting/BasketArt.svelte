<script>
  // Woven basket with a painted category sign.
  let { sign = { kind: 'swatch', value: '#E4572E' }, size = 92 } = $props();
</script>

<svg
  viewBox="0 0 96 100"
  width={size}
  height={(size * 100) / 96}
  aria-hidden="true"
  fill="none"
  stroke="#3A271B"
  stroke-width="2.5"
  stroke-linejoin="round"
  stroke-linecap="round"
>
  <ellipse cx="48" cy="44" rx="35" ry="11" fill="#5E3A22" />
  <path d="M15 44h66l-7 38a10 10 0 0 1-10 9H32a10 10 0 0 1-10-9z" fill="#A9702F" />
  <path d="M23 60h50M25 74h46M29 86h38" stroke="#6B4326" stroke-width="2" opacity=".55" />
  <path d="M35 47 32 89M48 47v42M61 47l3 42" stroke="#6B4326" stroke-width="2" opacity=".45" />
  <rect x="27" y="8" width="42" height="38" rx="11" fill="#FFF8EC" />
  <g class="basket-sign">
    {#if sign.kind === 'swatch'}
      <circle class="sign-swatch" cx="48" cy="27" r="12" fill={sign.value} stroke-width="2" />
      <ellipse cx="43" cy="22" rx="4" ry="2.6" fill="#fff" opacity=".45" stroke="none" />
    {:else}
      <g class="sign-shape" transform="translate(37 16) scale(0.92)">
        <path d={sign.value} fill="#F2C14E" stroke-width="2.4" />
      </g>
    {/if}
  </g>
  <path d="M15 44h66" stroke-width="3" />
</svg>
