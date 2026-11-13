<script>
  import ColoringSheet from '../ColoringSheet.svelte';
  import {
    JUNGLE_VIEWBOX,
    JUNGLE_REGIONS,
    JUNGLE_LINES,
    JUNGLE_DOTS,
    JUNGLE_SMILES
  } from './jungle.js';

  let { fills = {}, layer = 'all' } = $props();
</script>

<ColoringSheet
  {fills}
  {layer}
  viewbox={JUNGLE_VIEWBOX}
  regions={JUNGLE_REGIONS}
  lines={JUNGLE_LINES}
  dots={JUNGLE_DOTS}
  smiles={JUNGLE_SMILES}
/>
