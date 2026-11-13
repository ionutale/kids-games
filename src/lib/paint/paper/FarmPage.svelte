<script>
  import ColoringSheet from '../ColoringSheet.svelte';
  import {
    FARM_VIEWBOX,
    FARM_REGIONS,
    FARM_LINES,
    FARM_DOTS,
    FARM_SMILES
  } from './farm.js';

  let { fills = {}, layer = 'all' } = $props();
</script>

<ColoringSheet
  {fills}
  {layer}
  viewbox={FARM_VIEWBOX}
  regions={FARM_REGIONS}
  lines={FARM_LINES}
  dots={FARM_DOTS}
  smiles={FARM_SMILES}
/>
