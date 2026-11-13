<script>
  import ColoringSheet from '../ColoringSheet.svelte';
  import {
    OCEAN_VIEWBOX,
    OCEAN_REGIONS,
    OCEAN_LINES,
    OCEAN_DOTS,
    OCEAN_SMILES
  } from './ocean.js';

  let { fills = {}, layer = 'all' } = $props();
</script>

<ColoringSheet
  {fills}
  {layer}
  viewbox={OCEAN_VIEWBOX}
  regions={OCEAN_REGIONS}
  lines={OCEAN_LINES}
  dots={OCEAN_DOTS}
  smiles={OCEAN_SMILES}
/>
