<script>
  // Shared renderer for the added coloring sheets. Existing sheets keep their
  // bespoke pages; every new sheet only supplies line-art arrays.
  /**
   * @type {{
   *   viewbox: { width: number, height: number },
   *   regions: Array<{ id: string, d: string }>,
   *   lines?: Array<{ d: string }>,
   *   dots?: Array<{ cx: number, cy: number, r: number }>,
   *   smiles?: Array<{ d: string }>,
   *   fills?: Record<string, string>,
   *   layer?: 'all' | 'fills' | 'ink'
   * }}
   */
  let {
    viewbox,
    regions = [],
    lines = [],
    dots = [],
    smiles = [],
    fills = {},
    layer = 'all'
  } = $props();

  const INK = '#3A2E28';
  const STROKE = 4.5;
  const PAPER = '#FFFEFA';
</script>

<svg
  class="coloring-sheet"
  viewBox={`0 0 ${viewbox.width} ${viewbox.height}`}
  preserveAspectRatio="xMidYMid slice"
  aria-hidden="true"
  focusable="false"
>
  {#if layer !== 'ink'}
    <g class="sheet-fills">
      {#each regions as region (region.id)}
        <path d={region.d} fill={fills?.[region.id] ?? PAPER} data-region={region.id} />
      {/each}
    </g>
  {/if}

  {#if layer !== 'fills'}
    <g
      class="sheet-ink"
      fill="none"
      stroke={INK}
      stroke-width={STROKE}
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      {#each regions as region (region.id)}
        <path d={region.d} data-outline={region.id} />
      {/each}
      {#each lines as line}
        <path d={line.d} />
      {/each}
      {#each smiles as smile}
        <path d={smile.d} stroke-width="3.6" />
      {/each}
      {#each dots as dot}
        <circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={INK} stroke="none" />
      {/each}
    </g>
  {/if}
</svg>

<style>
  .coloring-sheet {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* The ink is decoration on top of the child's paint; it must not swallow taps. */
  .sheet-ink {
    pointer-events: none;
  }
</style>
