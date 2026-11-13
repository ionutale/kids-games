<script>
  import ColoringSheet from '../ColoringSheet.svelte';
  import {
    ARCTIC_VIEWBOX,
    ARCTIC_REGIONS,
    ARCTIC_LINES,
    ARCTIC_DOTS,
    ARCTIC_SMILES
  } from './arctic.js';

  let { fills = {}, layer = 'all' } = $props();
</script>

<ColoringSheet
  {fills}
  {layer}
  viewbox={ARCTIC_VIEWBOX}
  regions={ARCTIC_REGIONS}
  lines={ARCTIC_LINES}
  dots={ARCTIC_DOTS}
  smiles={ARCTIC_SMILES}
/>
