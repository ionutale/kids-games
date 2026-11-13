<script>
  import ColoringSheet from '../ColoringSheet.svelte';
  import {
    VEHICLES_VIEWBOX,
    VEHICLES_REGIONS,
    VEHICLES_LINES,
    VEHICLES_DOTS,
    VEHICLES_SMILES
  } from './vehicles.js';

  let { fills = {}, layer = 'all' } = $props();
</script>

<ColoringSheet
  {fills}
  {layer}
  viewbox={VEHICLES_VIEWBOX}
  regions={VEHICLES_REGIONS}
  lines={VEHICLES_LINES}
  dots={VEHICLES_DOTS}
  smiles={VEHICLES_SMILES}
/>
