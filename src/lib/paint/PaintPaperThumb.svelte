<script>
  import { DINO_VALLEY_VIEWBOX } from './paper/dinoValley.js';
  import { getSheetArt } from './sheetArt.js';

  /** @type {{ sheetId?: string }} */
  let { sheetId = 'blank' } = $props();

  const art = $derived(getSheetArt(sheetId));
  const blankViewBox = `0 0 ${DINO_VALLEY_VIEWBOX.width} ${DINO_VALLEY_VIEWBOX.height}`;
  const PAPER = '#FFFDF6';
  const INK = '#3A2E28';
</script>

{#if art}
  <!-- A clean miniature of the sheet's ink layer: paper-white shapes with the
       charcoal outlines, drawn from the same registry the studio paints on. -->
  <svg
    class="paper-thumb"
    viewBox={`0 0 ${art.viewbox.width} ${art.viewbox.height}`}
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    <rect width={art.viewbox.width} height={art.viewbox.height} fill={PAPER} />
    <g fill={PAPER} stroke={INK} stroke-width="9" stroke-linejoin="round">
      {#each art.regions as region (region.id)}
        <path d={region.d} />
      {/each}
    </g>
    <g fill="none" stroke={INK} stroke-width="4" stroke-linecap="round">
      {#each art.regions as region (region.id)}
        <path d={region.d} />
      {/each}
      {#each art.lines as line}
        <path d={line.d} />
      {/each}
      {#each art.smiles as smile}
        <path d={smile.d} />
      {/each}
    </g>
    <g fill={INK}>
      {#each art.dots as dot}
        <circle cx={dot.cx} cy={dot.cy} r={dot.r} />
      {/each}
    </g>
  </svg>
{:else}
  <svg
    class="paper-thumb"
    viewBox={blankViewBox}
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    <rect width={DINO_VALLEY_VIEWBOX.width} height={DINO_VALLEY_VIEWBOX.height} fill={PAPER} />
    <g fill="none" stroke-linecap="round">
      <path
        d="M 62 512 C 118 402 168 562 232 462 C 276 394 318 482 338 432"
        stroke="#FF8FB1"
        stroke-width="20"
      />
      <path
        d="M 84 642 C 146 570 214 690 306 596"
        stroke="#4FC3F7"
        stroke-width="16"
      />
      <path
        d="M 118 356 C 150 320 196 334 212 372 C 228 410 190 444 150 428 C 120 416 102 384 118 356 Z"
        stroke="#FFD54F"
        stroke-width="18"
      />
    </g>
    <g transform="rotate(-26 300 620)">
      <rect x="272" y="548" width="56" height="126" rx="14" fill="#FF9F43" />
      <rect x="272" y="584" width="56" height="18" fill="#FFF3D1" opacity="0.9" />
      <path d="M 272 674 H 328 L 300 716 Z" fill="#FF6B6B" />
    </g>
  </svg>
{/if}

<style>
  .paper-thumb {
    display: block;
    width: 100%;
    height: 100%;
    background: #fffdf6;
  }
</style>
