<script>
  import ColoringSheet from '../ColoringSheet.svelte';
  import {
    SNOW_VIEWBOX,
    SNOW_REGIONS,
    SNOW_LINES,
    SNOW_DOTS,
    SNOW_SMILES
  } from './snow.js';

  let { fills = {}, layer = 'all' } = $props();
</script>

<ColoringSheet
  {fills}
  {layer}
  viewbox={SNOW_VIEWBOX}
  regions={SNOW_REGIONS}
  lines={SNOW_LINES}
  dots={SNOW_DOTS}
  smiles={SNOW_SMILES}
/>
