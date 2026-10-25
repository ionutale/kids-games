<script>
  import {
    DINO_VALLEY_VIEWBOX,
    DINO_VALLEY_REGIONS,
    DINO_VALLEY_LINES,
    DINO_VALLEY_DOTS,
    DINO_VALLEY_SMILES
  } from './dinoValley.js';

  /**
   * @type {{
   *   fills?: Record<string, string>,
   *   layer?: 'all' | 'fills' | 'ink'
   * }}
   * `fills` maps region id -> paint color; unfilled regions stay paper-white so
   * a bucket fill never bleeds into a neighbouring shape.
   * `layer` lets the studio stack the colour fills under the paint canvas and
   * the ink line art above it. `'all'` (default) draws both, e.g. thumbnails.
   */
  let { fills = {}, layer = 'all' } = $props();

  const INK = '#3A2E28';
  const STROKE = 4.5;
  // Every unfilled shape stays paper-white, so a bucket fill never bleeds into
  // a neighbour (e.g. filling the sky leaves the clouds white). Matches the
  // studio paper colour used by the Paint page.
  const PAPER = '#FFFEFA';
</script>

<svg
  class="dino-valley-page"
  viewBox={`0 0 ${DINO_VALLEY_VIEWBOX.width} ${DINO_VALLEY_VIEWBOX.height}`}
  preserveAspectRatio="xMidYMid slice"
  aria-hidden="true"
  focusable="false"
>
  {#if layer !== 'ink'}
    <!-- Fills sit under the ink so the lines stay crisp. -->
    <g class="dv-fills">
      {#each DINO_VALLEY_REGIONS as region (region.id)}
        <path d={region.d} fill={fills?.[region.id] ?? PAPER} data-region={region.id} />
      {/each}
    </g>
  {/if}

  {#if layer !== 'fills'}
    <g
      class="dv-ink"
      fill="none"
      stroke={INK}
      stroke-width={STROKE}
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      <!-- Every region is also an ink outline, so the fills read as a coloring page. -->
      {#each DINO_VALLEY_REGIONS as region (region.id)}
        <path d={region.d} data-outline={region.id} />
      {/each}
      {#each DINO_VALLEY_LINES as line}
        <path d={line.d} />
      {/each}
      {#each DINO_VALLEY_SMILES as smile}
        <path d={smile.d} stroke-width="3.6" />
      {/each}
      {#each DINO_VALLEY_DOTS as dot}
        <circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={INK} stroke="none" />
      {/each}
    </g>
  {/if}
</svg>

<style>
  .dino-valley-page {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* The ink is decoration on top of the child's paint; it must not swallow taps. */
  .dv-ink {
    pointer-events: none;
  }
</style>
