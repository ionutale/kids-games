<script>
  import ColoringSheet from '../ColoringSheet.svelte';
  import {
    CASTLE_VIEWBOX,
    CASTLE_REGIONS,
    CASTLE_LINES,
    CASTLE_DOTS,
    CASTLE_SMILES
  } from './castle.js';

  let { fills = {}, layer = 'all' } = $props();
</script>

<ColoringSheet
  {fills}
  {layer}
  viewbox={CASTLE_VIEWBOX}
  regions={CASTLE_REGIONS}
  lines={CASTLE_LINES}
  dots={CASTLE_DOTS}
  smiles={CASTLE_SMILES}
/>
